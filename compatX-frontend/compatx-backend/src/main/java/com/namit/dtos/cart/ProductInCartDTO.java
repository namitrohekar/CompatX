package com.namit.dtos.cart;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductInCartDTO {

	private Long productId;
	
	private String productName;
	
	private String brand;
	
	private String imageUrl;
	
	private Integer availableStock;
	
	private Double currentPrice;
	
}
