const { Order, Product, Coupon, Cart } = require('../models');
const { getProductById } = require('./productService');

// Memory orders store for development backup
const memoryOrders = [];

const generateOrderNumber = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `NC-${dateStr}-${rand}`;
};

/**
 * Place a new order with trusted server calculations and item snapshots
 */
const createOrder = async (customer, { items, shippingAddress, paymentMethod, couponCode }) => {
  if (!items || items.length === 0) {
    throw new Error('Order must contain at least one item');
  }

  const verifiedSnapshots = [];
  let subtotal = 0;

  // 1. Recalculate trusted prices & take snapshots
  for (const item of items) {
    const product = await getProductById(item.id || item.productId);
    if (!product) {
      throw new Error(`Product ${item.id} is unavailable or inactive.`);
    }

    const price = product.compareAtPrice && product.compareAtPrice < product.price
      ? product.compareAtPrice
      : product.price;

    const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
    subtotal += price * qty;

    verifiedSnapshots.push({
      product: product._id || product.id,
      name: product.name,
      SKU: product.SKU || `SKU-${product.id}`,
      variant: item.variant || null,
      purchasePrice: price,
      originalPrice: product.price,
      quantity: qty,
      image: product.images?.[0] || ''
    });

    // Deduct stock if database is active
    if (Product.db.readyState === 1 && product._id) {
      await Product.findByIdAndUpdate(product._id, {
        $inc: { inventoryQuantity: -qty }
      });
    }
  }

  // 2. Validate coupon if provided
  let discount = 0;
  let appliedCouponData = null;

  if (couponCode) {
    if (Coupon.db.readyState === 1) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (coupon) {
        const valRes = coupon.validateForOrder(subtotal);
        if (valRes.isValid) {
          discount = valRes.discountAmount;
          appliedCouponData = { code: coupon.code, discountAmount: discount };
          await Coupon.findByIdAndUpdate(coupon._id, { $inc: { usageCount: 1 } });
        }
      }
    } else {
      // Mock coupon evaluation
      if (couponCode.toUpperCase() === 'WELCOME100' && subtotal >= 499) {
        discount = 100;
        appliedCouponData = { code: 'WELCOME100', discountAmount: 100 };
      } else if (couponCode.toUpperCase() === 'FESTIVE15' && subtotal >= 1999) {
        discount = Math.min(Math.round((subtotal * 15) / 100), 1500);
        appliedCouponData = { code: 'FESTIVE15', discountAmount: discount };
      }
    }
  }

  const shippingFee = subtotal >= 499 ? 0 : 70;
  const grandTotal = Math.max(0, subtotal - discount + shippingFee);

  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 4);

  // 3. Create persistent Order document
  const orderNumber = generateOrderNumber();
  const orderData = {
    orderNumber,
    customer: customer._id || customer.id || customer.providerUserId,
    items: verifiedSnapshots,
    shippingAddress,
    subtotal,
    discount,
    shippingFee,
    total: grandTotal,
    couponApplied: appliedCouponData || undefined,
    paymentMethod: paymentMethod || 'Razorpay Online',
    paymentStatus: paymentMethod === 'Cash on Delivery (COD)' ? 'Pending' : 'Paid',
    orderStatus: 'Processing',
    estimatedDeliveryDate: deliveryDate,
    tracking: [
      { status: 'Order Placed', message: 'Order submitted and verified', timestamp: new Date() },
      { status: 'Processing', message: 'Fulfillment center preparing dispatch', timestamp: new Date() }
    ]
  };

  if (Order.db.readyState === 1) {
    const orderDoc = await Order.create(orderData);
    // Clear user cart upon order placement
    if (customer._id) {
      await Cart.findOneAndUpdate({ user: customer._id }, { items: [] });
    }
    return orderDoc;
  }

  // Memory order fallback
  const memOrder = {
    _id: 'ord_' + Date.now(),
    id: 'ord_' + Date.now(),
    ...orderData,
    createdAt: new Date().toISOString()
  };
  memoryOrders.unshift(memOrder);
  return memOrder;
};

/**
 * Get all orders for authenticated customer
 */
const getMyOrders = async (customerId) => {
  if (Order.db.readyState === 1) {
    return await Order.find({ customer: customerId }).sort({ createdAt: -1 }).lean();
  }
  return memoryOrders.filter((o) => o.customer === customerId || o.customer === 'usr_demo_8821');
};

/**
 * Get order by ID with strict ownership validation
 * Customer can NEVER view another customer's order by guessing the ID.
 */
const getOrderById = async (orderId, customerId, userRole) => {
  let order = null;

  if (Order.db.readyState === 1 && (orderId.match(/^[0-9a-fA-F]{24}$/) || orderId.startsWith('NC-'))) {
    order = await Order.findOne({
      $or: [
        ...(orderId.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: orderId }] : []),
        { orderNumber: orderId }
      ]
    }).lean();
  } else {
    order = memoryOrders.find((o) => o._id === orderId || o.id === orderId || o.orderNumber === orderId) || null;
  }

  if (!order) return null;

  // Strict ownership check: customer can only view their own order
  const ownerId = order.customer?.toString() || order.customer;
  const requesterId = customerId?.toString() || customerId;

  if (userRole !== 'admin' && ownerId !== requesterId) {
    const error = new Error('Access denied: You do not have permission to view this order.');
    error.statusCode = 403;
    throw error;
  }

  return order;
};

/**
 * Admin: Get all orders across the system
 */
const getAllOrdersAdmin = async ({ page = 1, limit = 20, status }) => {
  const p = Math.max(1, parseInt(page, 10) || 1);
  const l = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (p - 1) * l;

  if (Order.db.readyState === 1) {
    const filter = status ? { orderStatus: status } : {};
    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('customer', 'name email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(l)
        .lean(),
      Order.countDocuments(filter)
    ]);

    return {
      orders,
      pagination: {
        total,
        page: p,
        limit: l,
        totalPages: Math.ceil(total / l)
      }
    };
  }

  return {
    orders: memoryOrders.slice(skip, skip + l),
    pagination: {
      total: memoryOrders.length,
      page: p,
      limit: l,
      totalPages: Math.ceil(memoryOrders.length / l) || 1
    }
  };
};

/**
 * Admin: Update order status & add tracking checkpoint
 */
const updateOrderStatusAdmin = async (orderId, status, message = '') => {
  if (Order.db.readyState === 1 && orderId.match(/^[0-9a-fA-F]{24}$/)) {
    const updated = await Order.findByIdAndUpdate(
      orderId,
      {
        orderStatus: status,
        $push: {
          tracking: {
            status,
            message: message || `Status updated to ${status}`,
            timestamp: new Date()
          }
        }
      },
      { new: true, runValidators: true }
    );
    return updated;
  }

  const ord = memoryOrders.find((o) => o._id === orderId || o.id === orderId || o.orderNumber === orderId);
  if (ord) {
    ord.orderStatus = status;
    ord.tracking.push({
      status,
      message: message || `Status updated to ${status}`,
      timestamp: new Date().toISOString()
    });
    return ord;
  }

  return null;
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrdersAdmin,
  updateOrderStatusAdmin
};
