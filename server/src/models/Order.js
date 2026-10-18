const mongoose = require('mongoose');

const orderItemSnapshotSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    SKU: {
      type: String,
      required: true
    },
    variant: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    purchasePrice: {
      type: Number,
      required: true,
      min: 0
    },
    originalPrice: {
      type: Number,
      min: 0
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    image: {
      type: String,
      default: ''
    }
  },
  { _id: false }
);

const shippingAddressSnapshotSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    street: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    pincode: {
      type: String,
      required: true
    }
  },
  { _id: false }
);

const trackingStepSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true
    },
    message: {
      type: String,
      default: ''
    },
    carrier: {
      type: String,
      default: 'Delhivery'
    },
    trackingNumber: {
      type: String,
      default: ''
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Customer reference is required'],
      index: true
    },
    items: {
      type: [orderItemSnapshotSchema],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'Order must contain at least one item snapshot'
      }
    },
    shippingAddress: {
      type: shippingAddressSnapshotSchema,
      required: true
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0
    },
    discount: {
      type: Number,
      default: 0,
      min: 0
    },
    shippingFee: {
      type: Number,
      default: 0,
      min: 0
    },
    total: {
      type: Number,
      required: true,
      min: 0
    },
    couponApplied: {
      code: {
        type: String,
        default: null
      },
      discountAmount: {
        type: Number,
        default: 0
      }
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
      default: 'Pending',
      index: true
    },
    paymentMethod: {
      type: String,
      required: true,
      default: 'Razorpay Online'
    },
    paymentProvider: {
      type: String,
      default: 'Razorpay'
    },
    paymentProviderReference: {
      razorpayOrderId: { type: String, default: '' },
      razorpayPaymentId: { type: String, default: '' },
      razorpaySignature: { type: String, default: '' }
    },
    orderStatus: {
      type: String,
      enum: ['Processing', 'Confirmed', 'Dispatched', 'Out for Delivery', 'Delivered', 'Cancelled'],
      default: 'Processing',
      index: true
    },
    tracking: [trackingStepSchema],
    estimatedDeliveryDate: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Indexes for high-frequency queries: customer order history & admin dashboard filters
orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1, createdAt: -1 });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
