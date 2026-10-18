import React from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Card from '../components/ui/Card';

const TermsPage = () => {
  return (
    <MainLayout>
      <div className="container" style={{ padding: 'var(--space-12) var(--space-4) var(--space-16)', maxWidth: '840px' }}>
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span aria-hidden="true">/</span>
          <span className="current">Terms & Conditions</span>
        </nav>

        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 800, marginBottom: 'var(--space-2)' }}>
          Terms & Conditions
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)', marginBottom: 'var(--space-8)' }}>
          Last updated: October 2026 • Governing terms for use of the NovaCart platform
        </p>

        <Card style={{ padding: 'var(--space-8)', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <div>
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: '0.5rem' }}>
              1. Platform Usage & Acceptance
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', lineHeight: 1.8 }}>
              By accessing, browsing, or transacting on the NovaCart website, you agree to comply with and be bound by these Terms and Conditions and all operating guidelines referenced herein. If you do not agree to these terms, please do not use the service.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: '0.5rem' }}>
              2. Account Responsibilities
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', lineHeight: 1.8 }}>
              Users are responsible for maintaining the confidentiality of their credentials and for all activities that occur under their account. You must provide accurate, current, and complete personal and shipping information during registration and checkout.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: '0.5rem' }}>
              3. Pricing, GST & Order Acceptance
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', lineHeight: 1.8 }}>
              All product prices are quoted in Indian Rupees (₹ INR) and include applicable Goods and Services Tax (GST). While we strive for absolute accuracy, in the rare event that a product is mistakenly listed at an incorrect price due to technical error, NovaCart reserves the right to notify the customer and cancel the affected order with an immediate full refund.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: '0.5rem' }}>
              4. Product Warranties & Authenticity
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', lineHeight: 1.8 }}>
              All branded electronic products sold on NovaCart carry official brand manufacturer warranties valid across authorized service centers in India. Brand warranty documentation is bundled within the product packaging. NovaCart warrants that all products dispatched are genuine and sourced through authorized brand distributors.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: '0.5rem' }}>
              5. Governing Law & Dispute Resolution
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', lineHeight: 1.8 }}>
              These Terms and Conditions shall be governed by and construed in accordance with the laws of India. Any disputes arising out of or in connection with the use of this website shall be subject to the exclusive jurisdiction of the competent courts in <strong>Bengaluru, Karnataka</strong>.
            </p>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
};

export default TermsPage;
