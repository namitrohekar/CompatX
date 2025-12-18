package com.namit.dtos.payment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO containing payment order details
 * Includes Razorpay order ID and QR code data
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentOrderResponse {

    private String razorpayOrderId;
    private Long orderId;
    private Double amount;
    private String currency;
    private String qrCodeData; // Base64 encoded QR code or UPI link
    private String upiId; // UPI ID for manual payment
    private String keyId; // Razorpay key ID for frontend
}
