import axiosClient from "../lib/axiosClient";

/**
 * Payment Service
 * Handles all payment-related API calls for Razorpay and Stripe
 */
const paymentService = {
  /**
   * Create a Razorpay payment order
   * Called when user selects Razorpay payment method
   * 
   * @param {number} orderId - Application order ID
   * @param {number} amount - Order amount
   * @returns {Promise} Response with razorpayOrderId, keyId, amount, currency
   */
  createPaymentOrder: async (orderId, amount) => {
    try {
      const response = await axiosClient.post("/payments/create-order", {
        orderId,
        amount,
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error creating payment order:", error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.response?.data ||
          "Failed to create payment order",
      };
    }
  },

  /**
   * Verify Razorpay payment after completion
   * Called after user completes payment in Razorpay Checkout
   * 
   * @param {object} paymentData - Payment verification data
   * @param {number} paymentData.orderId - Application order ID
   * @param {string} paymentData.razorpayOrderId - Razorpay order ID
   * @param {string} paymentData.razorpayPaymentId - Razorpay payment ID
   * @param {string} paymentData.razorpaySignature - Payment signature
   * @returns {Promise} Verification result
   */
  verifyPayment: async (paymentData) => {
    try {
      const response = await axiosClient.post("/payments/verify", paymentData);
      return {
        success: true,
        message: response.data,
      };
    } catch (error) {
      console.error("Error verifying payment:", error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.response?.data ||
          "Payment verification failed",
      };
    }
  },
};

export default paymentService;
