package com.namit.dtos.order;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemResponseDTO {

    private Long orderItemId;
    private ProductInOrderDTO product;
    private Integer quantity;
    private Double priceAtOrder;
    private Double subtotal;
}
