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
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Entity
@Data
@EntityListeners(AuditingEntityListener.class)

public class Product {


	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long Id;
	
	
	@Column(nullable = false )
	@NotBlank( message = " Product name is Required ")
	private String productName;
	
	
	@Column(nullable = false )
	@NotBlank(message = "Brand name is Required")
	private String brand;
	
	
	@Column( length = 2000)
	private String description;
	
	
	@Column(nullable = false)
	@NotNull(message = "Price is required")
	@DecimalMin( value = "0.0" , inclusive = false , message = " price must be greater than 0 ")
	private Double price;
	
	@Column(nullable = false )
	@NotNull(message = " Stock is required ")
	@Min( value = 0 , message = " Stock can not be negative ")
	private Integer stock;
	
	
	@Column( length = 500)
	private String imageUrl;
	
	
	
	
	@CreatedDate
    private Instant createdAt;
    
    @LastModifiedDate
    private Instant updatedAt;
	
	
	
	@ManyToOne
	@JoinColumn( name = "category_id" , nullable = false )
	private Category category;
	
	
	
	@ManyToOne
	@JoinColumn( name = "user_id" , nullable = false )
	@JsonIgnore
	private AppUser user;
	
	
	
	
	
	
	
	
	
}
