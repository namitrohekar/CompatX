package com.namit.controllers;

import java.time.Instant;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.namit.dtos.payment.CreatePaymentOrderRequest;
import com.namit.dtos.payment.PaymentOrderResponse;
import com.namit.dtos.payment.VerifyPaymentRequest;
import com.namit.enums.OrderStatus;
import com.namit.enums.PaymentStatus;
import com.namit.repositories.OrderRepository;
import com.namit.security.details.CustomUserDetails;
import com.namit.services.PaymentService;
import com.stripe.exception.StripeException;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Payment Controller - Stripe & Razorpay Integration
 * Handles all payment-related API endpoints
 * 
 * Active Endpoints:
 * - POST /api/v1/payments/create-checkout-session - Create Stripe Checkout
 * Session
 * 
 * Commented Endpoints (Razorpay):
 * - POST /api/v1/payments/create-order - Create Razorpay payment order
 * - POST /api/v1/payments/verify - Verify Razorpay payment
 * - GET /api/v1/payments/key - Get Razorpay key ID
 */
@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

    private final PaymentService paymentService;
    private final OrderRepository orderRepository;

    /**
     * Create Stripe Checkout Session
     * Called when user selects online payment and places order
     */
    @PostMapping("/create-checkout-session")
    public ResponseEntity<?> createCheckoutSession(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody Map<String, Object> request) {

        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("User not authenticated");
        }

        try {
            Long orderId = Long.valueOf(request.get("orderId").toString());
            Double amount = Double.valueOf(request.get("amount").toString());

            log.info("Creating Stripe Checkout Session for Order ID: {}", orderId);

            // Verify order exists and belongs to user
            orderRepository.findByOrderIdAndUser_UserId(
                    orderId,
                    userDetails.getUserId()).orElseThrow(() -> new RuntimeException("Order not found"));

            // Create Stripe Checkout Session (returns Map with sessionId and url)
            Map<String, String> sessionData = paymentService.createCheckoutSession(orderId, amount);

            return ResponseEntity.ok(sessionData);

        } catch (StripeException e) {
            log.error("Stripe error creating checkout session: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to create checkout session: " + e.getMessage());
        } catch (Exception e) {
            log.error("Error creating checkout session: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to create checkout session: " + e.getMessage());
        }
    }

    /*
     * ========================================
     * RAZORPAY ENDPOINTS - RE-ENABLED
     * Working alongside Stripe
     * ========================================
     */

    @PostMapping("/create-order")
    public ResponseEntity<?> createPaymentOrder(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody @Valid CreatePaymentOrderRequest request) {

        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("User not authenticated");
        }

        try {
            log.info("Creating payment order for Order ID: {}", request.getOrderId());

            // Verify order exists and belongs to user
            orderRepository.findByOrderIdAndUser_UserId(
                    request.getOrderId(),
                    userDetails.getUserId()).orElseThrow(() -> new RuntimeException("Order not found"));

            // Create payment order
            PaymentOrderResponse response = paymentService.createPaymentOrder(
                    request.getOrderId(),
                    request.getAmount());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error creating payment order: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to create payment order: " + e.getMessage());
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody @Valid VerifyPaymentRequest request) {

        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("User not authenticated");
        }

        try {
            log.info("Verifying payment for Order ID: {}", request.getOrderId());

            // Verify payment signature
            boolean isValid = paymentService.verifyPaymentSignature(
                    request.getRazorpayOrderId(),
                    request.getRazorpayPaymentId(),
                    request.getRazorpaySignature());

            if (!isValid) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Payment verification failed");
            }

            // Update order with payment details directly
            var order = orderRepository.findByOrderIdAndUser_UserId(
                    request.getOrderId(),
                    userDetails.getUserId()).orElseThrow(() -> new RuntimeException("Order not found"));

            order.setRazorpayOrderId(request.getRazorpayOrderId());
            order.setRazorpayPaymentId(request.getRazorpayPaymentId());
            order.setPaymentSignature(request.getRazorpaySignature());
            order.setPaymentStatus(PaymentStatus.COMPLETED);
            order.setStatus(OrderStatus.CONFIRMED);
            order.setConfirmedAt(Instant.now());

            orderRepository.save(order);

            return ResponseEntity.ok("Payment verified successfully");

        } catch (Exception e) {
            log.error("Error verifying payment: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to verify payment: " + e.getMessage());
        }
    }

    @GetMapping("/key")
    public ResponseEntity<?> getRazorpayKey() {
        try {
            String keyId = paymentService.getRazorpayKeyId();
            return ResponseEntity.ok(new KeyResponse(keyId));
        } catch (Exception e) {
            log.error("Error fetching Razorpay key: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to fetch payment key");
        }
    }

    private record KeyResponse(String keyId) {
    }
}
