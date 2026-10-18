import apiClient from './api';

export const orderService = {
  /**
   * Submit and finalize a new order with validated pricing snapshots
   * @param {Object} orderData
   */
  async createOrder(orderData) {
    const response = await apiClient.post('/orders', orderData);
    return response;
  },

  /**
   * Retrieve all orders belonging to the logged-in user
   */
  async getMyOrders() {
    const response = await apiClient.get('/orders/my');
    return response;
  },

  /**
   * Retrieve specific order details by ID (enforces customer isolation)
   * @param {string} orderId
   */
  async getOrderById(orderId) {
    const response = await apiClient.get(`/orders/${orderId}`);
    return response;
  }
};

export default orderService;
