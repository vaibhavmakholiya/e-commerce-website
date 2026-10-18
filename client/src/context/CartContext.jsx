import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { VALID_COUPONS } from '../data/products';
import apiClient from '../services/api';

const CartContext = createContext(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  // Load saved cart from localStorage
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('novacart_cart_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Load saved coupon from localStorage
  const [appliedCoupon, setAppliedCoupon] = useState(() => {
    try {
      const saved = localStorage.getItem('novacart_coupon_v1');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Sync cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('novacart_cart_v1', JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [items]);

  // Sync coupon to localStorage
  useEffect(() => {
    try {
      if (appliedCoupon) {
        localStorage.setItem('novacart_coupon_v1', JSON.stringify(appliedCoupon));
      } else {
        localStorage.removeItem('novacart_coupon_v1');
      }
    } catch (e) {
      console.error('Failed to save coupon to localStorage', e);
    }
  }, [appliedCoupon]);

  /**
   * Add item to cart with variant & quantity
   */
  const addToCart = (product, quantity = 1, selectedVariant = null) => {
    setItems((prevItems) => {
      // Create a unique key per product + selected variants
      const variantKey = selectedVariant ? JSON.stringify(selectedVariant) : 'default';
      const pid = product._id || product.id;
      const existingIndex = prevItems.findIndex(
        (item) => (item.product._id || item.product.id) === pid && item.variantKey === variantKey
      );

      const effectivePrice = product.salePrice || product.price;
      const stock = product.stock ?? product.inventory ?? 99;

      if (existingIndex > -1) {
        // Update quantity
        const updated = [...prevItems];
        const newQty = Math.min(
          updated[existingIndex].quantity + quantity,
          stock
        );
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
        };
        return updated;
      } else {
        // Add new item
        return [
          ...prevItems,
          {
            cartItemId: `${pid}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            product,
            variantKey,
            selectedVariant,
            price: effectivePrice,
            originalPrice: product.price,
            quantity: Math.min(quantity, stock),
          },
        ];
      }
    });
  };

  /**
   * Remove item from cart
   */
  const removeFromCart = (cartItemId) => {
    setItems((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  /**
   * Update quantity
   */
  const updateQuantity = (cartItemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => {
        if (item.cartItemId === cartItemId) {
          const maxStock = item.product.stock ?? item.product.inventory ?? 99;
          return {
            ...item,
            quantity: Math.min(newQuantity, maxStock),
          };
        }
        return item;
      })
    );
  };

  /**
   * Clear cart
   */
  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
  };

  /**
   * Financial calculations
   */
  const calculations = useMemo(() => {
    const totalItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

    const originalSubtotal = items.reduce(
      (sum, item) => sum + (item.originalPrice || item.price) * item.quantity,
      0
    );

    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const catalogSavings = Math.max(0, originalSubtotal - subtotal);

    // Free shipping threshold: ₹499
    const shippingFee = subtotal === 0 || subtotal >= 499 ? 0 : 70;

    // Coupon discount calculation
    let couponDiscount = 0;
    if (appliedCoupon && subtotal >= (appliedCoupon.minOrder || 0)) {
      if (appliedCoupon.type === 'flat') {
        couponDiscount = appliedCoupon.amount;
      } else if (appliedCoupon.type === 'percentage') {
        const raw = Math.round((subtotal * appliedCoupon.percentage) / 100);
        couponDiscount = appliedCoupon.maxDiscount
          ? Math.min(raw, appliedCoupon.maxDiscount)
          : raw;
      }
    }

    const totalDiscount = catalogSavings + couponDiscount;
    const grandTotal = Math.max(0, subtotal - couponDiscount + shippingFee);

    return {
      totalItemsCount,
      originalSubtotal,
      subtotal,
      catalogSavings,
      shippingFee,
      couponDiscount,
      totalDiscount,
      grandTotal,
    };
  }, [items, appliedCoupon]);

  /**
   * Apply coupon code — tries backend validation first, falls back to VALID_COUPONS static map
   */
  const applyCoupon = async (code) => {
    const cleanCode = (code || '').trim().toUpperCase();
    if (!cleanCode) {
      return { success: false, message: 'Please enter a coupon code.' };
    }

    try {
      // Try server-side validation first (authoritative)
      const res = await apiClient.post('/coupons/validate', {
        code: cleanCode,
        subtotal: calculations.subtotal
      });
      const coupon = res?.data || res;
      if (coupon?.code) {
        setAppliedCoupon(coupon);
        return {
          success: true,
          message: `Coupon "${coupon.code}" applied! ${coupon.description || ''}`,
        };
      }
    } catch (serverErr) {
      // Server rejected it — check static map as fallback (dev/offline mode)
      const staticCoupon = VALID_COUPONS[cleanCode];
      if (staticCoupon) {
        if (calculations.subtotal < staticCoupon.minOrder) {
          return {
            success: false,
            message: `Coupon requires a minimum cart subtotal of ₹${staticCoupon.minOrder.toLocaleString('en-IN')}.`,
          };
        }
        setAppliedCoupon(staticCoupon);
        return {
          success: true,
          message: `Coupon "${staticCoupon.code}" applied! ${staticCoupon.description}`,
        };
      }
      return {
        success: false,
        message: serverErr?.message?.includes('Invalid') || serverErr?.message?.includes('expired')
          ? serverErr.message
          : 'Invalid or expired coupon code.',
      };
    }

    return { success: false, message: 'Invalid or expired coupon code.' };
  };

  /**
   * Remove applied coupon
   */
  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const value = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartCount: calculations.totalItemsCount,
    subtotal: calculations.subtotal,
    originalSubtotal: calculations.originalSubtotal,
    shippingFee: calculations.shippingFee,
    appliedCoupon,
    couponDiscount: calculations.couponDiscount,
    grandTotal: calculations.grandTotal,
    totalDiscount: calculations.totalDiscount,
    applyCoupon,
    removeCoupon,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartContext;
