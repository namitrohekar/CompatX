package com.namit.services;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.namit.dtos.order.AdminOrderResponseDTO;
import com.namit.dtos.order.CancelOrderRequest;
import com.namit.dtos.order.OrderItemResponseDTO;
import com.namit.dtos.order.OrderResponseDTO;
import com.namit.dtos.order.OrderStatsDTO;
import com.namit.dtos.order.OrderSummaryDTO;
import com.namit.dtos.order.PlaceOrderRequest;
import com.namit.dtos.order.ShippingAddressDTO;
import com.namit.dtos.order.UpdateOrderStatusRequest;
import com.namit.enums.OrderStatus;
import com.namit.enums.PaymentStatus;
import com.namit.globalexceptions.CartEmptyException;
import com.namit.models.AppUser;
import com.namit.models.AppUserProfile;
import com.namit.models.Cart;
import com.namit.models.CartItem;
import com.namit.models.Order;
import com.namit.models.OrderItem;
import com.namit.models.Product;
import com.namit.repositories.AppUserProfileRepository;
import com.namit.repositories.AppUserRepository;
import com.namit.repositories.CartRepository;

import com.namit.repositories.OrderRepository;
import com.namit.specifications.OrderSpecifications;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class OrderService {

        private final OrderRepository orderRepository;
        // private final OrderItemRepository orderItemRepository;
        private final CartRepository cartRepository;
        private final AppUserRepository userRepository;
        private final AppUserProfileRepository profileRepository;
        private final EmailService emailService;

        // USER

        public ResponseEntity<?> getOrderPreview(Long userId) {

                Cart cart = cartRepository.findByUser_UserId(userId)
                                .orElseThrow(() -> new RuntimeException("Cart not found"));

                if (cart.getItems().isEmpty()) {
                        throw new CartEmptyException("Cart is empty");
                }

                // Map Cart items to OrderItemResponseDTOs
                List<OrderItemResponseDTO> items = cart.getItems().stream()
                                .map(this::mapCartItemToResponse)
                                .collect(Collectors.toList());

                // Calculate tax and shipping for preview
                double subtotal = cart.getTotalPrice();
                double taxAmount = 0.0; // or calculate as needed
                double shippingCharges = subtotal >= 999 ? 0.0 : 49.0;
                double totalAmount = subtotal + taxAmount + shippingCharges;

                return ResponseEntity.ok(
                                OrderResponseDTO.builder()
                                                .status(OrderStatus.PENDING) // Preview status
                                                .paymentStatus(PaymentStatus.PENDING)
                                                .orderItems(items)
                                                .subtotal(subtotal)
                                                .taxAmount(taxAmount)
                                                .shippingCharges(shippingCharges)
                                                .totalAmount(totalAmount)
                                                .totalItems(cart.getTotalItems())
                                                .createdAt(Instant.now())
                                                .build());
        }

        private OrderItemResponseDTO mapCartItemToResponse(CartItem cartItem) {
                Product product = cartItem.getProduct();
                return OrderItemResponseDTO.builder()
                                .orderItemId(null) // No order item ID yet
                                .quantity(cartItem.getQuantity())
                                .priceAtOrder(cartItem.getPriceAtAdd()) // Using current price/add price
                                .subtotal(cartItem.getPriceAtAdd() * cartItem.getQuantity())
                                .product(com.namit.dtos.order.ProductInOrderDTO.builder()
                                                .productId(product.getId()) // Fixed: getId() instead of getProductId()
                                                .productName(product.getProductName())
                                                .imageUrl(product.getImageUrl())
                                                .build())
                                .build();
        }

        public ResponseEntity<?> placeOrder(Long userId, PlaceOrderRequest request) {

                AppUser user = userRepository.findById(userId)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                Cart cart = cartRepository.findByUser_UserId(userId)
                                .orElseThrow(() -> new RuntimeException("Cart not found"));

                if (cart.getItems().isEmpty()) {
                        throw new RuntimeException("Cart is empty");
                }

                Order order = new Order();
                order.setUser(user);
                order.setStatus(OrderStatus.PENDING);
                order.setPaymentMethod(request.getPaymentMethod());
                order.setPaymentStatus(PaymentStatus.PENDING);
                order.setSubtotal(cart.getTotalPrice());
                order.setTaxAmount(0.0);
                order.setShippingCharges(0.0);
                order.setTotalAmount(cart.getTotalPrice());
                order.setOrderNotes(request.getOrderNotes());

                // SHIPPING
                if (Boolean.TRUE.equals(request.getUseProfileAddress())) {

                        AppUserProfile profile = profileRepository.findByUserUserId(userId)
                                        .orElseThrow(() -> new RuntimeException("Profile not found"));

                        order.setShippingFullName(profile.getFullName());
                        order.setShippingAddress(profile.getAddress());
                        order.setShippingCity(profile.getCity());
                        order.setShippingState(profile.getState());
                        order.setShippingPincode(profile.getPincode());
                        order.setShippingPhone(profile.getPhone());
                        order.setShippingLandmark(profile.getLandmark());
                        order.setAlternatePhone(profile.getAlternatePhone());

                } else {

                        order.setShippingFullName(request.getShippingFullName());
                        order.setShippingAddress(request.getShippingAddress());
                        order.setShippingCity(request.getShippingCity());
                        order.setShippingState(request.getShippingState());
                        order.setShippingPincode(request.getShippingPincode());
                        order.setShippingPhone(request.getShippingPhone());
                        order.setShippingLandmark(request.getShippingLandmark());
                        order.setAlternatePhone(request.getAlternatePhone());
                }

                // ORDER ITEMS
                for (CartItem cartItem : cart.getItems()) {

                        Product product = cartItem.getProduct();

                        if (product.getStock() < cartItem.getQuantity()) {
                                throw new RuntimeException(
                                                "Insufficient stock for product: " + product.getProductName());
                        }

                        product.setStock(product.getStock() - cartItem.getQuantity());

                        OrderItem orderItem = new OrderItem();
                        orderItem.setProduct(product);
                        orderItem.setQuantity(cartItem.getQuantity());
                        orderItem.setPriceAtOrder(cartItem.getPriceAtAdd());

                        order.addOrderItem(orderItem);
                }

                Order savedOrder = orderRepository.save(order);
                cart.clearItems();

                // AUTO-CONFIRM STRIPE ORDERS (TEST MODE SIMULATION)
                // In production, this would be done via webhook after actual payment
                if (savedOrder.getPaymentMethod() == com.namit.enums.PaymentMethod.STRIPE) {
                        savedOrder.setStatus(OrderStatus.CONFIRMED);
                        savedOrder.setPaymentStatus(PaymentStatus.COMPLETED);
                        savedOrder.setConfirmedAt(Instant.now());
                        savedOrder.setTransactionId("stripe_test_" + System.currentTimeMillis());
                        orderRepository.save(savedOrder);
                }

                // Generate delivery OTP and send confirmation email
                try {
                        // Generate 6-digit OTP
                        String deliveryOtp = generateDeliveryOTP();
                        savedOrder.setDeliveryOtp(deliveryOtp);
                        savedOrder.setOtpGeneratedAt(Instant.now());
                        savedOrder.setOtpExpiresAt(Instant.now().plus(7, java.time.temporal.ChronoUnit.DAYS));
                        savedOrder.setOtpVerified(false);
                        orderRepository.save(savedOrder);

                        // Send order confirmation email
                        emailService.sendOrderConfirmationEmail(
                                        user.getEmail(),
                                        savedOrder.getShippingFullName(),
                                        savedOrder.getOrderId(),
                                        deliveryOtp,
                                        savedOrder.getTotalAmount(),
                                        savedOrder.getPaymentMethod().toString(),
                                        savedOrder.getShippingAddress(),
                                        savedOrder.getShippingCity(),
                                        savedOrder.getShippingState(),
                                        savedOrder.getShippingPincode(),
                                        savedOrder.getTotalItems(),
                                        savedOrder.getOrderItems());
                } catch (Exception e) {
                        // Log error but don't fail the order
                        System.err.println("Failed to send order confirmation email: " + e.getMessage());
                }

                return ResponseEntity.ok(mapToOrderResponse(savedOrder));
        }

        public ResponseEntity<?> getUserOrders(Long userId, Integer page, Integer size) {

                Page<Order> orders = orderRepository.findByUser_UserIdOrderByCreatedAtDesc(
                                userId,
                                PageRequest.of(page, size));

                return ResponseEntity.ok(
                                orders.map(this::mapToSummaryDTO));
        }

        public ResponseEntity<?> getOrderById(Long userId, Long orderId) {

                Order order = orderRepository.findByOrderIdAndUser_UserId(orderId, userId)
                                .orElseThrow(() -> new RuntimeException("Order not found"));

                return ResponseEntity.ok(mapToOrderResponse(order));
        }

        public ResponseEntity<?> cancelOrder(Long userId, Long orderId, CancelOrderRequest request) {

                Order order = orderRepository.findByOrderIdAndUser_UserId(orderId, userId)
                                .orElseThrow(() -> new RuntimeException("Order not found"));

                if (order.getStatus() == OrderStatus.DELIVERED) {
                        throw new RuntimeException("Delivered order cannot be cancelled");
                }

                order.setStatus(OrderStatus.CANCELLED);
                order.setCancellationReason(request.getReason());
                order.setCancelledAt(Instant.now());

                // restore stock
                for (OrderItem item : order.getOrderItems()) {
                        Product product = item.getProduct();
                        product.setStock(product.getStock() + item.getQuantity());
                }

                return ResponseEntity.ok("Order cancelled successfully");
        }

        /**
         * Confirm payment for an order after Razorpay verification
         * Updates order with payment details and changes status to CONFIRMED
         */
        public ResponseEntity<?> confirmPayment(Long userId, Long orderId,
                        String razorpayOrderId,
                        String razorpayPaymentId,
                        String paymentSignature) {

                Order order = orderRepository.findByOrderIdAndUser_UserId(orderId, userId)
                                .orElseThrow(() -> new RuntimeException("Order not found"));

                // Update payment details
                order.setRazorpayOrderId(razorpayOrderId);
                order.setRazorpayPaymentId(razorpayPaymentId);
                order.setPaymentSignature(paymentSignature);
                order.setPaymentStatus(PaymentStatus.COMPLETED);
                order.setStatus(OrderStatus.CONFIRMED);
                order.setConfirmedAt(Instant.now());

                orderRepository.save(order);

                return ResponseEntity.ok("Payment confirmed successfully");
        }

        // ADMIN

        public ResponseEntity<?> getAllOrders(OrderStatus status, String keyword, String sortField,
                        String sortDirection, Integer page, Integer size) {

                Sort sort = sortDirection.equalsIgnoreCase("desc")
                                ? Sort.by(sortField).descending()
                                : Sort.by(sortField).ascending();

                Specification<Order> spec = Specification
                                .where(OrderSpecifications.hasStatus(status))
                                .and(OrderSpecifications.keywordSearch(keyword));

                Page<Order> orders = orderRepository.findAll(spec, PageRequest.of(page, size, sort));

                return ResponseEntity.ok(
                                orders.map(this::mapToAdminResponse));
        }

        public ResponseEntity<?> getOrderByIdAdmin(Long orderId) {

                Order order = orderRepository.findByIdWithItems(orderId)
                                .orElseThrow(() -> new RuntimeException("Order not found"));

                return ResponseEntity.ok(mapToAdminResponse(order));
        }

        public ResponseEntity<?> updateOrderStatus(Long orderId, UpdateOrderStatusRequest request) {

                Order order = orderRepository.findById(orderId)
                                .orElseThrow(() -> new RuntimeException("Order not found"));

                order.setStatus(request.getStatus());

                if (request.getStatus() == OrderStatus.CONFIRMED) {
                        order.setConfirmedAt(Instant.now());
                }
                if (request.getStatus() == OrderStatus.SHIPPED) {
                        order.setShippedAt(Instant.now());
                }
                if (request.getStatus() == OrderStatus.DELIVERED) {
                        order.setDeliveredAt(Instant.now());
                        order.setPaymentStatus(PaymentStatus.COMPLETED);
                }

                return ResponseEntity.ok("Order status updated");
        }

        public ResponseEntity<?> getOrderStats() {

                return ResponseEntity.ok(
                                OrderStatsDTO.builder()
                                                .totalOrders(orderRepository.count())
                                                .pendingOrders(orderRepository.countByStatus(OrderStatus.PENDING))
                                                .confirmedOrders(orderRepository.countByStatus(OrderStatus.CONFIRMED))
                                                .shippedOrders(orderRepository.countByStatus(OrderStatus.SHIPPED))
                                                .deliveredOrders(orderRepository.countByStatus(OrderStatus.DELIVERED))
                                                .cancelledOrders(orderRepository.countByStatus(OrderStatus.CANCELLED))
                                                .build());
        }

        public ResponseEntity<?> getOrdersByStatus(OrderStatus status, Integer page, Integer size) {

                Page<Order> orders = orderRepository.findByStatusOrderByCreatedAtDesc(
                                status, PageRequest.of(page, size));

                return ResponseEntity.ok(
                                orders.map(this::mapToSummaryDTO));
        }

        // ADMIN - MULTI-TENANT FILTERED METHODS

        /**
         * Get all orders containing products owned by the admin
         * Filters by product ownership using JOIN query
         */
        public ResponseEntity<?> getOrdersForAdmin(Long userId, OrderStatus status, String keyword,
                        String sortField, String sortDirection, Integer page, Integer size) {

                Sort sort = sortDirection.equalsIgnoreCase("desc")
                                ? Sort.by(sortField).descending()
                                : Sort.by(sortField).ascending();

                Page<Order> orders;

                if (status != null) {
                        // Filter by status
                        orders = orderRepository.findOrdersForAdminByStatus(
                                        userId, status, PageRequest.of(page, size, sort));
                } else {
                        // All orders for this admin
                        orders = orderRepository.findOrdersForAdmin(
                                        userId, PageRequest.of(page, size, sort));
                }

                // TODO: Add keyword search if needed (requires Specification with admin filter)

                return ResponseEntity.ok(
                                orders.map(this::mapToAdminResponse));
        }

        /**
         * Get order stats for admin's products only
         */
        public ResponseEntity<?> getOrderStatsForAdmin(Long userId) {

                return ResponseEntity.ok(
                                OrderStatsDTO.builder()
                                                .totalOrders(orderRepository.countOrdersForAdmin(userId))
                                                .pendingOrders(orderRepository.countOrdersForAdminByStatus(userId,
                                                                OrderStatus.PENDING))
                                                .confirmedOrders(orderRepository.countOrdersForAdminByStatus(userId,
                                                                OrderStatus.CONFIRMED))
                                                .shippedOrders(orderRepository.countOrdersForAdminByStatus(userId,
                                                                OrderStatus.SHIPPED))
                                                .deliveredOrders(orderRepository.countOrdersForAdminByStatus(userId,
                                                                OrderStatus.DELIVERED))
                                                .cancelledOrders(orderRepository.countOrdersForAdminByStatus(userId,
                                                                OrderStatus.CANCELLED))
                                                .totalRevenue(orderRepository.getTotalRevenueForAdmin(userId))
                                                .build());
        }

        /**
         * Get orders by status for admin
         */
        public ResponseEntity<?> getOrdersByStatusForAdmin(Long userId, OrderStatus status, Integer page,
                        Integer size) {

                Page<Order> orders = orderRepository.findOrdersForAdminByStatus(
                                userId, status, PageRequest.of(page, size));

                return ResponseEntity.ok(
                                orders.map(this::mapToSummaryDTO));
        }

        /**
         * Get order by ID for admin (with ownership check)
         * Admin can only view orders containing their products
         * Admin can only view orders containing their products
         */
        public ResponseEntity<?> getOrderByIdForAdmin(Long userId, Long orderId) {

                Order order = orderRepository.findByIdWithItems(orderId)
                                .orElseThrow(() -> new RuntimeException("Order not found"));

                // Check if admin owns at least one product in this order
                boolean ownsProduct = order.getOrderItems().stream()
                                .anyMatch(item -> item.getProduct().getUser().getUserId().equals(userId));

                if (!ownsProduct) {
                        throw new RuntimeException("Access denied: Order does not contain your products");
                }

                return ResponseEntity.ok(mapToAdminResponse(order));
        }

        // HELPER METHODS

        /**
         * Generate a random 6-digit OTP for delivery verification
         */
        private String generateDeliveryOTP() {
                java.util.Random random = new java.util.Random();
                int otp = 100000 + random.nextInt(900000); // Generates 100000-999999
                return String.valueOf(otp);
        }

        /**
         * Verify delivery OTP and mark order as delivered
         */
        public ResponseEntity<?> verifyDeliveryOTP(Long userId, Long orderId, String otp) {

                // Find order and check if admin owns products in it
                Order order = orderRepository.findByIdWithItems(orderId)
                                .orElseThrow(() -> new RuntimeException("Order not found"));

                // Security check: Admin can only verify orders containing their products
                boolean ownsProduct = order.getOrderItems().stream()
                                .anyMatch(item -> item.getProduct().getUser().getUserId().equals(userId));

                if (!ownsProduct) {
                        return ResponseEntity.badRequest().body("Access denied: Order does not contain your products");
                }

                // Check if OTP matches
                if (order.getDeliveryOtp() == null || !otp.equals(order.getDeliveryOtp())) {
                        return ResponseEntity.badRequest().body("Invalid OTP");
                }

                // Check if OTP is expired
                if (order.getOtpExpiresAt() != null && Instant.now().isAfter(order.getOtpExpiresAt())) {
                        return ResponseEntity.badRequest().body("OTP has expired");
                }

                // Check if already verified
                if (Boolean.TRUE.equals(order.getOtpVerified())) {
                        return ResponseEntity.badRequest().body("OTP already verified. Order already delivered.");
                }

                // Mark as verified and delivered
                order.setOtpVerified(true);
                order.setStatus(OrderStatus.DELIVERED);
                order.setDeliveredAt(Instant.now());

                // Mark payment as completed for COD orders
                if (order.getPaymentStatus() == PaymentStatus.PENDING) {
                        order.setPaymentStatus(PaymentStatus.COMPLETED);
                }

                orderRepository.save(order);

                return ResponseEntity.ok("Delivery verified successfully. Order marked as DELIVERED.");
        }
        // MAPPERS

        private OrderSummaryDTO mapToSummaryDTO(Order order) {

                List<OrderItemResponseDTO> items = order.getOrderItems().stream()
                                .map(oi -> OrderItemResponseDTO.builder()
                                                .orderItemId(oi.getOrderItemId())
                                                .quantity(oi.getQuantity())
                                                .priceAtOrder(oi.getPriceAtOrder())
                                                .subtotal(oi.getSubtotal())
                                                .product(com.namit.dtos.order.ProductInOrderDTO.builder()
                                                                .productId(oi.getProduct().getId())
                                                                .productName(oi.getProduct().getProductName())
                                                                .imageUrl(oi.getProduct().getImageUrl())
                                                                .build())
                                                .build())
                                .collect(Collectors.toList());

                return OrderSummaryDTO.builder()
                                .orderId(order.getOrderId())
                                .status(order.getStatus())
                                .paymentMethod(order.getPaymentMethod())
                                .paymentStatus(order.getPaymentStatus())
                                .totalItems(order.getTotalItems())
                                .totalAmount(order.getTotalAmount())
                                .createdAt(order.getCreatedAt())
                                .updatedAt(order.getUpdatedAt())
                                .orderItems(items)
                                .build();
        }

        private OrderResponseDTO mapToOrderResponse(Order order) {

                List<OrderItemResponseDTO> items = order.getOrderItems().stream()
                                .map(oi -> OrderItemResponseDTO.builder()
                                                .orderItemId(oi.getOrderItemId())
                                                .quantity(oi.getQuantity())
                                                .priceAtOrder(oi.getPriceAtOrder())
                                                .subtotal(oi.getSubtotal())
                                                .product(com.namit.dtos.order.ProductInOrderDTO.builder()
                                                                .productId(oi.getProduct().getId())
                                                                .productName(oi.getProduct().getProductName())
                                                                .brand(oi.getProduct().getBrand())
                                                                .imageUrl(oi.getProduct().getImageUrl())
                                                                .build())
                                                .build())
                                .collect(Collectors.toList());

                return OrderResponseDTO.builder()
                                .orderId(order.getOrderId())
                                .status(order.getStatus())
                                .paymentMethod(order.getPaymentMethod())
                                .paymentStatus(order.getPaymentStatus())
                                .orderItems(items)
                                .subtotal(order.getSubtotal())
                                .taxAmount(order.getTaxAmount())
                                .shippingCharges(order.getShippingCharges())
                                .totalAmount(order.getTotalAmount())
                                .totalItems(order.getTotalItems())
                                .shippingAddress(ShippingAddressDTO.builder()
                                                .fullName(order.getShippingFullName())
                                                .address(order.getShippingAddress())
                                                .city(order.getShippingCity())
                                                .state(order.getShippingState())
                                                .pincode(order.getShippingPincode())
                                                .phone(order.getShippingPhone())
                                                .landmark(order.getShippingLandmark())
                                                .alternatePhone(order.getAlternatePhone())
                                                .build())
                                .orderNotes(order.getOrderNotes())
                                .cancellationReason(order.getCancellationReason())
                                .transactionId(order.getTransactionId())
                                .createdAt(order.getCreatedAt())
                                .updatedAt(order.getUpdatedAt())
                                .confirmedAt(order.getConfirmedAt())
                                .shippedAt(order.getShippedAt())
                                .deliveredAt(order.getDeliveredAt())
                                .cancelledAt(order.getCancelledAt())
                                .build();
        }

        private AdminOrderResponseDTO mapToAdminResponse(Order order) {

                return AdminOrderResponseDTO.builder()
                                .orderId(order.getOrderId())
                                .user(com.namit.dtos.order.UserInfoDTO.builder()
                                                .userId(order.getUser().getUserId())
                                                .userName(order.getUser().getEmail())
                                                .email(order.getUser().getEmail())
                                                .build())
                                .status(order.getStatus())
                                .paymentMethod(order.getPaymentMethod())
                                .paymentStatus(order.getPaymentStatus())
                                .totalItems(order.getTotalItems())
                                .totalAmount(order.getTotalAmount())
                                .shippingAddress(ShippingAddressDTO.builder()
                                                .fullName(order.getShippingFullName())
                                                .address(order.getShippingAddress())
                                                .city(order.getShippingCity())
                                                .state(order.getShippingState())
                                                .pincode(order.getShippingPincode())
                                                .phone(order.getShippingPhone())
                                                .landmark(order.getShippingLandmark())
                                                .alternatePhone(order.getAlternatePhone())
                                                .build())
                                .createdAt(order.getCreatedAt())
                                .build();
        }
}
