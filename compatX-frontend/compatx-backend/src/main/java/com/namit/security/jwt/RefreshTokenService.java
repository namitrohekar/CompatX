package com.namit.security.jwt;

import java.time.Instant;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.namit.exceptions.InvalidTokenException;
import com.namit.exceptions.TokenExpiredException;
import com.namit.models.AppUser;
import com.namit.models.RefreshToken;
import com.namit.repositories.RefreshTokenRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;

    @Value("${app.jwt.refresh-expiration}")
    private long refreshTokenDurationMs;

    @Value("${app.jwt.refresh-expiration-remember-me}")
    private long refreshTokenRememberMeDurationMs;

    public RefreshToken createRefreshToken(AppUser user) {
        return createRefreshToken(user, false);
    }

    public RefreshToken createRefreshToken(AppUser user, boolean rememberMe) {
        long duration = rememberMe ? refreshTokenRememberMeDurationMs : refreshTokenDurationMs;

        RefreshToken existing = refreshTokenRepository.findByUser(user).orElse(null);

        if (existing != null) {
            existing.setToken(UUID.randomUUID().toString());
            existing.setExpiry(Instant.now().plusMillis(duration));
            return refreshTokenRepository.save(existing);
        }

        RefreshToken token = new RefreshToken();
        token.setUser(user);
        token.setToken(UUID.randomUUID().toString());
        token.setExpiry(Instant.now().plusMillis(duration));

        return refreshTokenRepository.save(token);
    }

    public RefreshToken verifyExpiration(RefreshToken token) {
        if (token.getExpiry().isBefore(Instant.now())) {
            refreshTokenRepository.delete(token);
            throw new TokenExpiredException("Refresh token expired. Please login again.");
        }
        return token;
    }

    public RefreshToken getByToken(String token) {
        return refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new InvalidTokenException("Invalid refresh token"));
    }

    public void deleteByUser(AppUser user) {
        refreshTokenRepository.deleteByUser(user);
    }

    public void deleteByToken(String token) {
        refreshTokenRepository.findByToken(token)
                .ifPresent(refreshTokenRepository::delete);
    }
}
