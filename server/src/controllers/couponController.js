const { Coupon } = require('../models');
const { sendSuccess, sendError } = require('../utils/responseHandler');

const FALLBACK_COUPONS = {
  WELCOME100: { code: 'WELCOME100', discountType: 'flat', discountValue: 100, minOrderAmount: 499, description: 'Flat ₹100 off on first order' },
  FESTIVE15: { code: 'FESTIVE15', discountType: 'percentage', discountValue: 15, maxDiscount: 1500, minOrderAmount: 1999, description: '15% off up to ₹1,500' },
  NOVA500: { code: 'NOVA500', discountType: 'flat', discountValue: 500, minOrderAmount: 4999, description: 'Flat ₹500 off on orders over ₹4,999' }
};

/**
 * POST /api/v1/coupons/validate
 * Validates coupon code and returns discount amount for specified subtotal
 */
const validateCoupon = async (req, res, next) => {
  try {
    const { code, subtotal } = req.body;

    if (!code) {
      return sendError(res, 'Coupon code is required', null, 400);
    }

    const orderSubtotal = Number(subtotal) || 0;
    const cleanCode = code.trim().toUpperCase();

    if (Coupon.db.readyState === 1) {
      const coupon = await Coupon.findOne({ code: cleanCode, isActive: true });
      if (!coupon) {
        return sendError(res, `Coupon code '${cleanCode}' is invalid or has expired`, null, 404);
      }

      const result = coupon.validateForOrder(orderSubtotal);
      if (!result.isValid) {
        return sendError(res, result.message, null, 400);
      }

      return sendSuccess(res, 'Coupon applied successfully', result);
    }

    // Memory fallback
    const mock = FALLBACK_COUPONS[cleanCode];
    if (!mock) {
      return sendError(res, `Coupon code '${cleanCode}' is invalid`, null, 404);
    }

    if (orderSubtotal < mock.minOrderAmount) {
      return sendError(res, `Minimum order amount of ₹${mock.minOrderAmount} required for coupon ${cleanCode}`, null, 400);
    }

    let discountAmount = 0;
    if (mock.discountType === 'flat') {
      discountAmount = Math.min(mock.discountValue, orderSubtotal);
    } else {
      const raw = Math.round((orderSubtotal * mock.discountValue) / 100);
      discountAmount = mock.maxDiscount ? Math.min(raw, mock.maxDiscount) : raw;
    }

    return sendSuccess(res, 'Coupon applied successfully', {
      isValid: true,
      discountAmount,
      coupon: mock
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  validateCoupon
};
