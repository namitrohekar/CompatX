import { create } from "zustand";
import orderService from "../services/orderService";

const useOrderStore = create((set, get) => ({
  orders: [],
  currentOrder: null,
  orderStats: null,
  loading: false,
  error: null,

  // USER ACTIONS

  // Fetch order preview for checkout
  fetchOrderPreview: async () => {
    set({ loading: true, error: null });

    const result = await orderService.getOrderPreview();

    if (result.success) {
      set({
        currentOrder: result.data,
        loading: false,
      });
    } else {
      set({
        error: result.error,
        loading: false,
      });
    }
  },

  // Place order
  placeOrder: async (orderData) => {
    const result = await orderService.placeOrder(orderData);

    if (result.success) {
      set({
        currentOrder: result.data,
        orders: [result.data, ...get().orders],
      });

      return {
        success: true,
        data: result.data,
        message: result.message,
      };
    } else {
      return {
        success: false,
        error: result.error,
      };
    }
  },

  // Fetch user orders
  fetchUserOrders: async (page = 0, size = 10) => {
    set({ loading: true, error: null });

    const result = await orderService.getUserOrders(page, size);

    if (result.success) {
      set({
        orders: result.data?.content || result.data || [],
        loading: false,
      });
    } else {
      set({
        error: result.error,
        loading: false,
      });
    }
  },

  // Fetch single order (user)
  fetchOrderById: async (orderId) => {
    set({ loading: true, error: null });

    const result = await orderService.getOrderById(orderId);

    if (result.success) {
      set({
        currentOrder: result.data,
        loading: false,
      });
    } else {
      set({
        error: result.error,
        loading: false,
      });
    }
  },

  // Cancel order
  cancelOrder: async (orderId, reason) => {
    const result = await orderService.cancelOrder(orderId, reason);

    if (result.success) {
      set({
        orders: get().orders.map((order) =>
          order.orderId === orderId ? { ...order, status: "CANCELLED" } : order
        ),
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

  // ADMIN ACTIONS

  fetchAllOrders: async (filters = {}) => {
    set({ loading: true, error: null });

    const result = await orderService.getAllOrders(filters);

    if (result.success) {
      set({
        orders: result.data?.content || result.data || [],
        loading: false,
      });
    } else {
      set({
        error: result.error,
        loading: false,
      });
    }
  },

  fetchOrderByIdAdmin: async (orderId) => {
    set({ loading: true, error: null });

    const result = await orderService.getOrderByIdAdmin(orderId);

    if (result.success) {
      set({
        currentOrder: result.data,
        loading: false,
      });
    } else {
      set({
        error: result.error,
        loading: false,
      });
    }
  },

  updateOrderStatus: async (orderId, status) => {
    const result = await orderService.updateOrderStatus(orderId, status);

    if (result.success) {
      set({
        orders: get().orders.map((order) =>
          order.orderId === orderId ? { ...order, status } : order
        ),
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

  fetchOrderStats: async () => {
    set({ loading: true, error: null });

    const result = await orderService.getOrderStats();

    if (result.success) {
      set({
        orderStats: result.data,
        loading: false,
      });
    } else {
      set({
        error: result.error,
        loading: false,
      });
    }
  },

  // HELPER METHODS

  clearOrders: () =>
    set({
      orders: [],
      currentOrder: null,
      orderStats: null,
      error: null,
    }),
}));

export default useOrderStore;
