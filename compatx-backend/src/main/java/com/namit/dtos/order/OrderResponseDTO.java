package com.namit.dtos.order;

import java.time.Instant;
import java.util.List;

import com.namit.enums.OrderStatus;
import com.namit.enums.PaymentMethod;
import com.namit.enums.PaymentStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponseDTO {

    private Long orderId;
    private OrderStatus status;
    private PaymentMethod paymentMethod;
    private PaymentStatus paymentStatus;

    private List<OrderItemResponseDTO> orderItems;

    private Double subtotal;
    private Double taxAmount;
    private Double shippingCharges;
    private Double totalAmount;
    private Integer totalItems;

    private ShippingAddressDTO shippingAddress;

    private String orderNotes;
    private String cancellationReason;
    private String transactionId;

    private Instant createdAt;
    private Instant updatedAt;
    private Instant confirmedAt;
    private Instant shippedAt;
    private Instant deliveredAt;
    private Instant cancelledAt;
}
