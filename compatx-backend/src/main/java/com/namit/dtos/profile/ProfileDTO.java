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
public class ProfileDTO {

    @NotBlank
    private String fullName;

    @NotBlank
    @Size(min = 10, max = 500)
    private String address;

    @NotBlank
    private String city;

    @NotBlank
    private String state;

    @NotBlank
    @Pattern(regexp = "^[1-9][0-9]{5}$")
    private String pincode;

    @NotBlank
    @Pattern(
    		  regexp = "^(\\+91|0)?[6-9]\\d{9}$",
    		  message = "Invalid Indian phone number"
    		)
    private String phone;

    
    @Pattern(
    		  regexp = "^(\\+91|0)?[6-9]\\d{9}$",
    		  message = "Invalid Indian alternate phone number"
    		)
    private String alternatePhone;


    private String landmark;
}
