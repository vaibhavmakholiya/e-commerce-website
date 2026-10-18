const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Coupon code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    discountType: {
      type: String,
      enum: {
        values: ['flat', 'percentage'],
        message: '{VALUE} is not a valid discount type'
      },
      required: [true, 'Discount type is required']
    },
    discountValue: {
      type: Number,
      required: [true, 'Discount value is required'],
      min: [0, 'Discount value cannot be negative']
    },
    maxDiscount: {
      type: Number,
      min: [0, 'Max discount cannot be negative'],
      default: null
    },
    minOrderAmount: {
      type: Number,
      default: 0,
      min: [0, 'Minimum order amount cannot be negative']
    },
    validFrom: {
      type: Date,
      default: Date.now
    },
    validUntil: {
      type: Date,
      required: [true, 'Validity expiration date is required']
    },
    usageLimit: {
      type: Number,
      default: 1000,
      min: 0
    },
    usageCount: {
      type: Number,
      default: 0,
      min: 0
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

/**
 * Validate coupon against order subtotal and active time window
 */
couponSchema.methods.validateForOrder = function (subtotal) {
  const now = new Date();

  if (!this.isActive) {
    return { isValid: false, message: 'This coupon is inactive.' };
  }

  if (now < this.validFrom) {
    return { isValid: false, message: 'This coupon promotion has not started yet.' };
  }

  if (now > this.validUntil) {
    return { isValid: false, message: 'This coupon has expired.' };
  }

  if (this.usageCount >= this.usageLimit) {
    return { isValid: false, message: 'This coupon has reached its maximum redemption limit.' };
  }

  if (subtotal < this.minOrderAmount) {
    return {
      isValid: false,
      message: `Minimum order subtotal of ₹${this.minOrderAmount.toLocaleString('en-IN')} required.`
    };
  }

  // Calculate discount
  let discountAmount = 0;
  if (this.discountType === 'flat') {
    discountAmount = Math.min(this.discountValue, subtotal);
  } else if (this.discountType === 'percentage') {
    const raw = Math.round((subtotal * this.discountValue) / 100);
    discountAmount = this.maxDiscount ? Math.min(raw, this.maxDiscount) : raw;
  }

  return {
    isValid: true,
    discountAmount,
    coupon: {
      code: this.code,
      description: this.description,
      discountType: this.discountType,
      discountValue: this.discountValue
    }
  };
};

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;
