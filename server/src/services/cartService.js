const { Cart, Product } = require('../models');
const { getProductById } = require('./productService');

// In-memory guest carts store for fast local interactions
const memoryCarts = new Map();

/**
 * Resolve cart by user identity or guest cart token
 */
const getCart = async (userId, guestCartId) => {
  if (Cart.db.readyState === 1) {
    let query = {};
    if (userId) query.user = userId;
    else if (guestCartId) query.guestCartId = guestCartId;
    else return null;

    let cart = await Cart.findOne(query);
    if (!cart) {
      cart = await Cart.create({
        user: userId || undefined,
        guestCartId: !userId ? guestCartId : undefined,
        items: []
      });
    }

    return await cart.calculateTotals();
  }

  // Memory cart handling
  const key = userId ? `user_${userId}` : `guest_${guestCartId}`;
  if (!memoryCarts.has(key)) {
    memoryCarts.set(key, { items: [] });
  }

  const rawCart = memoryCarts.get(key);
  let subtotal = 0;
  let itemsCount = 0;
  const verifiedItems = [];

  for (const item of rawCart.items) {
    const product = await getProductById(item.productId);
    if (!product) continue;

    const price = product.compareAtPrice && product.compareAtPrice < product.price
      ? product.compareAtPrice
      : product.price;

    const quantity = Math.min(item.quantity, product.inventoryQuantity || 99);
    subtotal += price * quantity;
    itemsCount += quantity;

    verifiedItems.push({
      cartItemId: item.id,
      product: {
        id: product.id || product._id,
        name: product.name,
        slug: product.slug,
        image: product.images?.[0] || '',
        price,
        originalPrice: product.price,
        stock: product.inventoryQuantity || 99
      },
      variant: item.variant,
      quantity,
      itemTotal: price * quantity
    });
  }

  const shippingFee = subtotal === 0 || subtotal >= 499 ? 0 : 70;
  return {
    itemsCount,
    subtotal,
    shippingFee,
    grandTotal: subtotal + shippingFee,
    items: verifiedItems
  };
};

/**
 * Add or increment item in cart
 */
const addItem = async (userId, guestCartId, { productId, quantity = 1, variant = null }) => {
  const product = await getProductById(productId);
  if (!product) {
    throw new Error('Product not found or inactive');
  }

  if (Cart.db.readyState === 1) {
    let query = userId ? { user: userId } : { guestCartId };
    let cart = await Cart.findOne(query);

    if (!cart) {
      cart = new Cart({
        user: userId || undefined,
        guestCartId: !userId ? guestCartId : undefined,
        items: []
      });
    }

    const existingIndex = cart.items.findIndex(
      (it) => it.product.toString() === productId && JSON.stringify(it.variant) === JSON.stringify(variant)
    );

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += quantity;
    } else {
      cart.items.push({
        product: productId,
        variant,
        quantity
      });
    }

    await cart.save();
    return await cart.calculateTotals();
  }

  // Memory cart update
  const key = userId ? `user_${userId}` : `guest_${guestCartId}`;
  if (!memoryCarts.has(key)) {
    memoryCarts.set(key, { items: [] });
  }

  const cart = memoryCarts.get(key);
  const existing = cart.items.find(
    (it) => it.productId === productId && JSON.stringify(it.variant) === JSON.stringify(variant)
  );

  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.items.push({
      id: 'item_' + Date.now() + Math.random().toString(36).substr(2, 4),
      productId,
      variant,
      quantity
    });
  }

  return await getCart(userId, guestCartId);
};

/**
 * Update quantity of an item
 */
const updateItemQuantity = async (userId, guestCartId, itemId, quantity) => {
  if (Cart.db.readyState === 1) {
    let query = userId ? { user: userId } : { guestCartId };
    let cart = await Cart.findOne(query);
    if (!cart) throw new Error('Cart not found');

    if (quantity <= 0) {
      cart.items = cart.items.filter((it) => it._id.toString() !== itemId);
    } else {
      const item = cart.items.find((it) => it._id.toString() === itemId);
      if (item) item.quantity = quantity;
    }

    await cart.save();
    return await cart.calculateTotals();
  }

  // Memory cart update
  const key = userId ? `user_${userId}` : `guest_${guestCartId}`;
  const cart = memoryCarts.get(key);
  if (!cart) throw new Error('Cart not found');

  if (quantity <= 0) {
    cart.items = cart.items.filter((it) => it.id !== itemId);
  } else {
    const it = cart.items.find((i) => i.id === itemId);
    if (it) it.quantity = quantity;
  }

  return await getCart(userId, guestCartId);
};

/**
 * Remove an item from cart
 */
const removeItem = async (userId, guestCartId, itemId) => {
  return await updateItemQuantity(userId, guestCartId, itemId, 0);
};

/**
 * Clear the entire cart
 */
const clearCart = async (userId, guestCartId) => {
  if (Cart.db.readyState === 1) {
    let query = userId ? { user: userId } : { guestCartId };
    await Cart.findOneAndUpdate(query, { items: [] });
  } else {
    const key = userId ? `user_${userId}` : `guest_${guestCartId}`;
    memoryCarts.set(key, { items: [] });
  }
  return { itemsCount: 0, subtotal: 0, shippingFee: 0, grandTotal: 0, items: [] };
};

module.exports = {
  getCart,
  addItem,
  updateItemQuantity,
  removeItem,
  clearCart
};
