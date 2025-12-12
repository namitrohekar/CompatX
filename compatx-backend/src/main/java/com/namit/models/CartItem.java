package com.namit.models;

import java.time.Instant;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Entity
@Data
@EntityListeners(AuditingEntityListener.class)
@Table(
		uniqueConstraints = {
				@UniqueConstraint(columnNames = {"cart_id" , "product_id"})
		})
public class CartItem {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long cartItemId;
	
	@ManyToOne
	@JoinColumn( name ="cart_id" , nullable = false)
	@JsonIgnore
	private Cart cart;
	
	@ManyToOne
	@JoinColumn(name = "product_id" , nullable = false)
	private Product product;
	
	
	@Column(nullable = false)
	@NotNull( message = "Quantity cannot be null")
	@Min(value = 1 , message = "Quantity must be at least 1")
	private Integer quantity;
	
	@Column(nullable = false)
	private Double priceAtAdd;
	
	
	 @CreatedDate
	 private Instant createdAt;

	 @LastModifiedDate
	 private Instant updatedAt;
	 
	 public Double getSubtotal() {
		 
		 return priceAtAdd * quantity;
		 
		 
	 }
	 
	 
	 @PrePersist
	 @PreUpdate
	 
	 public void setPriceFrompProducts() {
		 if (product != null && priceAtAdd == null) {
			 this.priceAtAdd = product.getPrice();
			
		}
	 }
	

}
