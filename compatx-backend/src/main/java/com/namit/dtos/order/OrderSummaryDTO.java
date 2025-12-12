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
public class OrderSummaryDTO {

    private Long orderId;
    private OrderStatus status;
    private PaymentMethod paymentMethod;
    private PaymentStatus paymentStatus;
    private Integer totalItems;
    private Double totalAmount;
    private Instant createdAt;
    private Instant updatedAt;

    private List<OrderItemResponseDTO> orderItems;
}
