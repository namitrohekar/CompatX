package com.namit.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EmailService {

        private final JavaMailSender mailSender;

        @Value("${app.email.from}")
        private String fromEmail;

        @Value("${app.frontend.url}")
        private String frontendUrl;

        @Async
        public void sendPasswordResetEmail(String toEmail, String token) {
                String resetLink = frontendUrl + "/reset-password?token=" + token;

                SimpleMailMessage message = new SimpleMailMessage();
                message.setFrom(fromEmail);
                message.setTo(toEmail);
                message.setSubject("CompatX - Password Reset Request");
                message.setText(
                                "Hello,\n\n" +
                                                "You requested to reset your password. Click the link below to reset it:\n\n"
                                                +
                                                resetLink + "\n\n" +
                                                "This link will expire in 15 minutes.\n\n" +
                                                "If you didn't request this, please ignore this email.\n\n" +
                                                "Best regards,\n" +
                                                "CompatX Team");

                mailSender.send(message);
        }

        @Async
        public void sendOrderConfirmationEmail(
                        String toEmail,
                        String customerName,
                        Long orderId,
                        String deliveryOtp,
                        Double totalAmount,
                        String paymentMethod,
                        String shippingAddress,
                        String shippingCity,
                        String shippingState,
                        String shippingPincode,
                        int itemCount,
                        java.util.List<com.namit.models.OrderItem> orderItems) {

                SimpleMailMessage message = new SimpleMailMessage();
                message.setFrom(fromEmail);
                message.setTo(toEmail);
                message.setSubject("Your Order #" + orderId + " has been confirmed!");

                // Build items list
                StringBuilder itemsList = new StringBuilder();
                for (com.namit.models.OrderItem item : orderItems) {
                        itemsList.append(String.format("  • %s x%d - ₹%.2f\n",
                                        item.getProduct().getProductName(),
                                        item.getQuantity(),
                                        item.getSubtotal()));
                }

                String emailBody = String.format(
                                "Hi %s,\n\n" +
                                                "Great news! We've received your order and it's being processed.\n\n" +
                                                "ORDER SUMMARY\n" +
                                                "─────────────────────────────────────────\n" +
                                                "Order Number: #%d\n" +
                                                "Order Date: %s\n" +
                                                "Payment: %s\n\n" +
                                                "ITEMS ORDERED (%d items)\n" +
                                                "─────────────────────────────────────────\n" +
                                                "%s\n" +
                                                "Total Amount: ₹%.2f\n\n" +
                                                "DELIVERY INFORMATION\n" +
                                                "─────────────────────────────────────────\n" +
                                                "Shipping to:\n" +
                                                "%s\n" +
                                                "%s, %s\n" +
                                                "PIN: %s\n\n" +
                                                "DELIVERY VERIFICATION CODE\n" +
                                                "─────────────────────────────────────────\n" +
                                                "Your OTP: %s\n\n" +
                                                "Please share this code with our delivery partner when your order arrives.\n"
                                                +
                                                "This helps us ensure your package reaches you safely.\n" +
                                                "(Valid for 7 days)\n\n" +
                                                "WHAT'S NEXT?\n" +
                                                "─────────────────────────────────────────\n" +
                                                "• We'll send you tracking updates via email\n" +
                                                "• Track your order anytime: %s/orders/%d\n" +
                                                "• Expected delivery: 3-5 business days\n\n" +
                                                "Questions? We're here to help!\n" +
                                                "Reply to this email or contact our support team.\n\n" +
                                                "Thanks for shopping with us!\n" +
                                                "- The CompatX Team\n\n" +
                                                "────────────────────────────────────────────────────────\n" +
                                                "This is an automated message. Please do not reply directly.\n",
                                customerName,
                                orderId,
                                java.time.LocalDateTime.now().format(
                                                java.time.format.DateTimeFormatter.ofPattern("MMM dd, yyyy hh:mm a")),
                                paymentMethod.equals("CASH_ON_DELIVERY") ? "Cash on Delivery" : "Online Payment (Paid)",
                                itemCount,
                                itemsList.toString(),
                                totalAmount,
                                shippingAddress,
                                shippingCity,
                                shippingState,
                                shippingPincode,
                                deliveryOtp,
                                frontendUrl,
                                orderId);

                message.setText(emailBody);
                mailSender.send(message);
        }
}
