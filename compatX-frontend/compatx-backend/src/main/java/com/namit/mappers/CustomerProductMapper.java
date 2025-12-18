package com.namit.mappers;

import com.namit.dtos.auth.CustomerProductDTO;
import com.namit.models.Product;

public class CustomerProductMapper {

	
	
	public static CustomerProductDTO toDTO(Product p) {
		
		CustomerProductDTO dto = new CustomerProductDTO();
		
		dto.setId(p.getId());
        dto.setProductName(p.getProductName());
        dto.setBrand(p.getBrand());
        dto.setDescription(p.getDescription());
        dto.setPrice(p.getPrice());
        dto.setImageUrl(p.getImageUrl());
        dto.setCreatedAt(p.getCreatedAt());
        dto.setStock(p.getStock()); 
		
        if (p.getCategory() != null) {
            dto.setCategoryId(p.getCategory().getCategoryId());
            dto.setCategoryName(p.getCategory().getCategoryName());
        }

        return dto;
        
        
	}
}
