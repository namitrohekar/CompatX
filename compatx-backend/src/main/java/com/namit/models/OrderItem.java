package com.namit.models;

import java.time.Instant;

import org.springframework.data.annotation.CreatedDate;
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
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Entity
@Data
@EntityListeners(AuditingEntityListener.class)
@Table( name = "order_items")
public class OrderItem {

	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long orderItemId;
	
	
	
	@Column(nullable =false)
	@NotNull
	@Min(1)
	private Integer quantity;
	
	@Column(nullable =false)
	@NotNull
	@DecimalMin(value = "0.0", inclusive = false)
	private Double priceAtOrder;
	
	
	@Column(nullable =false)
	@NotNull
	@DecimalMin(value = "0.0", inclusive = false)
	private Double subtotal;
	
	
	@CreatedDate
	private Instant createdAt;
	
	
	// Mappings Required 
	
	@ManyToOne
	@JoinColumn( name = "product_id" , nullable = false)
	private Product product;
	
	@ManyToOne
	@JoinColumn( name = "order_id" , nullable = false)
	@JsonIgnore
	private Order order;
	
	
	@PrePersist
	@PreUpdate
	public void calculateSubtotal() {
		
		if(priceAtOrder != null && quantity !=null) {
			this.subtotal = priceAtOrder * quantity;
		}
	}
	
	
}
