package com.namit.models;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import lombok.Data;


@Entity
@Data
@EntityListeners(AuditingEntityListener.class)
public class Cart {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long cartId;
	
	
	@OneToOne
	@JoinColumn( name = "user_id" , nullable = false , unique = true)
	@JsonIgnore
	private AppUser user;
	
	

	@OneToMany(mappedBy = "cart" , cascade = CascadeType.ALL , orphanRemoval = true)
	private List<CartItem> items = new ArrayList<>();
	
	@CreatedDate
	private Instant createdAt;
	
	@LastModifiedDate
	private Instant updatedAt;
	
	
	// Helper methods 
	
	
	public void addItem(CartItem item) {
		items.add(item);
		item.setCart(this);
		
		
	}
	
	public void removeItem( CartItem item) {
		items.remove(item);
		item.setCart(null);
	}
	
	public void clearItems() {
		items.forEach(item -> item.setCart(null));
		items.clear();
	}
	
	
	
	// calculate total price 
	
	public Double getTotalPrice() {
		return items.stream()
				.mapToDouble(CartItem::getSubtotal)
				.sum();
	}
	
	
	 public Integer getTotalItems() {
	        return items.stream()
	            .mapToInt(CartItem::getQuantity)
	            .sum();
	    }
	
	
	
	
	
	
	
	
	
	
	
	
	
	
}
