package com.namit.dtos.order;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductInOrderDTO {

    private Long productId;
    private String productName;
    private String brand;
    private String imageUrl;
    private String categoryName;
}
