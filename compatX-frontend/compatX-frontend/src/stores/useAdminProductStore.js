import { create } from "zustand";
import adminProductService from "../services/adminProductService";
const useAdminProductStore = create((set, get) => ({
  // ========== STATE ==========
  products: [],
  currentProduct: null,
  stats: null,
  // Pagination
  page: 0,
  size: 10,
  totalPages: 1,
  totalElements: 0,
  // Filters
  keyword: "",
  categoryId: "",
  brand: "",
  minPrice: null,
  maxPrice: null,
  minStock: null,
  maxStock: null,
  sortField: "",
  sortDirection: "",
  // Loading states
  loading: false,
  productLoading: false,
  statsLoading: false,
  error: null,
  // ========== ACTIONS ==========
  /**
   * Fetch products with current filters and pagination
   */
  fetchProducts: async () => {
    set({ loading: true, error: null });
    const {
      keyword,
      categoryId,
      brand,
      minPrice,
      maxPrice,
      minStock,
      maxStock,
      sortField,
      sortDirection,
      page,
      size,
    } = get();
    const result = await adminProductService.filterProducts({
      keyword,
      categoryId,
      brand,
      minPrice,
      maxPrice,
      minStock,
      maxStock,
      sortField,
      sortDirection,
      page,
      size,
    });
    if (result.success) {
      set({
        products: result.data.items || [],
        page: result.data.page,
        size: result.data.size,
        totalPages: result.data.totalPages || 1,
        totalElements: result.data.totalElements || 0,
        loading: false,
      });
    } else {
      set({
        error: result.error,
        loading: false,
      });
    }
  },
  /**
   * Fetch single product by ID
   */
  fetchProduct: async (productId) => {
    set({ productLoading: true, error: null, currentProduct: null });
    const result = await adminProductService.getProduct(productId);
    if (result.success) {
      set({
        currentProduct: result.data,
        productLoading: false,
      });
      return { success: true, data: result.data };
    } else {
      set({
        error: result.error,
        productLoading: false,
      });
      return { success: false, error: result.error };
    }
  },
  /**
   * Create new product
   */
  createProduct: async (productData, categoryId) => {
    const result = await adminProductService.createProduct(
      productData,
      categoryId
    );
    if (result.success) {
      // Refresh product list
      await get().fetchProducts();
      return { success: true, message: result.message };
    } else {
      return { success: false, error: result.error };
    }
  },
  /**
   * Update existing product
   */
  updateProduct: async (productId, productData, categoryId) => {
    const result = await adminProductService.updateProduct(
      productId,
      productData,
      categoryId
    );
    if (result.success) {
      // Update current product if it's the one being edited
      if (get().currentProduct?.id === productId) {
        set({ currentProduct: result.data });
      }
      // Refresh product list
      await get().fetchProducts();
      return { success: true, message: result.message };
    } else {
      return { success: false, error: result.error };
    }
  },
  /**
   * Delete product
   */
  deleteProduct: async (productId) => {
    const result = await adminProductService.deleteProduct(productId);
    if (result.success) {
      // Refresh product list
      await get().fetchProducts();
      return { success: true, message: result.message };
    } else {
      return { success: false, error: result.error };
    }
  },
  /**
   * Fetch product statistics
   */
  fetchStats: async () => {
    set({ statsLoading: true });
    const result = await adminProductService.getStats();
    if (result.success) {
      set({
        stats: result.data,
        statsLoading: false,
      });
    } else {
      set({
        statsLoading: false,
      });
    }
  },
  // ========== FILTER SETTERS ==========
  setKeyword: (keyword) => {
    set({ keyword, page: 0 });
  },
  setCategoryId: (categoryId) => {
    set({ categoryId, page: 0 });
  },
  setBrand: (brand) => {
    set({ brand, page: 0 });
  },
  setPriceRange: (minPrice, maxPrice) => {
    set({ minPrice, maxPrice, page: 0 });
  },
  setStockRange: (minStock, maxStock) => {
    set({ minStock, maxStock, page: 0 });
  },
  setSorting: (sortField, sortDirection) => {
    set({ sortField, sortDirection, page: 0 });
  },
  setPage: (page) => {
    set({ page });
  },
  setSize: (size) => {
    set({ size, page: 0 });
  },
  /**
   * Reset all filters to default
   */
  resetFilters: () => {
    set({
      keyword: "",
      categoryId: "",
      brand: "",
      minPrice: null,
      maxPrice: null,
      minStock: null,
      maxStock: null,
      sortField: "",
      sortDirection: "",
      page: 0,
    });
  },
  /**
   * Clear current product
   */
  clearCurrentProduct: () => {
    set({ currentProduct: null });
  },
}));
export default useAdminProductStore;