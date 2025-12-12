import axiosClient from "../lib/axiosClient";

/**
 * Stripe Service
 * Handles Stripe Checkout integration using modern URL-based redirect
 */

const stripeService = {
  /**
   * Create Stripe Checkout Session and redirect to Stripe
   * @param {number} orderId - Order ID
   * @param {number} amount - Order amount
   */
  createCheckoutSession: async (orderId, amount) => {
    try {
      console.log("🔵 Creating Stripe Checkout Session...", { orderId, amount });

      // Create checkout session on backend
      const response = await axiosClient.post("/payments/create-checkout-session", {
        orderId,
        amount,
      });

      console.log("✅ Backend response:", response.data);

      const { sessionId, url } = response.data;

      if (!sessionId && !url) {
        console.error("❌ No sessionId or URL in response:", response.data);
        return {
          success: false,
          error: "No session ID or URL returned from server",
        };
      }

      console.log("🔵 Session ID received:", sessionId);

      // Modern approach: Use URL if provided, otherwise construct it
      const checkoutUrl = url || `https://checkout.stripe.com/c/pay/${sessionId}`;
      
      console.log("🔵 Redirecting to Stripe Checkout URL:", checkoutUrl);

      // Redirect using window.location (modern approach)
      window.location.href = checkoutUrl;

      // This line should never be reached if redirect is successful
      return {
        success: true,
      };
    } catch (error) {
      console.error("❌ Stripe service error:", error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.response?.data ||
          error.message ||
          "Failed to create checkout session",
      };
    }
  },
};

export default stripeService;
