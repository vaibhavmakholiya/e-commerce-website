import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Button from '../components/ui/Button';
import FormField from '../components/ui/FormField';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import { useToast } from '../components/ui/Toast';
import { formatPrice } from '../utils/formatters';
import { validateName, validatePhone, validatePincode, validateRequired } from '../utils/validators';

const CheckoutPage = () => {
  const { items, subtotal, shippingFee, appliedCoupon, couponDiscount, grandTotal, clearCart } = useCart();
  const { user, loginAsDemo, addAddress } = useAuth();
  const { createOrder } = useOrders();
  const { toast } = useToast();
  const navigate = useNavigate();

  // If cart is empty, redirect
  if (items.length === 0) {
    return (
      <MainLayout>
        <div className="container" style={{ padding: 'var(--space-16) var(--space-4)', textAlign: 'center' }}>
          <h2>Your Cart is Empty</h2>
          <p style={{ color: 'var(--text-muted)', margin: '1rem 0 2rem' }}>
            Add items to your cart before proceeding to checkout.
          </p>
          <Link to="/shop" className="btn btn-primary">
            Browse Products →
          </Link>
        </div>
      </MainLayout>
    );
  }

  // Address selection state
  const defaultAddr = user?.addresses?.find((a) => a.isDefault) || user?.addresses?.[0];
  const [selectedAddressId, setSelectedAddressId] = useState(defaultAddr?.id || 'new');
  const [newAddress, setNewAddress] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    street: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '',
    tag: 'Home',
  });
  const [addressErrors, setAddressErrors] = useState({});

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState('razorpay'); // 'razorpay' | 'cod'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState(null);

  // Handle address form changes
  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setNewAddress((prev) => ({ ...prev, [name]: value }));
    setAddressErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateAddress = () => {
    const errs = {};
    const nameRes = validateName(newAddress.fullName);
    const phoneRes = validatePhone(newAddress.phone);
    const streetRes = validateRequired(newAddress.street, 'Street address');
    const pincodeRes = validatePincode(newAddress.pincode);

    if (!nameRes.isValid) errs.fullName = nameRes.message;
    if (!phoneRes.isValid) errs.phone = phoneRes.message;
    if (!streetRes.isValid) errs.street = streetRes.message;
    if (!pincodeRes.isValid) errs.pincode = pincodeRes.message;

    setAddressErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePlaceOrder = async () => {
    // 1. Require Authentication
    if (!user) {
      toast.error('Please sign in or select "Continue as Demo Customer" before placing your order.');
      return;
    }

    // 2. Resolve Shipping Address
    let finalAddress = null;
    if (selectedAddressId === 'new') {
      if (!validateAddress()) {
        toast.error('Please correct the errors in the shipping address.');
        return;
      }
      finalAddress = newAddress;
      // Save for future
      addAddress(newAddress);
    } else {
      finalAddress = user.addresses.find((a) => a.id === selectedAddressId);
    }

    if (!finalAddress) {
      toast.error('Please specify a valid delivery address.');
      return;
    }

    // 3. Prevent duplicate submission
    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      // Simulate Razorpay payment gateway handshake & server-side verification
      await new Promise((resolve) => setTimeout(resolve, 1400));

      const paymentMethodLabel =
        paymentMethod === 'razorpay'
          ? 'Razorpay (UPI / NetBanking / Cards)'
          : 'Cash on Delivery (COD)';

      const createdOrder = createOrder({
        items: items.map((i) => ({
          id: i.product.id,
          name: i.product.name,
          image: i.product.images[0],
          price: i.price,
          quantity: i.quantity,
          variant: i.selectedVariant,
        })),
        shippingAddress: finalAddress,
        subtotal,
        shippingFee,
        discount: couponDiscount,
        grandTotal,
        couponCode: appliedCoupon?.code,
        paymentMethod: paymentMethodLabel,
      });

      // Clear cart
      clearCart();
      toast.success('Order placed successfully! Redirecting…');
      navigate(`/order-success/${createdOrder.id}`);
    } catch (err) {
      setIsSubmitting(false);
      setSubmissionError('Transaction could not be completed. Please check your payment details or try Cash on Delivery.');
      toast.error('Payment failed. Please try again.');
    }
  };

  return (
    <MainLayout>
      <div className="container" style={{ padding: 'var(--space-8) var(--space-4) var(--space-16)' }}>
        {/* Breadcrumb */}
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span aria-hidden="true">/</span>
          <Link to="/cart">Cart</Link>
          <span aria-hidden="true">/</span>
          <span className="current">Checkout</span>
        </nav>

        <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, marginBottom: 'var(--space-8)' }}>
          Secure Checkout 🔒
        </h1>

        <div className="cart-layout">
          {/* ── LEFT: CHECKOUT STEPS ───────────────────────────── */}
          <div>
            {/* Step 1: Authentication Guard */}
            <div className="checkout-step-card">
              <div className="step-header">
                <span className="step-number">1</span>
                <div>
                  <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>
                    Customer Account
                  </h2>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                    Orders are linked to your profile for tracking and warranty support
                  </p>
                </div>
              </div>

              {user ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>{user.avatar || '👤'}</span>
                    <div>
                      <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--text-main)' }}>
                        {user.name}
                      </strong>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                        {user.email} {user.phone && `• ${user.phone}`}
                      </p>
                    </div>
                  </div>
                  <Badge variant="success">Signed In ✓</Badge>
                </div>
              ) : (
                <div style={{ padding: 'var(--space-4)', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)' }}>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-main)', marginBottom: '0.75rem' }}>
                    You are checking out as a guest. To finalize your order, sign in or test immediately with our demo customer account:
                  </p>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <Button variant="primary" size="sm" onClick={loginAsDemo}>
                      ⚡ Continue as Demo Customer (1-Click)
                    </Button>
                    <Link to="/login?redirect=/checkout" className="btn btn-secondary btn-sm">
                      Sign In
                    </Link>
                    <Link to="/register?redirect=/checkout" className="btn btn-ghost btn-sm">
                      Create Account
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Step 2: Shipping Address */}
            <div className="checkout-step-card">
              <div className="step-header">
                <span className="step-number">2</span>
                <div>
                  <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>
                    Shipping Address
                  </h2>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                    Where should we deliver your order?
                  </p>
                </div>
              </div>

              {/* Saved addresses selector */}
              {user?.addresses?.length > 0 && (
                <div style={{ marginBottom: 'var(--space-4)' }}>
                  <p style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    Choose from saved addresses:
                  </p>
                  {user.addresses.map((addr) => (
                    <label
                      key={addr.id}
                      className={`payment-method-card ${selectedAddressId === addr.id ? 'selected' : ''}`}
                      style={{ cursor: 'pointer', display: 'flex', alignItems: 'flex-start' }}
                    >
                      <input
                        type="radio"
                        name="shippingAddress"
                        checked={selectedAddressId === addr.id}
                        onChange={() => setSelectedAddressId(addr.id)}
                        style={{ marginTop: '3px' }}
                      />
                      <div style={{ flex: 1, marginLeft: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <strong style={{ fontSize: 'var(--text-sm)' }}>{addr.fullName}</strong>
                          <Badge variant="default">{addr.tag || 'Address'}</Badge>
                          {addr.isDefault && <Badge variant="info">Default</Badge>}
                        </div>
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                          {addr.street}, {addr.city}, {addr.state} — {addr.pincode}
                        </p>
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-dim)' }}>
                          Phone: {addr.phone}
                        </p>
                      </div>
                    </label>
                  ))}

                  <label className={`payment-method-card ${selectedAddressId === 'new' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="shippingAddress"
                      checked={selectedAddressId === 'new'}
                      onChange={() => setSelectedAddressId('new')}
                    />
                    <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginLeft: '0.5rem' }}>
                      + Add a New Delivery Address
                    </span>
                  </label>
                </div>
              )}

              {/* New Address Form */}
              {(selectedAddressId === 'new' || !user?.addresses?.length) && (
                <div style={{ background: 'var(--bg-surface-elevated)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                    <FormField
                      label="Full Name"
                      name="fullName"
                      value={newAddress.fullName}
                      onChange={handleAddressChange}
                      error={addressErrors.fullName}
                      placeholder="Arjun Sharma"
                      required
                    />
                    <FormField
                      label="10-digit Mobile Number"
                      name="phone"
                      value={newAddress.phone}
                      onChange={handleAddressChange}
                      error={addressErrors.phone}
                      placeholder="9876543210"
                      required
                    />
                  </div>

                  <FormField
                    label="Flat, House no., Building, Street"
                    name="street"
                    value={newAddress.street}
                    onChange={handleAddressChange}
                    error={addressErrors.street}
                    placeholder="Flat 402, Green Glen Layout, Outer Ring Rd"
                    required
                  />

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-3)' }}>
                    <FormField
                      label="City"
                      name="city"
                      value={newAddress.city}
                      onChange={handleAddressChange}
                      required
                    />
                    <FormField
                      label="State"
                      name="state"
                      value={newAddress.state}
                      onChange={handleAddressChange}
                      required
                    />
                    <FormField
                      label="PIN Code"
                      name="pincode"
                      value={newAddress.pincode}
                      onChange={handleAddressChange}
                      error={addressErrors.pincode}
                      placeholder="560103"
                      required
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Step 3: Payment Method */}
            <div className="checkout-step-card">
              <div className="step-header">
                <span className="step-number">3</span>
                <div>
                  <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>
                    Payment Options
                  </h2>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                    Select a secure payment method
                  </p>
                </div>
              </div>

              {/* Razorpay Online */}
              <label
                className={`payment-method-card ${paymentMethod === 'razorpay' ? 'selected' : ''}`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="razorpay"
                  checked={paymentMethod === 'razorpay'}
                  onChange={() => setPaymentMethod('razorpay')}
                />
                <div style={{ flex: 1, marginLeft: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <strong style={{ fontSize: 'var(--text-sm)' }}>
                      Razorpay Secure (UPI, Cards, NetBanking, EMI)
                    </strong>
                    <Badge variant="success">Recommended</Badge>
                  </div>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    Google Pay, PhonePe, Paytm, All Major Credit/Debit Cards, 50+ Banks NetBanking.
                  </p>
                </div>
              </label>

              {/* Cash on Delivery */}
              <label
                className={`payment-method-card ${paymentMethod === 'cod' ? 'selected' : ''}`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                />
                <div style={{ flex: 1, marginLeft: '0.5rem' }}>
                  <strong style={{ fontSize: 'var(--text-sm)' }}>
                    Cash on Delivery (COD)
                  </strong>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    Pay in cash or UPI QR scan upon home delivery.
                  </p>
                </div>
              </label>

              {/* Error Alert if payment fails */}
              {submissionError && (
                <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--color-rose-500)', borderRadius: 'var(--radius-md)', color: 'var(--color-rose-300)', fontSize: 'var(--text-xs)', marginTop: 'var(--space-4)' }} role="alert">
                  ⚠ {submissionError}
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT: TRUSTED SERVER ORDER SUMMARY ───────────── */}
          <aside className="summary-card" aria-label="Review order">
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 800, marginBottom: 'var(--space-4)' }}>
              Order Review ({items.length} items)
            </h2>

            {/* Compact items list */}
            <div style={{ maxHeight: '220px', overflowY: 'auto', marginBottom: 'var(--space-4)', paddingRight: '0.25rem' }}>
              {items.map((item) => (
                <div
                  key={item.cartItemId}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.5rem',
                    padding: '0.4rem 0',
                    borderBottom: '1px solid var(--border-subtle)',
                    fontSize: 'var(--text-xs)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
                    <img
                      src={item.product.images[0]}
                      alt=""
                      style={{ width: '32px', height: '32px', borderRadius: '4px', objectFit: 'cover' }}
                    />
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <p style={{ color: 'var(--text-main)', fontWeight: 600 }}>{item.product.name}</p>
                      <p style={{ color: 'var(--text-muted)' }}>Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span style={{ fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap' }}>
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="summary-line">
              <span>Items Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>

            {couponDiscount > 0 && (
              <div className="summary-line" style={{ color: 'var(--color-amber-400)' }}>
                <span>Coupon ({appliedCoupon?.code})</span>
                <span>− {formatPrice(couponDiscount)}</span>
              </div>
            )}

            <div className="summary-line">
              <span>Delivery Charges</span>
              <span>{shippingFee === 0 ? <strong style={{ color: 'var(--color-emerald-400)' }}>FREE</strong> : formatPrice(shippingFee)}</span>
            </div>

            <div className="summary-line total">
              <span>Total Payable</span>
              <span style={{ color: 'var(--color-primary-400)' }}>{formatPrice(grandTotal)}</span>
            </div>

            {/* Place Order CTA with Duplicate Submission Lock */}
            <Button
              variant="primary"
              size="lg"
              block
              isLoading={isSubmitting}
              onClick={handlePlaceOrder}
              disabled={isSubmitting}
              style={{ marginTop: 'var(--space-6)' }}
            >
              {isSubmitting
                ? 'Processing Payment Securely…'
                : `Place Order • ${formatPrice(grandTotal)} 🔒`}
            </Button>

            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textAlign: 'center', marginTop: 'var(--space-3)' }}>
              By placing this order, you agree to NovaCart's <Link to="/terms" style={{ color: 'var(--color-primary-400)' }}>Terms</Link> & <Link to="/privacy-policy" style={{ color: 'var(--color-primary-400)' }}>Privacy Policy</Link>.
            </p>
          </aside>
        </div>
      </div>
    </MainLayout>
  );
};

export default CheckoutPage;
