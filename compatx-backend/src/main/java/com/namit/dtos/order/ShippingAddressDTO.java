package com.namit.dtos.order;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShippingAddressDTO {
    private String fullName;
    private String address;
    private String city;
    private String state;
    private String pincode;
    private String phone;
    private String landmark;
    private String alternatePhone;
}