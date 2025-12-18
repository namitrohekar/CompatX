package com.namit.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.namit.models.Cart;


public interface CartRepository extends JpaRepository<Cart, Long> {
    
    // Find cart by user ID
    Optional<Cart> findByUser_UserId(Long userId);
    
    // Check if cart exists for user
    boolean existsByUser_UserId(Long userId);
    
    // Find cart with items (fetch join for performance)
    @Query("SELECT c FROM Cart c LEFT JOIN FETCH c.items WHERE c.user.userId = :userId")
    Optional<Cart> findByUserIdWithItems(@Param("userId") Long userId);
    
    // Delete cart by user ID
    void deleteByUser_UserId(Long userId);
}