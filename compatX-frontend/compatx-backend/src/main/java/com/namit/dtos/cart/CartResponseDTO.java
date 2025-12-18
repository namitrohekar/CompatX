package com.namit.dtos.cart;

import java.time.Instant;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartResponseDTO {

	
	private Long cartId;
	
	private List<CartItemResponseDTO> items;
	
	private Integer totalItems;
	
	private Double totalPrice;
	
	private Instant updatedAt;
}
