import { create } from "zustand";
import cartService from "../services/cartService";

const useCartStore = create((set, get) => ({
  // initial states

  cart: null,
  cartCount: 0,
  loading: false,
  error: null,

  // Fetch cart

  fetchCart: async () => {
    set({ loading: true, error: null });
    const result = await cartService.getCart();
    if (result.success) {
      set({
        cart: result.data,
        cartCount: result.data?.totalItems || 0,
        loading: false,
      });
    } else {
      set({
        error: result.error,
        loading: false,
      });
    }
  },

  // Add to cart

  addToCart: async (productId, quantity = 1) => {
    const result = await cartService.addToCart(productId, quantity);
    if (result.success) {
      set({
        cart: result.data,
        cartCount: result.data?.totalItems || 0,
      });
      return {
        success: true,
        message: result.message,
      };
    } else {
      return {
        success: false,
        error: result.error,
      };
    }
  },

  // update quantity
  updateQuantity: async (cartItemId, quantity) => {
    const result = await cartService.updateCartItem(cartItemId, quantity);

    if (result.success) {
      set({
        cart: result.data,
        cartCount: result.data?.totalItems || 0,
      });
      return { success: true };
    } else {
      return {
        success: false,
        error: result.error,
      };
    }
  },

  // remove item
  removeItem: async (cartItemId) => {
    const result = await cartService.removeCartItem(cartItemId);

    if (result.success) {
      set({
        cart: result.data,
        cartCount: result.data?.totalItems || 0,
      });
      return {
        success: true,
      };
    } else {
      return {
        success: false,
        error: result.error,
      };
    }
  },

  // clear cart
  clearCart: async () => {
    const result = await cartService.clearCart();

    if (result.success) {
      set({
        cart: null,
        cartCount: 0,
      });

      return {
        success: true,
      };
    } else {
      return {
        success: false,
        error: result.error,
      };
    }
  },

  // Fetch cart count only for navbar display

  fetchCartCount: async () => {
    const result = await cartService.getCartItemCount();
    set({
      cartCount: result.count,
    });
  },
}));

export default useCartStore;
