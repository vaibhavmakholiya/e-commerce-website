import apiClient from './api';

export const productService = {
  /**
   * Fetch paginated list of products with filters, sorting, and search
   * @param {Object} params { page, limit, category, search, sort, minPrice, maxPrice, inStock, featured }
   */
  async getProducts(params = {}) {
    const response = await apiClient.get('/products', { params });
    return response;
  },

  /**
   * Fetch single product by its MongoDB ObjectID or SKU
   * @param {string} id
   */
  async getProductById(id) {
    const response = await apiClient.get(`/products/${id}`);
    return response;
  },

  /**
   * Fetch single product by its URL-friendly slug
   * @param {string} slug
   */
  async getProductBySlug(slug) {
    const response = await apiClient.get(`/products/slug/${slug}`);
    return response;
  },

  /**
   * Fetch all active product categories
   */
  async getCategories() {
    const response = await apiClient.get('/categories');
    return response;
  },

  /**
   * Fetch products in a specific category slug
   * @param {string} slug
   * @param {Object} params
   */
  async getCategoryProducts(slug, params = {}) {
    const response = await apiClient.get(`/categories/${slug}/products`, { params });
    return response;
  },

  /**
   * Validate a promotional coupon code server-side
   * @param {string} code
   * @param {number} subtotal
   */
  async validateCoupon(code, subtotal) {
    const response = await apiClient.post('/coupons/validate', { code, subtotal });
    return response;
  }
};

export default productService;
