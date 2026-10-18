import React from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Card from '../components/ui/Card';

const ShippingPolicyPage = () => {
  return (
    <MainLayout>
      <div className="container" style={{ padding: 'var(--space-12) var(--space-4) var(--space-16)', maxWidth: '840px' }}>
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span aria-hidden="true">/</span>
          <span className="current">Shipping Policy</span>
        </nav>

        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 800, marginBottom: 'var(--space-2)' }}>
          Shipping & Delivery Policy
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)', marginBottom: 'var(--space-8)' }}>
          Last updated: October 2026 • Governs pan-India dispatches from NovaCart
        </p>

        <Card style={{ padding: 'var(--space-8)', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <div>
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: '0.5rem' }}>
              1. Delivery Coverage & Logistics Partners
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', lineHeight: 1.8 }}>
              NovaCart delivers to over 19,000 postal PIN codes across the Republic of India. We partner with established, audited tier-1 courier aggregators including Delhivery, BlueDart, Shadowfax, and India Post Speed Post for regional deliveries.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: '0.5rem' }}>
              2. Shipping Charges & Free Delivery Threshold
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', lineHeight: 1.8 }}>
              • Orders with a final merchandise subtotal of <strong>₹499 or higher</strong> qualify for <strong>100% Free Standard Delivery</strong>.<br />
              • Orders below ₹499 incur a flat standardized shipping charge of <strong>₹70</strong> to partially offset packaging and carrier transit costs.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: '0.5rem' }}>
              3. Processing & Delivery Timelines
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', lineHeight: 1.8 }}>
              • <strong>Order Processing:</strong> Verified orders placed before 3:00 PM IST (Mon-Sat) are processed and handed over to logistics partners within 24 hours.<br />
              • <strong>Metro Cities (Tier 1):</strong> Delivered within <strong>2 to 3 business days</strong>.<br />
              • <strong>Rest of India (Tier 2 & Tier 3):</strong> Delivered within <strong>3 to 5 business days</strong>.<br />
              • <strong>Remote / North-East / Island Territories:</strong> Delivered within <strong>5 to 7 business days</strong>.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: '0.5rem' }}>
              4. Tracking Your Consignment
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', lineHeight: 1.8 }}>
              Upon carrier handover, you will receive an automatic Air Waybill (AWB) tracking number via SMS and email. You can monitor the live transit checkpoints either through the carrier website or directly in your NovaCart Account dashboard.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: '0.5rem' }}>
              5. Undeliverable Shipments & Address Accuracy
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', lineHeight: 1.8 }}>
              Please ensure your delivery address, PIN code, and contact phone number are entered accurately at checkout. If a shipment is returned to origin due to repeated customer unavailability or an invalid address, re-dispatch charges may apply.
            </p>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
};

export default ShippingPolicyPage;
