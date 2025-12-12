package com.namit.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

import org.springframework.web.bind.annotation.RestController;

import com.namit.dtos.cart.AddToCartDTO;
import com.namit.dtos.cart.UpdateCartItemDTO;
import com.namit.security.details.CustomUserDetails;
import com.namit.services.CartService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor

public class CartController {

    private final CartService cartService;

    
    @GetMapping("/user/cart")
    public ResponseEntity<?> getCart(@AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Long userId = userDetails.getUserId();
        return cartService.getCart(userId);
    }

    @PostMapping("/user/cart/add")
    public ResponseEntity<?> addToCart(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody AddToCartDTO request) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Long userId = userDetails.getUserId();
        return cartService.addToCart(userId, request);
    }

    @PutMapping("/user/cart/items/{itemId}")
    public ResponseEntity<?> updateCartItem(
            @PathVariable Long itemId,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody UpdateCartItemDTO request) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Long userId = userDetails.getUserId();
        return cartService.updateCartItem(userId, itemId, request);
    }

    @DeleteMapping("/user/cart/items/{itemId}")
    public ResponseEntity<?> removeCartItem(
            @PathVariable Long itemId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Long userId = userDetails.getUserId();
        return cartService.removeCartItem(userId, itemId);
    }

    @DeleteMapping("/user/cart")
    public ResponseEntity<?> clearCart(@AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Long userId = userDetails.getUserId();
        return cartService.clearCart(userId);
    }

    @GetMapping("/user/cart/count")
    public ResponseEntity<?> getCartItemCount(@AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Long userId = userDetails.getUserId();
        return cartService.getCartItemCount(userId);
    }
}