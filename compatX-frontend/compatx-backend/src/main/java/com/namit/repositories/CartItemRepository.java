package com.namit.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.namit.models.CartItem;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    
    // Find cart item by cart and product
    Optional<CartItem> findByCart_CartIdAndProduct_Id(Long cartId, Long productId);
    
    
    
    // Find all items in a cart
    List<CartItem> findByCart_CartId(Long cartId);
    
    
    
    // Check if product exists in cart
    boolean existsByCart_CartIdAndProduct_Id(Long cartId, Long productId);
    
    
    
    // Count items in cart
    
    @Query("SELECT COUNT(ci) FROM CartItem ci WHERE ci.cart.cartId = :cartId")
    
    Integer countByCartId(@Param("cartId") Long cartId);
    
    
    
    // Get total quantity in cart
    @Query("SELECT COALESCE(SUM(ci.quantity), 0) FROM CartItem ci WHERE ci.cart.cartId = :cartId")
    Integer getTotalQuantityByCartId(@Param("cartId") Long cartId);
    
    


    void deleteByCart_CartId(Long cartId);
    
    
    
    // Find cart item by id and user id for security
    @Query("SELECT ci FROM CartItem ci WHERE ci.cartItemId = :itemId AND ci.cart.user.userId = :userId")
    Optional<CartItem> findByIdAndUserId(@Param("itemId") Long itemId, @Param("userId") Long userId);
}