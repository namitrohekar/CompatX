package com.namit.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.namit.dtos.order.CancelOrderRequest;
import com.namit.dtos.order.PlaceOrderRequest;
import com.namit.security.details.CustomUserDetails;
import com.namit.services.OrderService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class UserOrderController {

    private final OrderService orderService;

    @GetMapping("/user/orders/preview")
    public ResponseEntity<?> getOrderPreview(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Long userId = userDetails.getUserId();
        return orderService.getOrderPreview(userId);
    }

    @PostMapping("/user/orders")
    public ResponseEntity<?> placeOrder(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody @Valid PlaceOrderRequest request
    ) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Long userId = userDetails.getUserId();
        return orderService.placeOrder(userId, request);
    }

    @GetMapping("/user/orders")
    public ResponseEntity<?> getUserOrders(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "10") Integer size
    ) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Long userId = userDetails.getUserId();
        return orderService.getUserOrders(userId, page, size);
    }

    @GetMapping("/user/orders/{orderId}")
    public ResponseEntity<?> getOrderById(
            @PathVariable Long orderId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Long userId = userDetails.getUserId();
        return orderService.getOrderById(userId, orderId);
    }

    @PutMapping("/user/orders/{orderId}/cancel")
    public ResponseEntity<?> cancelOrder(
            @PathVariable Long orderId,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody @Valid CancelOrderRequest request
    ) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Long userId = userDetails.getUserId();
        return orderService.cancelOrder(userId, orderId, request);
    }
}
