import axiosClient from "../lib/axiosClient";

// creating an object that will contain all my order related APIs , a basic service layer

const orderService = {


// USER APIs

  // Get order preview (checkout page)
  getOrderPreview: async () => {
    try {
      const response = await axiosClient.get("/user/orders/preview");
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          "Failed to fetch order preview",
      };
    }
  },

  // Place order
  placeOrder: async (orderData) => {
    try {
      const response = await axiosClient.post("/user/orders", orderData);
      console.log("🔍 [ORDER SERVICE] Backend Response:", response);
      console.log("🔍 [ORDER SERVICE] Response Data:", response.data);
      
      // Backend returns the order object directly in response.data, not response.data.data
      return {
        success: true,
        data: response.data,  // Changed from response.data.data
        message: "Order placed successfully",
      };
    } catch (error) {
      console.error("❌ [ORDER SERVICE] Error:", error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          "Failed to place order",
      };
    }
  },

  // Get user orders (paginated)
  getUserOrders: async (page = 0, size = 10) => {
    try {
      const response = await axiosClient.get("/user/orders", {
        params: { page, size },
      });
      console.log("🔍 [GET ORDERS] Response:", response.data);
      
      // Backend returns Spring Page object with content array
      return {
        success: true,
        data: response.data.content || response.data,  // Extract content from Page
      };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          "Failed to fetch orders",
      };
    }
  },

  // Get single order (user)
  getOrderById: async (orderId) => {
    try {
      const response = await axiosClient.get(
        `/user/orders/${orderId}`
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          "Failed to fetch order details",
      };
    }
  },

  // Cancel order
  cancelOrder: async (orderId, reason) => {
    try {
      const response = await axiosClient.put(
        `/user/orders/${orderId}/cancel`,
        { reason: reason }
      );
      return {
        success: true,
        message: response.data || "Order cancelled successfully",
      };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          "Failed to cancel order",
      };
    }
  },

 // ADMIN APIs

  getAllOrders: async (filters = {}) => {
    try {
      const response = await axiosClient.get("/admin/orders", {
        params: filters,
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          "Failed to fetch all orders",
      };
    }
  },

  getOrderByIdAdmin: async (orderId) => {
    try {
      const response = await axiosClient.get(
        `/admin/orders/${orderId}`
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          "Failed to fetch order details",
      };
    }
  },

  updateOrderStatus: async (orderId, status) => {
    try {
      const response = await axiosClient.put(
        `/admin/orders/${orderId}/status`,
        { status }
      );
      return {
        success: true,
        data: response.data,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          "Failed to update order status",
      };
    }
  },

  getOrderStats: async () => {
    try {
      const response = await axiosClient.get(
        "/admin/orders/stats"
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          "Failed to fetch order stats",
      };
    }
  },

  getOrdersByStatus: async (status, page = 0, size = 10) => {
    try {
      const response = await axiosClient.get(
        `/admin/orders/status/${status}`,
        { params: { page, size } }
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          "Failed to fetch orders by status",
      };
    }
  },
};

export default orderService;
