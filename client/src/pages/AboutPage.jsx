import React from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';

const AboutPage = () => {
  return (
    <MainLayout>
      <div className="container" style={{ padding: 'var(--space-12) var(--space-4) var(--space-16)', maxWidth: '840px' }}>
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span aria-hidden="true">/</span>
          <span className="current">About Us</span>
        </nav>

        <div style={{ textAlign: 'center', marginBottom: 'var(--space-10)' }}>
          <Badge variant="info" style={{ marginBottom: '0.75rem' }}>Our Story & Mission</Badge>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, marginBottom: '0.75rem' }}>
            Built for Modern Indian Shoppers
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-lg)', lineHeight: 1.6 }}>
            NovaCart was built from the ground up to eliminate clutter and provide authentic, handpicked products across Electronics, Fashion, Home & Living, and Accessories.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
          <Card style={{ padding: 'var(--space-8)' }}>
            <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: 'var(--space-3)' }}>
              1. The NovaCart Philosophy
            </h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, fontSize: 'var(--text-sm)', marginBottom: '1rem' }}>
              Online shopping in India is often plagued by counterfeit goods, misleading discounts, and clunky interfaces. NovaCart was envisioned as an antidote: a clean, minimalist platform with zero sponsored noise, strictly authentic inventory, and lightning-fast checkout.
            </p>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, fontSize: 'var(--text-sm)' }}>
              Every product in our catalog is vetted for quality before listing. All prices are listed transparently in Indian Rupees (₹ INR) inclusive of GST, with no hidden checkout fees.
            </p>
          </Card>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-6)' }}>
            <Card style={{ padding: 'var(--space-6)' }}>
              <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}>⚡</span>
              <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginBottom: '0.25rem' }}>Fast Pan-India Logistics</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)', lineHeight: 1.6 }}>
                Partnered with premier couriers like Delhivery and BlueDart to ensure orders reach metro cities within 48-72 hours.
              </p>
            </Card>

            <Card style={{ padding: 'var(--space-6)' }}>
              <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}>🔒</span>
              <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginBottom: '0.25rem' }}>Bank-Grade Security</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)', lineHeight: 1.6 }}>
                Payments powered by Razorpay with end-to-end 256-bit encryption for UPI, RuPay, Visa, and Mastercard transactions.
              </p>
            </Card>

            <Card style={{ padding: 'var(--space-6)' }}>
              <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}>↩</span>
              <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginBottom: '0.25rem' }}>7-Day Buyer Protection</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)', lineHeight: 1.6 }}>
                Simple, transparent replacement or full refund if any product arrives damaged or fails to match its specifications.
              </p>
            </Card>
          </div>

          <Card style={{ padding: 'var(--space-8)' }}>
            <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: 'var(--space-3)' }}>
              2. Technology & Engineering
            </h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, fontSize: 'var(--text-sm)' }}>
              NovaCart is engineered using the production-proven MERN architecture (MongoDB, Express, React, Node.js) paired with Vite and modern CSS design tokens. Our platform achieves high performance through decoupled state management, server-side price validation, and responsive mobile-first UI components.
            </p>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default AboutPage;
