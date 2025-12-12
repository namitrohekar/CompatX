package com.namit.dtos.profile;

import java.time.Instant;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfileResponseDTO {

	  private Long profileId;
	  private Long userId;
	  
	  
	  
	    private String fullName;
	    private String address;
	    private String city;
	    private String state;
	    private String pincode;
	    private String phone;
	    private String alternatePhone;
	    private String landmark;
	    
	    // User info (for admin view)
	    private String username;
	    private String email;
	    
	    private Instant createdAt;
	    private Instant updatedAt;
	
}
