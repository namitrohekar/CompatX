package com.namit.dtos.auth;

public class ProductStatsDTO {
    private Long totalProducts;
    private Long totalCategories;
    private Long totalBrands;
    
    public ProductStatsDTO(Long totalProducts, Long totalCategories, Long totalBrands) {
        this.totalProducts = totalProducts;
        this.totalCategories = totalCategories;
        this.totalBrands = totalBrands;
    }
    
    // Getters
    public Long getTotalProducts() { return totalProducts; }
    public Long getTotalCategories() { return totalCategories; }
    public Long getTotalBrands() { return totalBrands; }
    
    // Setters
    public void setTotalProducts(Long totalProducts) { 
        this.totalProducts = totalProducts; 
    }
    public void setTotalCategories(Long totalCategories) { 
        this.totalCategories = totalCategories; 
    }
    public void setTotalBrands(Long totalBrands) { 
        this.totalBrands = totalBrands; 
    }
}
