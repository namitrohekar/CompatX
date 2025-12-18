package com.namit.dtos.auth;

import java.time.Instant;

import lombok.Data;

@Data
public class CustomerProductDTO {
	
	private Long id;
	private String productName;
	private String brand;
	private String description;
	
	private Double price;
	
	private String imageUrl;
	
	private Instant createdAt;
	
	 private Integer stock; 
	
	private Long categoryId;
	
	private String categoryName;
	
	

}
