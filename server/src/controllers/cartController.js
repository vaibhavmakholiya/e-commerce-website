const {
  getCart,
  addItem,
  updateItemQuantity,
  removeItem,
  clearCart
} = require('../services/cartService');
const { sendSuccess, sendError } = require('../utils/responseHandler');

const resolveCartIdentity = (req) => {
  const userId = req.user ? req.user._id || req.user.id || req.user.providerUserId : null;
  const guestCartId = req.headers['x-guest-cart-id'] || req.query.guestCartId || null;
  return { userId, guestCartId };
};

/**
 * GET /api/v1/cart
 */
const fetchCart = async (req, res, next) => {
  try {
    const { userId, guestCartId } = resolveCartIdentity(req);
    const cart = await getCart(userId, guestCartId);
    return sendSuccess(res, 'Cart retrieved successfully', cart || { items: [], subtotal: 0, grandTotal: 0 });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/cart/items
 */
const addCartItem = async (req, res, next) => {
  try {
    const { userId, guestCartId } = resolveCartIdentity(req);
    const { productId, quantity, variant } = req.body;

    const updated = await addItem(userId, guestCartId, {
      productId,
      quantity: quantity || 1,
      variant: variant || null
    });

    return sendSuccess(res, 'Item added to cart', updated, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/cart/items/:itemId
 */
const updateCartItem = async (req, res, next) => {
  try {
    const { userId, guestCartId } = resolveCartIdentity(req);
    const { itemId } = req.params;
    const { quantity } = req.body;

    const updated = await updateItemQuantity(userId, guestCartId, itemId, quantity);
    return sendSuccess(res, 'Cart item updated', updated);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/cart/items/:itemId
 */
const removeCartItem = async (req, res, next) => {
  try {
    const { userId, guestCartId } = resolveCartIdentity(req);
    const { itemId } = req.params;

    const updated = await removeItem(userId, guestCartId, itemId);
    return sendSuccess(res, 'Item removed from cart', updated);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/cart
 */
const emptyCart = async (req, res, next) => {
  try {
    const { userId, guestCartId } = resolveCartIdentity(req);
    const cleared = await clearCart(userId, guestCartId);
    return sendSuccess(res, 'Cart emptied successfully', cleared);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  fetchCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  emptyCart
};
