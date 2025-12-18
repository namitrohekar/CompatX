package com.namit.dtos.cart;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartItemResponseDTO {

	
	private Long cartItemId;
	
	private ProductInCartDTO product;
	
	private Integer quantity;
	
	private Double priceAtAdd;
	
	private Double subtotal;
}
