import React from 'react';
import { useParams, Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';
import { useOrders } from '../context/OrderContext';
import { formatPrice } from '../utils/formatters';

const OrderSuccessPage = () => {
  const { id } = useParams();
  const { getOrderById, orders } = useOrders();

  const order = getOrderById(id) || orders[0];

  if (!order) {
    return (
      <MainLayout>
        <div className="container" style={{ padding: 'var(--space-16) 0', textAlign: 'center' }}>
          <h2>Order Not Found</h2>
          <p style={{ color: 'var(--text-muted)', margin: '1rem 0 2rem' }}>
            We could not find the order details for this reference.
          </p>
          <Link to="/" className="btn btn-primary">
            Return to Homepage
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container" style={{ padding: 'var(--space-12) var(--space-4) var(--space-16)', maxWidth: '780px' }}>
        {/* Animated Celebration Banner */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: 'var(--radius-full)',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: '#ffffff',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.5rem',
              marginBottom: 'var(--space-4)',
              boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)',
            }}
          >
            ✓
          </div>

          <Badge variant="success" style={{ marginBottom: '0.75rem', fontSize: 'var(--text-xs)' }}>
            Order Placed Successfully
          </Badge>

          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 800, marginBottom: '0.5rem' }}>
            Thank You for Shopping with NovaCart!
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-base)' }}>
            We've sent a detailed confirmation email and SMS with live tracking updates.
          </p>
        </div>

        {/* Order Details Summary Box */}
        <Card style={{ marginBottom: 'var(--space-8)', padding: 'var(--space-6)' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 'var(--space-4)',
              paddingBottom: 'var(--space-4)',
              borderBottom: '1px solid var(--border-subtle)',
            }}
          >
            <div>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Order Reference</span>
              <p style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: 'var(--text-sm)', marginTop: '0.2rem' }}>
                {order.orderNumber}
              </p>
            </div>
            <div>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Payment Method</span>
              <p style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: 'var(--text-sm)', marginTop: '0.2rem' }}>
                {order.paymentMethod}
              </p>
            </div>
            <div>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Payment Status</span>
              <p style={{ marginTop: '0.2rem' }}>
                <Badge variant={order.paymentStatus === 'Paid' ? 'success' : 'warning'}>
                  {order.paymentStatus}
                </Badge>
              </p>
            </div>
            <div>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Estimated Delivery</span>
              <p style={{ fontWeight: 700, color: 'var(--color-primary-400)', fontSize: 'var(--text-sm)', marginTop: '0.2rem' }}>
                {order.estimatedDelivery}
              </p>
            </div>
          </div>

          {/* Delivery Stepper Tracker */}
          <div style={{ marginTop: 'var(--space-6)' }}>
            <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, marginBottom: 'var(--space-4)' }}>
              Shipment Progress
            </h3>

            <div className="order-tracking-steps">
              {order.tracking?.map((step, idx) => (
                <div
                  key={step.status}
                  className={`tracking-step ${step.completed ? 'done' : idx === 1 ? 'current' : ''}`}
                >
                  <div className="tracking-dot">
                    {step.completed ? '✓' : idx + 1}
                  </div>
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: step.completed ? 'var(--text-main)' : 'var(--text-muted)' }}>
                    {step.status}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                    {step.date}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Itemized Receipt Breakdown */}
        <Card style={{ marginBottom: 'var(--space-8)', padding: 'var(--space-6)' }}>
          <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginBottom: 'var(--space-4)' }}>
            Ordered Items
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {order.items?.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 'var(--space-3) 0',
                  borderBottom: idx < order.items.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                  <img
                    src={item.image}
                    alt={item.name}
                    style={{ width: '50px', height: '50px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                  />
                  <div>
                    <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{item.name}</h4>
                    {item.variant && (
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                        {Object.entries(item.variant).map(([k, v]) => `${k}: ${v}`).join(', ')}
                      </p>
                    )}
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-dim)' }}>Qty: {item.quantity}</p>
                  </div>
                </div>

                <span style={{ fontWeight: 700, fontSize: 'var(--text-sm)', fontFamily: 'var(--font-heading)' }}>
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          {/* Pricing Totals */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
            <div className="summary-line">
              <span>Subtotal</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="summary-line" style={{ color: 'var(--color-amber-400)' }}>
                <span>Coupon Savings ({order.couponCode || 'Promo'})</span>
                <span>− {formatPrice(order.discount)}</span>
              </div>
            )}
            <div className="summary-line">
              <span>Delivery Charges</span>
              <span>{order.shippingFee === 0 ? <strong style={{ color: 'var(--color-emerald-400)' }}>FREE</strong> : formatPrice(order.shippingFee)}</span>
            </div>
            <div className="summary-line total">
              <span>Grand Total</span>
              <span style={{ color: 'var(--color-primary-400)' }}>{formatPrice(order.grandTotal)}</span>
            </div>
          </div>
        </Card>

        {/* Shipping Destination */}
        <div style={{ background: 'var(--bg-surface)', padding: 'var(--space-5)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginBottom: 'var(--space-8)' }}>
          <h4 style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
            Delivering To
          </h4>
          <p style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>
            {order.shippingAddress?.fullName} • {order.shippingAddress?.phone}
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)', marginTop: '0.2rem' }}>
            {order.shippingAddress?.street}, {order.shippingAddress?.city}, {order.shippingAddress?.state} — {order.shippingAddress?.pincode}
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/shop" className="btn btn-primary">
            Continue Shopping →
          </Link>
          <Link to="/profile" className="btn btn-secondary">
            View My Orders & Account
          </Link>
        </div>
      </div>
    </MainLayout>
  );
};

export default OrderSuccessPage;
