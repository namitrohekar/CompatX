import axiosClient from "../lib/axiosClient";

// creating an object that will contain all my cart related APIs , maybe a basic service layer

const cartService = {
  // Getting Users cart

  getCart: async () => {
    try {
      const response = await axiosClient.get("/user/cart");
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to fetch cart",
      };
    }
  },

  //  Adding product to the users cart

  addToCart: async (productId, quantity = 1) => {
    try {
      const response = await axiosClient.post("/user/cart/add", {
        productId,
        quantity,
      });
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to add to cart",
      };
    }
  },

  // Updating the cart item quantity

  updateCartItem: async (cartItemId, quantity) => {
    try {
      const response = await axiosClient.put(`/user/cart/items/${cartItemId}`, {
        quantity,
      });
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to update cart",
      };
    }
  },

  // removing  item from users cart

  removeCartItem: async (cartItemId) => {
    try {
      const response = await axiosClient.delete(
        `/user/cart/items/${cartItemId}`
      );

      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          "Failed to remove the specified item",
      };
    }
  },

  clearCart: async () => {
    try {
      const response = await axiosClient.delete(`/user/cart`);
      return {
        success: true,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || " Failed to clear cart",
      };
    }
  },

  getCartItemCount: async () => {
    try {
      const response = await axiosClient.get("/user/cart/count");
      return {
        success: true,
        count: response.data.data || 0,
      };
    } catch (error) {
      return {
        success: false,
        count: 0,
        error: error.response?.data?.message || " Internal error",
      };
    }
  },
};

export default cartService;
