package com.namit.specifications;

import org.springframework.data.jpa.domain.Specification;

import com.namit.models.Product;

public class ProductSpecification {
	
	
	// 			Keyword Search ( product OR brand ) - ignore case
	
	public static Specification<Product> keywordContains( String keyword){
		
		return(root , query , cb) ->{
			if(keyword == null || keyword.isBlank()) return null;
			
			String like = "%" + keyword.toLowerCase() + "%";
			 return cb.or(
					 cb.like(cb.lower(root.get("productName")), like),
					 cb.like(cb.lower(root.get("brand")), like)
					 
				);
		};
	}
	
	// filter by exact category id
	
	public static Specification<Product> hasCategory(Long categoryId){
		return ( root , query , cb)->{
			
			if(categoryId == null) return null;
			
			return cb.equal(root.get("category").get("categoryId"), categoryId);
		};
	}
	
	// filter by brand contains 
	
	public static Specification<Product> brandContains (String brand){
		return (root , query , cb)->{
			if(brand == null || brand.isBlank()) return null;
			
			return cb.like(cb.lower(root.get("brand")), "%" + brand.toLowerCase() + "%");
		};
	}
	
	
	// price range 
	
	public static Specification<Product> priceBetween( Double minPrice , Double maxPrice){
		
		return (root , query , cb) ->{
			
			if(minPrice == null && maxPrice == null) return  null;
			
			if (minPrice == null ) return cb.lessThanOrEqualTo(root.get("price"), maxPrice);
			if (maxPrice == null ) return cb.greaterThanOrEqualTo(root.get("price"), minPrice);
			
			return cb.between(root.get("price"), minPrice, maxPrice);
			
		};
	}
	
	// stock range 
	
	public static Specification<Product> stockBetween( Integer minStock , Integer maxStock){
			
			return (root , query , cb) ->{
				
				if(minStock == null && maxStock == null) return  null;
				
				if (minStock == null ) return cb.lessThanOrEqualTo(root.get("stock"), maxStock);
				if (maxStock == null ) return cb.greaterThanOrEqualTo(root.get("stock"), minStock);
				
				return cb.between(root.get("stock"), minStock, maxStock);
				
			};
		}
	
	// only active if product is in stock ( test purpose)
	
	public static Specification<Product> inStock(){
		return ( root , query , cb) ->  cb.greaterThan(root.get("stock"), 0);
		
	}


}
