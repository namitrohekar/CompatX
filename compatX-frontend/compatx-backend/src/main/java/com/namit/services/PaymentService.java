package com.namit.services;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.namit.dtos.payment.PaymentOrderResponse;
import com.razorpay.RazorpayClient;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;

import lombok.extern.slf4j.Slf4j;

/**
 * Payment Service - Stripe Integration
 * 
 * This service handles Stripe payment gateway integration.
 * Uses Stripe Checkout Sessions for secure payment processing.
 * 
 * Key Features:
 * - Creates Stripe Checkout Sessions
 * - Handles payment success/failure redirects
 * - Secure server-side payment processing
 */
@Service
@Slf4j
public class PaymentService {

        @Value("${stripe.secret.key}")
        private String stripeSecretKey;

        /**
         * Creates a Stripe Checkout Session
         * 
         * @param orderId Application order ID
         * @param amount  Order amount in INR
         * @return Map with sessionId and url
         */
        public Map<String, String> createCheckoutSession(Long orderId, Double amount) throws StripeException {
                log.info("Creating Stripe Checkout Session for Order ID: {}, Amount: ₹{}", orderId, amount);

                // Initialize Stripe with secret key
                Stripe.apiKey = stripeSecretKey;

                // Convert amount to paise (Stripe uses smallest currency unit)
                long amountInPaise = (long) (amount * 100);

                // Create Checkout Session parameters
                SessionCreateParams params = SessionCreateParams.builder()
                                .setMode(SessionCreateParams.Mode.PAYMENT)
                                .setSuccessUrl("http://localhost:5173/order-success/" + orderId
                                                + "?session_id={CHECKOUT_SESSION_ID}")
                                .setCancelUrl("http://localhost:5173/checkout?canceled=true")
                                .addLineItem(
                                    SessionCreateParams.LineItem.builder()
                                              .setQuantity(1L)
                                              .setPriceData(
                                    SessionCreateParams.LineItem.PriceData.builder()
                                    	.setCurrency("inr")
                                    	.setUnitAmount(amountInPaise)
                                    	.setProductData(
                                    SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                    .setName("CompatX Order #"+ orderId)
                                    .setDescription("Payment for order #"+ orderId)
                                    	.build())
                                    	.build())
                                              .build())
                                .putMetadata("orderId", String.valueOf(orderId))
                                .build();

                // Create the session
                Session session = Session.create(params);

                log.info("Stripe Checkout Session created successfully. Session ID: {}", session.getId());
                log.info("Stripe Checkout URL: {}", session.getUrl());

                // Return both session ID and URL
                Map<String, String> response = new HashMap<>();
                response.put("sessionId", session.getId());
                response.put("url", session.getUrl());

                return response;
        }

        /*
         * 
         * RAZORPAY INTEGRATION - Official SDK Implementation
         * Following official Razorpay Java SDK documentation
         * 
         */

        @Value("${razorpay.key.id}")
        private String razorpayKeyId;

        @Value("${razorpay.key.secret}")
        private String razorpayKeySecret;

        /**
         * Create Razorpay Payment Order
         * Official implementation following Razorpay Java SDK docs
         * 
         * @param orderId Application order ID
         * @param amount  Order amount in INR
         * @return PaymentOrderResponse with razorpay_order_id and other details
         */
        public PaymentOrderResponse createPaymentOrder(Long orderId, Double amount) throws Exception {
                log.info("Creating Razorpay payment order for Order ID: {}, Amount: ₹{}", orderId, amount);

                try {
                        // Initialize Razorpay client with API credentials
                        RazorpayClient razorpayClient = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

                        // Create order request with required parameters
                        org.json.JSONObject orderRequest = new org.json.JSONObject();
                        orderRequest.put("amount", (int) (amount * 100)); // Amount in paise (smallest currency unit)
                        orderRequest.put("currency", "INR");
                        orderRequest.put("receipt", "order_rcptid_" + orderId);
                        orderRequest.put("payment_capture", 1); // Auto capture payment

                        // Optional: Add notes for reference
                        org.json.JSONObject notes = new org.json.JSONObject();
                        notes.put("order_id", orderId.toString());
                        notes.put("platform", "CompatX");
                        orderRequest.put("notes", notes);

                        // Create order via Razorpay API
                        com.razorpay.Order razorpayOrder = razorpayClient.orders.create(orderRequest);

                        String razorpayOrderId = razorpayOrder.get("id");
                        log.info("Razorpay order created successfully. Razorpay Order ID: {}", razorpayOrderId);

                        // Build and return response
                        return PaymentOrderResponse.builder()
                                        .razorpayOrderId(razorpayOrderId)
                                        .orderId(orderId)
                                        .amount(amount)
                                        .currency("INR")
                                        .keyId(razorpayKeyId) // Frontend needs this to initialize Razorpay Checkout
                                        .build();

                } catch (Exception e) {
                        log.error("Error creating Razorpay order: {}", e.getMessage(), e);
                        throw new Exception("Failed to create Razorpay payment order: " + e.getMessage());
                }
        }

        /**
         * Verify Razorpay Payment Signature
         * Official implementation using HMAC SHA256 verification
         * 
         * @param razorpayOrderId   Razorpay order ID
         * @param razorpayPaymentId Razorpay payment ID
         * @param razorpaySignature Signature to verify
         * @return true if signature is valid, false otherwise
         */
        public boolean verifyPaymentSignature(String razorpayOrderId, String razorpayPaymentId,
                        String razorpaySignature) {
                log.info("Verifying Razorpay payment signature for Order ID: {}, Payment ID: {}", razorpayOrderId,
                                razorpayPaymentId);

                try {
                        // Create payload for signature verification
                        // Format: razorpay_order_id|razorpay_payment_id
                        String payload = razorpayOrderId + "|" + razorpayPaymentId;

                        // Calculate expected signature using HMAC SHA256
                        javax.crypto.Mac mac = javax.crypto.Mac.getInstance("HmacSHA256");
                        javax.crypto.spec.SecretKeySpec secretKeySpec = new javax.crypto.spec.SecretKeySpec(
                                        razorpayKeySecret.getBytes(java.nio.charset.StandardCharsets.UTF_8),
                                        "HmacSHA256");
                        mac.init(secretKeySpec);
                        byte[] hash = mac.doFinal(payload.getBytes(java.nio.charset.StandardCharsets.UTF_8));

                        // Convert hash to hex string
                        String expectedSignature = bytesToHex(hash);

                        // Compare signatures (case-insensitive)
                        boolean isValid = expectedSignature.equalsIgnoreCase(razorpaySignature);

                        if (isValid) {
                                log.info("Payment signature verification SUCCESS for Payment ID: {}",
                                                razorpayPaymentId);
                        } else {
                                log.warn("Payment signature verification FAILED for Payment ID: {}", razorpayPaymentId);
                                log.debug("Expected: {}, Received: {}", expectedSignature, razorpaySignature);
                        }

                        return isValid;

                } catch (Exception e) {
                        log.error("Error verifying payment signature: {}", e.getMessage(), e);
                        return false;
                }
        }

        /**
         * Convert byte array to hex string
         * Helper method for signature verification
         */
        private String bytesToHex(byte[] bytes) {
                StringBuilder result = new StringBuilder();
                for (byte b : bytes) {
                        result.append(String.format("%02x", b));
                }
                return result.toString();
        }

        /**
         * Get Razorpay Key ID
         * Used by frontend to initialize Razorpay Checkout
         */
        public String getRazorpayKeyId() {
                return razorpayKeyId;
        }
}
