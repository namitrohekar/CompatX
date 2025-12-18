import axiosClient from "../lib/axiosClient";
/**
 * Admin Product Service
 * Handles all admin product CRUD operations
 * JWT authentication handled automatically by axiosClient
 */
const adminProductService = {
  /**
   * Get paginated list of admin's own products
   * @param {number} page - Page number (0-indexed)
   * @param {number} size - Page size
   * @returns {Promise<{success: boolean, data?: object, error?: string}>}
   */
  getProducts: async (page = 0, size = 10) => {
    try {
      const response = await axiosClient.get("/admin/products", {
        params: { page, size },
      });
      return {
        success: true,
        data: response.data.data, // { items, page, size, totalElements, totalPages }
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to fetch products",
      };
    }
  },
  /**
   * Get single product by ID (ownership validated by backend)
   * @param {number} productId - Product ID
   * @returns {Promise<{success: boolean, data?: object, error?: string}>}
   */
  getProduct: async (productId) => {
    try {
      const response = await axiosClient.get(`/admin/products/${productId}`);
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to fetch product",
      };
    }
  },
  /**
   * Create new product
   * @param {object} productData - Product data
   * @param {number} categoryId - Category ID
   * @returns {Promise<{success: boolean, data?: object, error?: string, message?: string}>}
   */
  createProduct: async (productData, categoryId) => {
    try {
      const response = await axiosClient.post("/admin/products", productData, {
        params: { categoryId },
      });
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to create product",
      };
    }
  },
  /**
   * Update existing product (ownership validated by backend)
   * @param {number} productId - Product ID
   * @param {object} productData - Updated product data
   * @param {number} categoryId - Category ID (optional)
   * @returns {Promise<{success: boolean, data?: object, error?: string, message?: string}>}
   */
  updateProduct: async (productId, productData, categoryId) => {
    try {
      const response = await axiosClient.put(
        `/admin/products/${productId}`,
        productData,
        {
          params: categoryId ? { categoryId } : {},
        }
      );
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to update product",
      };
    }
  },
  /**
   * Delete product (ownership validated by backend)
   * @param {number} productId - Product ID
   * @returns {Promise<{success: boolean, error?: string, message?: string}>}
   */
  deleteProduct: async (productId) => {
    try {
      const response = await axiosClient.delete(`/admin/products/${productId}`);
      return {
        success: true,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to delete product",
      };
    }
  },
  /**
   * Filter admin's own products with pagination and sorting
   * @param {object} filters - Filter parameters
   * @returns {Promise<{success: boolean, data?: object, error?: string}>}
   */
  filterProducts: async (filters = {}) => {
    try {
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
        page = 0,
        size = 10,
      } = filters;
      const response = await axiosClient.get("/admin/products/filter", {
        params: {
          keyword: keyword || null,
          categoryId: categoryId || null,
          brand: brand || null,
          minPrice: minPrice || null,
          maxPrice: maxPrice || null,
          minStock: minStock || null,
          maxStock: maxStock || null,
          sortField: sortField || null,
          sortDirection: sortDirection || null,
          page,
          size,
        },
      });
      return {
        success: true,
        data: response.data.data, // { items, page, size, totalElements, totalPages }
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to filter products",
      };
    }
  },
  /**
   * Get product statistics (global stats, not ownership-filtered)
   * @returns {Promise<{success: boolean, data?: object, error?: string}>}
   */
  getStats: async () => {
    try {
      const response = await axiosClient.get("/admin/products/stats");
      return {
        success: true,
        data: response.data.data, // { totalProducts, totalCategories, totalBrands }
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to fetch stats",
      };
    }
  },
};
export default adminProductService;
