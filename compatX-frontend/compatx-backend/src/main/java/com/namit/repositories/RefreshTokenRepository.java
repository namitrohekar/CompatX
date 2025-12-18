package com.namit.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.namit.models.RefreshToken;

import jakarta.transaction.Transactional;

import com.namit.models.AppUser;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByToken(String token);

    Optional<RefreshToken> findByUser(AppUser user);

    @Transactional
    void deleteByUser(AppUser user);
}
