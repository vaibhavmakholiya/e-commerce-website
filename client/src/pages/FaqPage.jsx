import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';

const FAQ_DATA = [
  {
    category: 'Orders & Tracking',
    items: [
      {
        q: 'How do I track my order once placed?',
        a: 'Once your order is dispatched, you will receive an SMS and email notification with an active tracking link from Delhivery or BlueDart. You can also view live status anytime from your NovaCart Account dashboard under "Order History".',
      },
      {
        q: 'Can I cancel or modify my order after placing it?',
        a: 'Orders can be cancelled free of charge before they enter the "Dispatched" stage. Navigate to your Account > Order History or contact our support team immediately at 1800-419-NOVA.',
      },
      {
        q: 'How do I apply coupon codes to my order?',
        a: 'Enter valid coupons (like WELCOME100, FESTIVE15, or NOVA500) in the coupon input field on the Shopping Cart or Checkout page. The discount will calculate instantly against server-side validation rules.',
      },
    ],
  },
  {
    category: 'Shipping & Delivery',
    items: [
      {
        q: 'What are the delivery timelines across India?',
        a: 'Metro cities (Bengaluru, Mumbai, Delhi-NCR, Hyderabad, Chennai, Kolkata, Pune) typically receive deliveries within 2 to 3 business days. Non-metro locations and Tier 2/3 cities are delivered within 4 to 5 business days.',
      },
      {
        q: 'What is the shipping fee?',
        a: 'All orders with a subtotal of ₹499 or higher receive 100% FREE standard shipping pan-India. For orders below ₹499, a nominal flat delivery charge of ₹70 applies.',
      },
      {
        q: 'Do you deliver to my PIN code?',
        a: 'We ship to over 19,000 PIN codes across India via Delhivery, BlueDart, and India Post Speed Post. You can verify your PIN code directly on the checkout page.',
      },
    ],
  },
  {
    category: 'Payments & Security',
    items: [
      {
        q: 'What payment modes are accepted on NovaCart?',
        a: 'We support all major payment instruments via Razorpay: UPI (Google Pay, PhonePe, Paytm, BHIM, CRED), Credit/Debit cards (Visa, Mastercard, RuPay, Amex), NetBanking across 50+ Indian banks, and Cash on Delivery (COD).',
      },
      {
        q: 'Is online payment secure on NovaCart?',
        a: 'Yes. All online payments are handled directly by Razorpay, a PCI-DSS Level 1 certified payment gateway with 256-bit SSL encryption. NovaCart never stores your card CVV, ATM PINs, or net banking passwords.',
      },
      {
        q: 'What happens if money was deducted but the order failed?',
        a: 'If money was deducted from your account during an interrupted session, Razorpay automatically initiates an auto-reversal within 2 to 4 hours. The refund will reflect in your source account within 3-5 bank working days.',
      },
    ],
  },
  {
    category: 'Returns & Refunds',
    items: [
      {
        q: 'What is NovaCart’s return policy?',
        a: 'We offer a 7-day hassle-free replacement or return window from the date of delivery for defective, damaged, or incorrectly dispatched products. Items must retain original packaging, tags, and accessories.',
      },
      {
        q: 'How long does a refund take to process?',
        a: 'Once the returned item is picked up and inspected at our hub (usually 2-3 days), refunds are initiated to your original payment method (UPI/Card) within 24 hours. Banks generally credit the amount in 5 to 7 business days.',
      },
    ],
  },
];

const FaqPage = () => {
  const [openItems, setOpenItems] = useState({ 'Orders & Tracking-0': true });

  const toggleItem = (key) => {
    setOpenItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <MainLayout>
      <div className="container" style={{ padding: 'var(--space-12) var(--space-4) var(--space-16)', maxWidth: '860px' }}>
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span aria-hidden="true">/</span>
          <span className="current">Frequently Asked Questions</span>
        </nav>

        <div style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
          <Badge variant="info" style={{ marginBottom: '0.5rem' }}>Help & Knowledge Base</Badge>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, marginBottom: '0.75rem' }}>
            Frequently Asked Questions
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-base)' }}>
            Quick answers to the most common queries regarding ordering, shipping, payments, and returns.
          </p>
        </div>

        <div className="faq-accordion">
          {FAQ_DATA.map((group) => (
            <div key={group.category} style={{ marginBottom: 'var(--space-8)' }}>
              <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 800, color: 'var(--color-primary-400)', marginBottom: 'var(--space-4)' }}>
                {group.category}
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {group.items.map((item, idx) => {
                  const key = `${group.category}-${idx}`;
                  const isOpen = !!openItems[key];

                  return (
                    <div key={idx} className="accordion-item">
                      <button
                        type="button"
                        className="accordion-trigger"
                        onClick={() => toggleItem(key)}
                        aria-expanded={isOpen}
                      >
                        <span>{item.q}</span>
                        <span style={{ fontSize: '1.25rem', transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 200ms ease' }}>
                          ▾
                        </span>
                      </button>

                      {isOpen && (
                        <div className="accordion-content">
                          <p>{item.a}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Still have questions banner */}
        <div
          style={{
            marginTop: 'var(--space-12)',
            padding: 'var(--space-8)',
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-lg)',
            textAlign: 'center',
          }}
        >
          <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: '0.5rem' }}>
            Didn't find what you were looking for?
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>
            Our dedicated support team is available Mon-Sat, 9 AM - 7 PM to assist you.
          </p>
          <Link to="/contact" className="btn btn-primary">
            Contact Support Team →
          </Link>
        </div>
      </div>
    </MainLayout>
  );
};

export default FaqPage;
