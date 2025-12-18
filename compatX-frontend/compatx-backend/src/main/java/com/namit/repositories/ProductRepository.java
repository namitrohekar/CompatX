
package com.namit.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;


import com.namit.models.Product;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> , JpaSpecificationExecutor<Product>{

	
	// find products by category
	
	 List<Product>	findByCategoryCategoryId(Long categoryId);
	 
	 
	 // search By product name 
	 
	 List<Product>	findByProductNameContainingIgnoreCase( String keyword);
	 
	 
	 // find by product brand 
	 
	List<Product>	findByBrandContainingIgnoreCase( String brand);
	
	 
	 // Now combine Both of them to create one big search optimal method 
	 
	 
	 List<Product> findByProductNameContainingIgnoreCaseOrBrandContainingIgnoreCase(String name ,
			 																		String brand);
	 
	 
	 
	 
	 // Advance Searching 
	 @Query("""
			    SELECT p FROM Product p 
			    WHERE 
			      LOWER(p.productName) LIKE LOWER(CONCAT('%', :token1, '%'))
			      AND LOWER(p.productName) LIKE LOWER(CONCAT('%', :token2, '%'))
			""")
		List<Product> searchTwo(@Param("token1") String token1, @Param("token2") String token2);

	 
	 
	  // Find products in stock
	 List<Product> findByStockGreaterThan(Integer stock);
	 
	 
	 
	 // FOR ADMIN STATS ( TOTAL CATEGORIES / PRODUCTS  / BRAND 
	 
	 
	 
	 	@Query(" SELECT COUNT( DISTINCT p.brand) FROM Product p")
	 	Long countDistinctBrand();
	 
	 
	 	
	 	
	 	@EntityGraph(attributePaths = {"category"})
	 	Optional<Product> findById(Long id);

	 	@EntityGraph(attributePaths = {"category"})
	 	List<Product> findAll();

	 	
	 	
	
}
