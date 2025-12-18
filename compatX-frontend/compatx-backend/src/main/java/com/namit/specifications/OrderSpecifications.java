package com.namit.specifications;

import java.time.Instant;

import org.springframework.data.jpa.domain.Specification;

import com.namit.enums.OrderStatus;
import com.namit.enums.PaymentStatus;
import com.namit.models.Order;

public class OrderSpecifications {

	
	
	// status filter 
	
	public static Specification<Order> hasStatus( OrderStatus status){
		
		return (root , query , cb) ->{
			if(status == null) return null;
			return cb.equal(root.get("status"), status);
		};
	}
	
	
	// Payment status filter 
	
	public static Specification<Order> hasPaymentStatus ( PaymentStatus paymentStatus){
		
		return ( root , query , cb ) ->{
			if(paymentStatus == null) return null;
			
			return cb.equal(root.get("paymentStatus"), paymentStatus);
		};
	}
	
	
	// Date Range filter 
	
	public static Specification<Order> createdBetween( Instant start , Instant end){
		
		return( root , query , cb) ->{
			
			if(start == null && end == null) return null;
			
			if( start == null) return cb.lessThanOrEqualTo(root.get("createdAt"), end);
			
			if (end == null) return cb.greaterThanOrEqualTo(root.get("createdAt"), start);
			
			return cb.between(root.get("createdAt"), start, end);
			
		};
	}
	
	// Keyword search 
	
	public static Specification<Order> keywordSearch( String keyword){
		return ( root , query , cb)->{
			if( keyword == null || keyword.isBlank()) return null;
			String like = "%" + keyword.toLowerCase() + "%";
			return cb.or(
				
					cb.like(cb.lower(cb.toString(root.get("orderId"))), like),
					cb.like(cb.lower(cb.toString(root.get("user").get("userName"))), like),
					cb.like(cb.lower(cb.toString(root.get("user").get("email"))), like)
					
					
					);
					
		};
	}
	
	// Amount range 
	
	public static Specification<Order> totalAmountBetween(Double min, Double max) {
	    return (root, query, cb) -> {
	        if (min == null && max == null) return null;
	        if (min == null) return cb.lessThanOrEqualTo(root.get("totalAmount"), max);
	        if (max == null) return cb.greaterThanOrEqualTo(root.get("totalAmount"), min);
	        return cb.between(root.get("totalAmount"), min, max);
	    };
	}
	
}
