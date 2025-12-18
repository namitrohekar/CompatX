package com.namit.dtos.order;

import com.namit.enums.PaymentMethod;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlaceOrderRequest {

    @NotNull
    private PaymentMethod paymentMethod;

    private String orderNotes;

    // If true  use profile address
    @Builder.Default
    private Boolean useProfileAddress = true;

    // If useProfileAddress = false → these are required
    private String shippingFullName;
    private String shippingAddress;
    private String shippingCity;
    private String shippingState;
    private String shippingPincode;
    private String shippingPhone;
    private String shippingLandmark;
    private String alternatePhone;
}
