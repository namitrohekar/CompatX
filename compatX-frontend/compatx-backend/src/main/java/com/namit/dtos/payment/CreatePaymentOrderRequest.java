package com.namit.dtos.payment;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for creating a payment order
 * Used when user selects online payment method
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreatePaymentOrderRequest {

    @NotNull(message = "Order ID is required")
    private Long orderId;

    @NotNull(message = "Amount is required")
    private Double amount;
}
