package com.namit.security.jwt;

import java.security.Key;
import java.util.Date;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtUtil {

    // importing variables from application properties

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.expiration}")
    private long jwtExpirationInMs;

    // setting up the signing key
    private Key getSigningKey() {

        return Keys.hmacShaKeyFor(jwtSecret.getBytes());

    }

    public String extractRole(String token) {
        return getClaims(token).get("role", String.class);
    }

    // Generating keys

    public String generateToken(String username, String role) {

        Date now = new Date();
        Date expiry = new Date(now.getTime() + jwtExpirationInMs);

        return Jwts.builder()
                .setSubject(username)
                .claim("role", role)
                .setIssuedAt(now)
                .setExpiration(expiry)
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();

    }

    // Overloaded method for custom expiration (used for Remember Me)
    public String generateToken(String username, String role, long customExpirationMs) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + customExpirationMs);

        return Jwts.builder()
                .setSubject(username)
                .claim("role", role)
                .setIssuedAt(now)
                .setExpiration(expiry)
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    private Claims getClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // Getting username

    public String extractUsername(String token) {
        return getClaims(token).getSubject();
    }

    public boolean validateToken(String token) {
        try {
            getClaims(token);
            return true;
        } catch (ExpiredJwtException ex) {
            System.out.println("JWT expired");
        } catch (MalformedJwtException ex) {
            System.out.println("Invalid JWT");
        } catch (Exception ex) {
            System.out.println("JWT validation error");
        }
        return false;
    }

}
