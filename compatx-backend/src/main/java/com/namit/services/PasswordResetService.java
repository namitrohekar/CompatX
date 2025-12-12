package com.namit.services;

import java.time.Instant;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.namit.models.AppUser;
import com.namit.models.PasswordResetToken;
import com.namit.repositories.AppUserRepository;
import com.namit.repositories.PasswordResetTokenRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class PasswordResetService {

    private final PasswordResetTokenRepository tokenRepository;
    private final AppUserRepository userRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.password-reset.expiration}")
    private long resetTokenExpirationMs;

    public void requestPasswordReset(String email) {
        System.out.println("=== Password Reset Request Started ===");
        System.out.println("Email: " + email);

        try {
            AppUser user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            System.out.println("User found: " + user.getUserName());

            // Delete any existing tokens for this user
            tokenRepository.deleteByUser_UserId(user.getUserId());
            System.out.println("Old tokens deleted");

            // Create new token
            PasswordResetToken resetToken = new PasswordResetToken();
            resetToken.setUser(user);
            resetToken.setToken(UUID.randomUUID().toString());
            resetToken.setExpiry(Instant.now().plusMillis(resetTokenExpirationMs));
            resetToken.setUsed(false);

            tokenRepository.save(resetToken);
            System.out.println("Token created: " + resetToken.getToken());

            // Send email
            System.out.println("Attempting to send email...");
            emailService.sendPasswordResetEmail(user.getEmail(), resetToken.getToken());
            System.out.println("Email sent successfully!");
            System.out.println("=== Password Reset Request Completed ===");

        } catch (Exception e) {
            System.err.println("ERROR in requestPasswordReset: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to process password reset request: " + e.getMessage(), e);
        }
    }

    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid reset token"));

        // Verify not expired
        if (resetToken.getExpiry().isBefore(Instant.now())) {
            throw new RuntimeException("Reset token has expired");
        }

        // Verify not already used
        if (resetToken.isUsed()) {
            throw new RuntimeException("Reset token already used");
        }

        // Update password
        AppUser user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Mark token as used
        resetToken.setUsed(true);
        tokenRepository.save(resetToken);
    }
}
