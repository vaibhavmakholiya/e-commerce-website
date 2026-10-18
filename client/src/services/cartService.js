import apiClient from './api';

export const cartService = {
  /**
   * Retrieve active cart for current authenticated customer or guest session
   */
  async getCart() {
    const response = await apiClient.get('/cart');
    return response;
  },

  /**
   * Add an item to the server-side cart
   * @param {string} productId
   * @param {number} quantity
   * @param {Object} variant
   */
  async addItem(productId, quantity = 1, variant = null) {
    const response = await apiClient.post('/cart/items', {
      productId,
      quantity,
      variant
    });
    return response;
  },

  /**
   * Update quantity of an item in the cart
   * @param {string} itemId
   * @param {number} quantity
   */
  async updateItem(itemId, quantity) {
    const response = await apiClient.patch(`/cart/items/${itemId}`, { quantity });
    return response;
  },

  /**
   * Remove a single item from the cart
   * @param {string} itemId
   */
  async removeItem(itemId) {
    const response = await apiClient.delete(`/cart/items/${itemId}`);
    return response;
  },

  /**
   * Clear all items in current cart
   */
  async clearCart() {
    const response = await apiClient.delete('/cart');
    return response;
  }
};

export default cartService;
