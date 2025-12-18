package com.namit.controllers;

import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.namit.services.CategoryService;
import com.namit.services.ProductService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor

public class CustomerProductController {
	
	private final ProductService productService;
	
	private final CategoryService categoryService;

	
	// Customer Search 
	@GetMapping("/products/filter")
	public ResponseEntity<?> customerFilterProducts(
	        @RequestParam(required = false) String keyword,
	        @RequestParam(required = false) Long categoryId,
	        @RequestParam(required = false) String brand,
	        @RequestParam(required = false) Double minPrice,
	        @RequestParam(required = false) Double maxPrice,
	        @RequestParam(required = false) String sortField,
	        @RequestParam(required = false) String sortDirection,
	        @RequestParam(defaultValue = "0") Integer page,
	        @RequestParam(defaultValue = "12") Integer size
	) {
	    return productService.customerFilterProducts(
	            keyword, categoryId, brand,
	            minPrice, maxPrice,
	            sortField, sortDirection,
	            page, size
	    );
	}

	@GetMapping("/products")
    public ResponseEntity<?> customerGetAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size
    ) {
        return productService.customerGetAllProducts(page, size);
    }
	
	
	
	@GetMapping("/categories")
	public ResponseEntity<?> getAllCustomerCategories() {
	    return categoryService.getAllCustomerCategories();
	}

	
	
	
	
	@GetMapping("/products/{id}")
	public ResponseEntity<?> getOneCustomerProduct(@PathVariable Long id) {
	    return productService.getCustomerProduct(id);
	}

	@GetMapping("/products/related")
	public ResponseEntity<?> getRelated(
	        @RequestParam Long categoryId,
	        @RequestParam Long excludeId
	) {
	    return productService.getRelatedProducts(categoryId, excludeId);
	}

}
