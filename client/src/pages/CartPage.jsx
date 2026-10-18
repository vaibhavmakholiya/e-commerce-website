import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import Badge from '../components/ui/Badge';
import { useCart } from '../context/CartContext';
import { useToast } from '../components/ui/Toast';
import { formatPrice } from '../utils/formatters';

const CartPage = () => {
  const {
    items,
    removeFromCart,
    updateQuantity,
    subtotal,
    originalSubtotal,
    shippingFee,
    appliedCoupon,
    couponDiscount,
    grandTotal,
    totalDiscount,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const { toast } = useToast();
  const navigate = useNavigate();
  const [couponInput, setCouponInput] = useState('');

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput);
    if (res.success) {
      toast.success(res.message);
      setCouponInput('');
    } else {
      toast.error(res.message);
    }
  };

  const handleQuickCoupon = (code) => {
    const res = applyCoupon(code);
    if (res.success) {
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  };

  if (items.length === 0) {
    return (
      <MainLayout>
        <div className="container" style={{ padding: 'var(--space-12) var(--space-4)' }}>
          <EmptyState
            icon="🛒"
            title="Your Shopping Cart is Empty"
            description="Looks like you haven't added anything to your cart yet. Explore our curated collections across electronics, apparel, and lifestyle."
            action={{
              label: 'Explore Catalog Now →',
              onClick: () => navigate('/shop'),
            }}
          />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container" style={{ padding: 'var(--space-8) var(--space-4) var(--space-16)' }}>
        {/* Breadcrumb */}
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span aria-hidden="true">/</span>
          <Link to="/shop">Shop</Link>
          <span aria-hidden="true">/</span>
          <span className="current">Shopping Cart</span>
        </nav>

        <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, marginBottom: 'var(--space-8)' }}>
          Shopping Cart ({items.reduce((acc, i) => acc + i.quantity, 0)} items)
        </h1>

        <div className="cart-layout">
          {/* ── LEFT: CART ITEMS LIST ─────────────────────────── */}
          <div>
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)' }}>
              {items.map((item) => {
                const maxStock = item.product.stock || 99;

                return (
                  <div key={item.cartItemId} className="cart-item-row">
                    {/* Item Image */}
                    <div className="cart-item-image">
                      <img src={item.product.images[0]} alt={item.product.name} />
                    </div>

                    {/* Item Details */}
                    <div>
                      <Link
                        to={`/product/${item.product.id}`}
                        style={{
                          fontSize: 'var(--text-base)',
                          fontWeight: 600,
                          color: 'var(--text-main)',
                          textDecoration: 'none',
                          display: 'block',
                          marginBottom: '0.25rem',
                        }}
                      >
                        {item.product.name}
                      </Link>

                      {/* Selected Variants */}
                      {item.selectedVariant && (
                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
                          {Object.entries(item.selectedVariant).map(([k, v]) => (
                            <span
                              key={k}
                              style={{
                                fontSize: 'var(--text-xs)',
                                background: 'var(--bg-surface-elevated)',
                                border: '1px solid var(--border-subtle)',
                                padding: '2px 8px',
                                borderRadius: 'var(--radius-sm)',
                                color: 'var(--text-muted)',
                              }}
                            >
                              {k}: <strong>{v}</strong>
                            </span>
                          ))}
                        </div>
                      )}

                      <span style={{ fontSize: 'var(--text-xs)', color: item.product.stock > 0 ? 'var(--color-emerald-400)' : 'var(--color-rose-400)' }}>
                        {item.product.stock > 0 ? '✓ In Stock' : '✕ Out of Stock'}
                      </span>
                    </div>

                    {/* Quantity Stepper */}
                    <div className="cart-item-actions">
                      <div className="quantity-stepper">
                        <button
                          type="button"
                          className="stepper-btn"
                          onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="stepper-value" aria-live="polite">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          className="stepper-btn"
                          onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                          disabled={item.quantity >= maxStock}
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      {/* Item Total Price */}
                      <div style={{ textAlign: 'right', minWidth: '100px' }}>
                        <div style={{ fontSize: 'var(--text-base)', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
                          {formatPrice(item.price * item.quantity)}
                        </div>
                        {item.originalPrice > item.price && (
                          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-dim)', textDecoration: 'line-through' }}>
                            {formatPrice(item.originalPrice * item.quantity)}
                          </div>
                        )}
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => {
                          removeFromCart(item.cartItemId);
                          toast.info(`Removed "${item.product.name}" from cart.`);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          padding: '0.4rem',
                          fontSize: '1rem',
                          marginLeft: '0.5rem',
                        }}
                        aria-label="Remove item"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Coupons Suggester */}
            <div style={{ marginTop: 'var(--space-6)', padding: 'var(--space-4)', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <p style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                Available Coupons for Your Cart
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {[
                  { code: 'WELCOME100', text: '₹100 OFF (min ₹499)' },
                  { code: 'FESTIVE15', text: '15% OFF (min ₹1,999)' },
                  { code: 'NOVA500', text: '₹500 OFF (min ₹4,999)' },
                ].map((c) => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => handleQuickCoupon(c.code)}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: 'var(--text-xs)' }}
                  >
                    🏷️ <strong>{c.code}</strong> — {c.text}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT: ORDER SUMMARY CARD ─────────────────────── */}
          <aside className="summary-card" aria-label="Order summary">
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 800, marginBottom: 'var(--space-4)' }}>
              Order Summary
            </h2>

            <div className="summary-line">
              <span>Original Items Total</span>
              <span>{formatPrice(originalSubtotal)}</span>
            </div>

            {totalDiscount > 0 && (
              <div className="summary-line" style={{ color: 'var(--color-emerald-400)' }}>
                <span>Total Savings</span>
                <span>− {formatPrice(totalDiscount)}</span>
              </div>
            )}

            <div className="summary-line">
              <span>Cart Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>

            {appliedCoupon && (
              <div className="summary-line" style={{ color: 'var(--color-amber-400)' }}>
                <span>
                  Coupon ({appliedCoupon.code})
                  <button
                    onClick={removeCoupon}
                    style={{ background: 'none', border: 'none', color: 'var(--color-rose-400)', cursor: 'pointer', marginLeft: '0.4rem', fontSize: '0.8rem' }}
                  >
                    [Remove]
                  </button>
                </span>
                <span>− {formatPrice(couponDiscount)}</span>
              </div>
            )}

            <div className="summary-line">
              <span>Shipping & Handling</span>
              <span>{shippingFee === 0 ? <strong style={{ color: 'var(--color-emerald-400)' }}>FREE</strong> : formatPrice(shippingFee)}</span>
            </div>

            {subtotal < 499 && (
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-amber-400)', marginBottom: 'var(--space-3)' }}>
                💡 Add {formatPrice(499 - subtotal)} more to qualify for <strong>FREE Delivery</strong>!
              </p>
            )}

            <div className="summary-line total">
              <span>Estimated Total</span>
              <span style={{ color: 'var(--color-primary-400)' }}>{formatPrice(grandTotal)}</span>
            </div>

            {/* Coupon Application Box */}
            <form onSubmit={handleApplyCoupon} className="coupon-group">
              <input
                type="text"
                placeholder="Enter coupon code"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                className="form-control"
                style={{ textTransform: 'uppercase' }}
                aria-label="Coupon code input"
              />
              <Button type="submit" variant="secondary" size="sm">
                Apply
              </Button>
            </form>

            {/* Proceed to Checkout Button */}
            <Button
              variant="primary"
              size="lg"
              block
              onClick={() => navigate('/checkout')}
              style={{ marginTop: 'var(--space-4)' }}
            >
              Proceed to Checkout →
            </Button>

            {/* Security note */}
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textAlign: 'center', marginTop: 'var(--space-4)' }}>
              🔒 Guaranteed Safe & Secure Checkout via Razorpay
            </p>
          </aside>
        </div>
      </div>
    </MainLayout>
  );
};

export default CartPage;
