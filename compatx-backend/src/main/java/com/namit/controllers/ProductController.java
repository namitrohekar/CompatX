package com.namit.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.namit.models.Product;
import com.namit.security.details.CustomUserDetails;
import com.namit.services.ProductService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    // NEW ADMIN OWNED APIs 

    @PostMapping("/admin/products")
    public ResponseEntity<?> createProduct(
            @AuthenticationPrincipal CustomUserDetails adminDetails,
            @Valid @RequestBody Product product,
            @RequestParam Long categoryId
    ) {
        if (adminDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Long adminId = adminDetails.getUserId();
        return productService.adminCreateProduct(adminId, product, categoryId);
    }

    @GetMapping("/admin/products")
    public ResponseEntity<?> getAdminProducts(
            @AuthenticationPrincipal CustomUserDetails adminDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        if (adminDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Long adminId = adminDetails.getUserId();
        return productService.adminGetProducts(adminId, page, size);
    }

    @GetMapping("/admin/products/{productId}")
    public ResponseEntity<?> getAdminProduct(
            @AuthenticationPrincipal CustomUserDetails adminDetails,
            @PathVariable Long productId
    ) {
        if (adminDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Long adminId = adminDetails.getUserId();
        return productService.adminGetProduct(adminId, productId);
    }

    @PutMapping("/admin/products/{productId}")
    public ResponseEntity<?> updateProduct(
            @AuthenticationPrincipal CustomUserDetails adminDetails,
            @PathVariable Long productId,
            @Valid @RequestBody Product product,
            @RequestParam(required = false) Long categoryId
    ) {
        if (adminDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Long adminId = adminDetails.getUserId();
        return productService.adminUpdateProduct(adminId, productId, product, categoryId);
    }

    @DeleteMapping("/admin/products/{productId}")
    public ResponseEntity<?> deleteProduct(
            @AuthenticationPrincipal CustomUserDetails adminDetails,
            @PathVariable Long productId
    ) {
        if (adminDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Long adminId = adminDetails.getUserId();
        return productService.adminDeleteProduct(adminId, productId);
    }

    @GetMapping("/admin/products/stats")
    public ResponseEntity<?> getProductStats() {
        return productService.getProductStats(); // global stats are allowed
    }

    @GetMapping("/admin/products/filter")
    public ResponseEntity<?> adminFilterProducts(
            @AuthenticationPrincipal CustomUserDetails adminDetails,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) Integer minStock,
            @RequestParam(required = false) Integer maxStock,
            @RequestParam(required = false) String sortField,
            @RequestParam(required = false) String sortDirection,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size
    ) {
        if (adminDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Long adminId = adminDetails.getUserId();
        return productService.adminFilterProducts(
                adminId,
                keyword,
                categoryId,
                brand,
                minPrice,
                maxPrice,
                minStock,
                maxStock,
                sortField,
                sortDirection,
                page,
                size
        );
    }

   // PUBLIC APIS  ( small todo : make service for it ) 

    @GetMapping("/products/search")
    public ResponseEntity<?> searchProducts(@RequestParam String keyword) {
        return productService.searchProducts(keyword);
    }

    @GetMapping("/products/smart-search")
    public ResponseEntity<?> smartSearch(@RequestParam String keyword) {
        return productService.smartSearch(keyword);
    }
}
