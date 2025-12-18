package com.namit.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.namit.dtos.order.UpdateOrderStatusRequest;
import com.namit.enums.OrderStatus;
import com.namit.security.details.CustomUserDetails;
import com.namit.services.OrderService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class AdminOrderController {

    private final OrderService orderService;

    @GetMapping("/admin/orders")
    public ResponseEntity<?> getAllOrders(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "createdAt") String sortField,
            @RequestParam(defaultValue = "desc") String sortDirection,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "10") Integer size) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Long userId = userDetails.getUserId();
        return orderService.getOrdersForAdmin(userId, status, keyword, sortField, sortDirection, page, size);
    }

    @GetMapping("/admin/orders/{orderId}")
    public ResponseEntity<?> getOrderByIdAdmin(
            @PathVariable Long orderId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Long userId = userDetails.getUserId();
        return orderService.getOrderByIdForAdmin(userId, orderId);
    }

    @PutMapping("/admin/orders/{orderId}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Long orderId,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody @Valid UpdateOrderStatusRequest request) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        return orderService.updateOrderStatus(orderId, request);
    }

    @GetMapping("/admin/orders/stats")
    public ResponseEntity<?> getOrderStats(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Long userId = userDetails.getUserId();
        return orderService.getOrderStatsForAdmin(userId);
    }

    @GetMapping("/admin/orders/status/{status}")
    public ResponseEntity<?> getOrdersByStatus(
            @PathVariable OrderStatus status,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "10") Integer size) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Long userId = userDetails.getUserId();
        return orderService.getOrdersByStatusForAdmin(userId, status, page, size);
    }

    @PostMapping("/admin/orders/{orderId}/verify-delivery")
    public ResponseEntity<?> verifyDeliveryOTP(
            @PathVariable Long orderId,
            @RequestBody @Valid com.namit.dtos.order.VerifyDeliveryOTPRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Long userId = userDetails.getUserId();
        return orderService.verifyDeliveryOTP(userId, orderId, request.getOtp());
    }
}
