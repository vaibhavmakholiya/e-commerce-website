/**
 * Cart Request Validators
 */

const validateCartItemBody = (req, res, next) => {
  const { productId, quantity } = req.body;
  const errors = [];

  if (!productId || typeof productId !== 'string') {
    errors.push({ field: 'productId', message: 'Valid productId is required' });
  }

  if (quantity !== undefined && (typeof quantity !== 'number' || quantity < 1 || !Number.isInteger(quantity))) {
    errors.push({ field: 'quantity', message: 'Quantity must be a positive integer greater than or equal to 1' });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed for cart item payload',
      errors: { details: errors }
    });
  }

  next();
};

const validateCartQuantityPatch = (req, res, next) => {
  const { quantity } = req.body;

  if (quantity === undefined || typeof quantity !== 'number' || quantity < 0 || !Number.isInteger(quantity)) {
    return res.status(400).json({
      success: false,
      message: 'Quantity must be an integer (0 or greater). Quantity of 0 removes the item.',
      errors: { details: [{ field: 'quantity', message: 'Invalid quantity' }] }
    });
  }

  next();
};

module.exports = {
  validateCartItemBody,
  validateCartQuantityPatch
};
