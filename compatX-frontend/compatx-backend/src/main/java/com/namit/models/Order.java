package com.namit.models;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.namit.enums.OrderStatus;
import com.namit.enums.PaymentMethod;
import com.namit.enums.PaymentStatus;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Entity
@Data
@EntityListeners(AuditingEntityListener.class)
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long orderId;

    @Column(nullable = false)
    @NotNull
    @DecimalMin(value = "0.0", inclusive = false)
    private Double subtotal;

    @Column(nullable = false)
    @NotNull
    @DecimalMin(value = "0.0")
    private Double taxAmount = 0.0;

    @Column(nullable = false)
    @NotNull
    @DecimalMin(value = "0.0")
    private Double shippingCharges = 0.0;

    @Column(nullable = false)
    @NotNull
    @DecimalMin(value = "0.0", inclusive = false)
    private Double totalAmount;

    @Column(nullable = false, length = 500)
    @NotBlank
    private String shippingAddress;

    @Column(nullable = false)
    @NotBlank
    private String shippingFullName;

    @Column(nullable = false)
    @NotBlank
    private String shippingPhone;

    @Column(nullable = false)
    @NotBlank
    private String shippingCity;

    @Column(nullable = false)
    @NotBlank
    private String shippingState;

    @Column(nullable = false)
    @NotBlank
    private String shippingPincode;

    @Column(length = 500)
    private String shippingLandmark;

    @Column
    private String alternatePhone;

    @Column
    private String transactionId;

    @Column(length = 1000)
    private String orderNotes;

    @Column(length = 1000)
    private String cancellationReason;

    // Razorpay Payment Tracking Fields
    @Column(length = 100)
    private String razorpayOrderId; // Razorpay order ID for payment tracking

    @Column(length = 100)
    private String razorpayPaymentId; // Razorpay payment transaction ID

    @Column(length = 500)
    private String paymentSignature; // Payment verification signature

    // Delivery OTP Fields (for secure package handover)
    @Column(length = 6)
    private String deliveryOtp; // 6-digit OTP for delivery verification

    @Column
    private Instant otpGeneratedAt; // When OTP was generated

    @Column
    private Instant otpExpiresAt; // OTP expiration time (7 days from generation)

    @Column
    private Boolean otpVerified = false; // Whether OTP has been verified

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;

    private Instant confirmedAt;
    private Instant shippedAt;
    private Instant deliveredAt;
    private Instant cancelledAt;

    // Enums

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status = OrderStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentMethod paymentMethod;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    // Mappings
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private AppUser user;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> orderItems = new ArrayList<>();

    // Helper methods
    public void addOrderItem(OrderItem item) {
        orderItems.add(item);
        item.setOrder(this);
    }

    public void removeOrderItem(OrderItem item) {
        orderItems.remove(item);
        item.setOrder(null);
    }

    public Integer getTotalItems() {
        return orderItems.stream()
                .mapToInt(OrderItem::getQuantity)
                .sum();
    }
}
