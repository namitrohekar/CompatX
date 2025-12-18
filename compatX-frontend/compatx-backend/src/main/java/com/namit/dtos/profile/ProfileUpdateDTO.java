
package com.namit.dtos.profile;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfileUpdateDTO {

	@NotBlank(message = "Full Name is Required")
	@Size(min = 2, max = 100, message = "Full name must be between 2 to 100 charcters ")
	private String fullName;

	@NotBlank(message = "Address is required")
	@Size(min = 10, max = 500, message = "Address must be between 10 and 500 characters")
	private String address;

	@NotBlank(message = "City is required")
	@Size(min = 2, max = 100, message = "City name must be between 2 and 100 characters")
	private String city;

	@NotBlank(message = "State is required")
	@Size(min = 2, max = 100, message = "State name must be between 2 and 100 characters")
	private String state;

	@NotBlank(message = "Pincode is required")
	@Pattern(regexp = "^[1-9][0-9]{5}$", message = "Invalid pincode format")
	private String pincode;

	@NotBlank(message = "Phone number is required")
	@Pattern(regexp = "^(\\+91|0)?[6-9]\\d{9}$", message = "Invalid Indian phone number")
	private String phone;

	@Pattern(regexp = "^$|^(\\+91|0)?[6-9]\\d{9}$", message = "Invalid Indian alternate phone number")
	private String alternatePhone;

	@Size(max = 200, message = "Landmark must not exceed 200 characters")
	private String landmark;
}