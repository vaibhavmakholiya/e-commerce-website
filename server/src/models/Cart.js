const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product reference is required']
    },
    variant: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
      default: 1
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: true }
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
      sparse: true
    },
    guestCartId: {
      type: String,
      index: true,
      sparse: true
    },
    items: [cartItemSchema]
  },
  {
    timestamps: true
  }
);

// Method to verify stock and compute trusted server-side totals
cartSchema.methods.calculateTotals = async function () {
  await this.populate('items.product');

  let subtotal = 0;
  let itemsCount = 0;
  const verifiedItems = [];

  for (const item of this.items) {
    if (!item.product || !item.product.isActive) {
      continue; // Skip deactivated or deleted products
    }

    const price = item.product.compareAtPrice && item.product.compareAtPrice < item.product.price
      ? item.product.compareAtPrice
      : item.product.price;

    const quantity = Math.min(item.quantity, item.product.inventoryQuantity);
    if (quantity <= 0) continue;

    subtotal += price * quantity;
    itemsCount += quantity;

    verifiedItems.push({
      cartItemId: item._id,
      product: {
        id: item.product._id,
        name: item.product.name,
        slug: item.product.slug,
        image: item.product.images?.[0] || '',
        price,
        originalPrice: item.product.price,
        stock: item.product.inventoryQuantity
      },
      variant: item.variant,
      quantity,
      itemTotal: price * quantity
    });
  }

  // Free shipping threshold: ₹499
  const shippingFee = subtotal === 0 || subtotal >= 499 ? 0 : 70;
  const grandTotal = subtotal + shippingFee;

  return {
    itemsCount,
    subtotal,
    shippingFee,
    grandTotal,
    items: verifiedItems
  };
};

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
