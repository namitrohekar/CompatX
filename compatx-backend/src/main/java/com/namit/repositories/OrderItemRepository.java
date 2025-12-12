package com.namit.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.namit.models.OrderItem;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

	
	// order scoped 
	
		List<OrderItem> findByOrder_OrderId( Long orderId);
		
		Long countByOrder_OrderId(Long orderId);
		
//		product scoped
		
		List<OrderItem> findByProduct_Id(Long productId);
		
		@Query(
			    "SELECT COALESCE(SUM(oi.quantity),0) FROM OrderItem oi WHERE oi.product.Id = :productId"
			)
			Integer getTotalQuantitySoldForProduct(@Param("productId") Long productId);

	
}
