package com.namit.controllers;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.namit.dtos.auth.AuthResponse;
import com.namit.dtos.auth.LoginRequest;
import com.namit.models.AppUser;
import com.namit.models.RefreshToken;
import com.namit.repositories.AppUserRepository;
import com.namit.security.jwt.JwtUtil;
import com.namit.security.jwt.RefreshTokenService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor

public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final AppUserRepository userRepo;
    private final RefreshTokenService refreshTokenService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {

        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getUsername(), req.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(auth);

        // Fetch user
        AppUser user = userRepo.findByUserName(req.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Generate ACCESS TOKEN

        String accessToken = jwtUtil.generateToken(user.getUserName(), user.getRole().name());

        // Generate REFRESH TOKEN with Remember Me support
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user, req.isRememberMe());

        return ResponseEntity.ok(
                new AuthResponse(
                        accessToken,
                        refreshToken.getToken(),
                        user.getRole().name(),
                        user.getUserName()));
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@RequestParam("refreshToken") String refreshTokenStr) {
        try {
            // 1. Look up the refresh token
            RefreshToken refreshToken = refreshTokenService.getByToken(refreshTokenStr);

            // 2. Verify expiration
            refreshTokenService.verifyExpiration(refreshToken);

            // 3. Generate new access token
            String newAccessToken = jwtUtil.generateToken(
                    refreshToken.getUser().getUserName(),
                    refreshToken.getUser().getRole().name());

            return ResponseEntity.ok(
                    new AuthResponse(
                            newAccessToken,
                            refreshToken.getToken(),
                            refreshToken.getUser().getRole().name(),
                            refreshToken.getUser().getUserName()));

        } catch (com.namit.exceptions.TokenExpiredException e) {
            // Return 401 for expired tokens - frontend should logout
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED)
                    .body(java.util.Map.of(
                            "error", "Refresh token expired",
                            "code", "TOKEN_EXPIRED",
                            "message", e.getMessage()));

        } catch (com.namit.exceptions.InvalidTokenException e) {
            // Return 401 for invalid tokens - frontend should logout
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED)
                    .body(java.util.Map.of(
                            "error", "Invalid refresh token",
                            "code", "INVALID_TOKEN",
                            "message", e.getMessage()));

        } catch (Exception e) {
            // Return 500 for actual server errors - frontend should NOT logout
            System.err.println("Error refreshing token: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(java.util.Map.of(
                            "error", "Server error",
                            "code", "SERVER_ERROR",
                            "message", "An unexpected error occurred. Please try again."));
        }
    }

    // logout using current authenticated user
    @PostMapping("/logout")
    public ResponseEntity<?> logoutAuthenticated() {
        // If user is authenticated, remove their refresh token
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()
                && !(authentication instanceof AnonymousAuthenticationToken)) {

            String username = authentication.getName();
            AppUser user = userRepo.findByUserName(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            refreshTokenService.deleteByUser(user);

            // Clear security context (optional)
            SecurityContextHolder.clearContext();

            return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
        }

        // If not authenticated, just respond OK (client can call refresh-token logout
        // instead)
        return ResponseEntity.ok(Map.of("message", "Logged out (no active session)"));
    }

    // logout using refreshToken value (useful when access token expired)
    @PostMapping("/logout-by-refresh")
    public ResponseEntity<?> logoutByRefreshToken(@RequestParam("refreshToken") String refreshToken) {
        try {
            // verify exists and delete
            RefreshToken rt = refreshTokenService.getByToken(refreshToken); // throws if invalid
            refreshTokenService.deleteByUser(rt.getUser());
            return ResponseEntity.ok(Map.of("message", "Logged out successfully (refresh token revoked)"));
        } catch (RuntimeException ex) {
            // token not found or already expired/deleted — still return OK to avoid leaking
            // info
            return ResponseEntity.ok(Map.of("message", "Logged out"));
        }
    }

}
