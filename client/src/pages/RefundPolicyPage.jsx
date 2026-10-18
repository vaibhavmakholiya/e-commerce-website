import React from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Card from '../components/ui/Card';

const RefundPolicyPage = () => {
  return (
    <MainLayout>
      <div className="container" style={{ padding: 'var(--space-12) var(--space-4) var(--space-16)', maxWidth: '840px' }}>
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span aria-hidden="true">/</span>
          <span className="current">Return & Refund Policy</span>
        </nav>

        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 800, marginBottom: 'var(--space-2)' }}>
          Return, Replacement & Refund Policy
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)', marginBottom: 'var(--space-8)' }}>
          Last updated: October 2026 • 7-day customer protection policy
        </p>

        <Card style={{ padding: 'var(--space-8)', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <div>
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: '0.5rem' }}>
              1. 7-Day Window for Return or Replacement
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', lineHeight: 1.8 }}>
              NovaCart provides a 7-day return or replacement window starting from the day of successful delivery. If a product arrives physically damaged, missing parts, or dead on arrival (DOA), you may request a free replacement or full refund through your Account portal or by writing to support@novacart.in.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: '0.5rem' }}>
              2. Return Eligibility Criteria
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', lineHeight: 1.8 }}>
              To qualify for return processing, products must be in their original, unused condition:
            </p>
            <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-muted)', fontSize: 'var(--text-sm)', lineHeight: 1.8, marginTop: '0.5rem' }}>
              <li>Complete original manufacturer packaging and security seal box intact.</li>
              <li>All bundled accessories, manuals, power cables, and promotional items included.</li>
              <li>Brand tags, warranty cards, and MRP stickers must not be detached or defaced.</li>
              <li>Products showing customer abuse, liquid immersion, or altered serial numbers will not be accepted.</li>
            </ul>
          </div>

          <div>
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: '0.5rem' }}>
              3. Reverse Pickup Process
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', lineHeight: 1.8 }}>
              Once your return request is authorized, we will dispatch a courier partner to collect the parcel from your original shipping address. Reverse pickups are completely free of cost for defective or incorrectly dispatched items.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: '0.5rem' }}>
              4. Inspection & Refund Timelines
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', lineHeight: 1.8 }}>
              • <strong>Quality Check:</strong> Once the item reaches our fulfillment center, our inspection team verifies condition within 48 hours.<br />
              • <strong>Prepaid Orders (UPI / Cards / NetBanking):</strong> Refunds are initiated via Razorpay immediately upon verification and reflect in your bank account in <strong>5 to 7 business days</strong>.<br />
              • <strong>Cash on Delivery (COD) Orders:</strong> Refunds are disbursed via secure NEFT bank transfer to your provided account details within <strong>3 to 5 business days</strong>.
            </p>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
};

export default RefundPolicyPage;
