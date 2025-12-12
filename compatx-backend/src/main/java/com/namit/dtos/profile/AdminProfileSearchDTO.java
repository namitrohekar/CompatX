package com.namit.dtos.profile;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminProfileSearchDTO {
    private String searchTerm;  // Search by name, email, phone
    private String city;
    private String state;
    private String pincode;
}