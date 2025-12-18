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
import jakarta.persistence.OneToOne;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Entity
@Data
@EntityListeners(AuditingEntityListener.class)
public class AppUserProfile {

	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long ProfileId;
	
	@Column(nullable = false , length = 500) @NotBlank
	private String address;
	
	@Column(nullable = false) @NotBlank
	private String phone;
	

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false)
    private String city;

    @Column(nullable = false)
    private String state;

    @Column(nullable = false)
    private String pincode;

    @Column
    private String landmark;

    @Column
    private String alternatePhone;
	
	@CreatedDate
	private Instant createdAt;
	
	
	@LastModifiedDate
	private Instant updatedAt;
	
	
//	keeping the unidirectional flow 
	 @OneToOne
	  @JoinColumn(name = "user_id", nullable = false)
	 @JsonIgnore
	  private AppUser user;
	
	
	
	
	
	
}
