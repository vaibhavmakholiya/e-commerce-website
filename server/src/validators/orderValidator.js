/**
 * Order Request Validators
 */

const validateOrderBody = (req, res, next) => {
  const { shippingAddress, paymentMethod } = req.body;
  const errors = [];

  if (!shippingAddress || typeof shippingAddress !== 'object') {
    errors.push({ field: 'shippingAddress', message: 'Shipping address object is required' });
  } else {
    const { fullName, phone, street, city, state, pincode } = shippingAddress;
    if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
      errors.push({ field: 'shippingAddress.fullName', message: 'Full name must be at least 2 characters' });
    }
    if (!phone || typeof phone !== 'string' || !/^[6-9]\d{9}$/.test(phone.replace(/\D/g, ''))) {
      errors.push({ field: 'shippingAddress.phone', message: 'Valid 10-digit Indian phone number is required' });
    }
    if (!street || typeof street !== 'string' || street.trim().length < 5) {
      errors.push({ field: 'shippingAddress.street', message: 'Street address is required' });
    }
    if (!city || typeof city !== 'string' || city.trim().length < 2) {
      errors.push({ field: 'shippingAddress.city', message: 'City is required' });
    }
    if (!state || typeof state !== 'string' || state.trim().length < 2) {
      errors.push({ field: 'shippingAddress.state', message: 'State is required' });
    }
    if (!pincode || typeof pincode !== 'string' || !/^[1-9]\d{5}$/.test(pincode.replace(/\D/g, ''))) {
      errors.push({ field: 'shippingAddress.pincode', message: 'Valid 6-digit Indian PIN code is required' });
    }
  }

  if (paymentMethod && typeof paymentMethod !== 'string') {
    errors.push({ field: 'paymentMethod', message: 'Payment method must be a string' });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed for order submission payload',
      errors: { details: errors }
    });
  }

  next();
};

const validateOrderStatusUpdate = (req, res, next) => {
  const { status } = req.body;
  const allowed = ['Processing', 'Confirmed', 'Dispatched', 'Out for Delivery', 'Delivered', 'Cancelled'];

  if (!status || !allowed.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Invalid order status. Allowed values: [${allowed.join(', ')}]`,
      errors: { details: [{ field: 'status', message: 'Unrecognized order status value' }] }
    });
  }

  next();
};

module.exports = {
  validateOrderBody,
  validateOrderStatusUpdate
};
