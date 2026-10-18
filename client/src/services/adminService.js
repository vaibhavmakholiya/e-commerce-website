import apiClient from './api';

export const adminService = {
  /**
   * Create a new product in the catalog
   * @param {Object} productData
   */
  async createProduct(productData) {
    const response = await apiClient.post('/admin/products', productData);
    return response;
  },

  /**
   * Update an existing product
   * @param {string} id
   * @param {Object} productData
   */
  async updateProduct(id, productData) {
    const response = await apiClient.patch(`/admin/products/${id}`, productData);
    return response;
  },

  /**
   * Delete or deactivate a product
   * @param {string} id
   */
  async deleteProduct(id) {
    const response = await apiClient.delete(`/admin/products/${id}`);
    return response;
  },

  /**
   * Fetch all orders across the platform with filtering
   * @param {Object} params
   */
  async getOrders(params = {}) {
    const response = await apiClient.get('/admin/orders', { params });
    return response;
  },

  /**
   * Update order status (pending, processing, shipped, delivered, cancelled)
   * @param {string} orderId
   * @param {string} status
   */
  async updateOrderStatus(orderId, status) {
    const response = await apiClient.patch(`/admin/orders/${orderId}/status`, { status });
    return response;
  },

  /**
   * Fetch all registered users
   */
  async getUsers() {
    const response = await apiClient.get('/admin/users');
    return response;
  },

  /**
   * Create a new product category
   * @param {Object} categoryData
   */
  async createCategory(categoryData) {
    const response = await apiClient.post('/admin/categories', categoryData);
    return response;
  },

  /**
   * Update category details
   * @param {string} id
   * @param {Object} categoryData
   */
  async updateCategory(id, categoryData) {
    const response = await apiClient.patch(`/admin/categories/${id}`, categoryData);
    return response;
  }
};

export default adminService;
