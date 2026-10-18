const {
  createOrder,
  getMyOrders,
  getOrderById
} = require('../services/orderService');
const { sendSuccess, sendError } = require('../utils/responseHandler');

/**
 * POST /api/v1/orders
 * Create an order using trusted server calculations and item snapshots
 */
const placeOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress, paymentMethod, couponCode } = req.body;

    const order = await createOrder(req.user, {
      items,
      shippingAddress,
      paymentMethod,
      couponCode
    });

    return sendSuccess(res, 'Order placed successfully', order, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/orders/my
 * Retrieve all orders belonging to authenticated customer
 */
const listMyOrders = async (req, res, next) => {
  try {
    const customerId = req.user._id || req.user.id || req.user.providerUserId;
    const orders = await getMyOrders(customerId);
    return sendSuccess(res, 'Customer orders retrieved', orders);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/orders/:id
 * Retrieve specific order by ID or order number
 * Enforces strict customer ownership isolation
 */
const getOrder = async (req, res, next) => {
  try {
    const customerId = req.user._id || req.user.id || req.user.providerUserId;
    const order = await getOrderById(req.params.id, customerId, req.user.role);

    if (!order) {
      return sendError(res, `Order '${req.params.id}' not found`, null, 404);
    }

    return sendSuccess(res, 'Order details retrieved', order);
  } catch (error) {
    if (error.statusCode === 403) {
      return sendError(res, error.message, null, 403);
    }
    next(error);
  }
};

module.exports = {
  placeOrder,
  listMyOrders,
  getOrder
};
