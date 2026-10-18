import React from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Card from '../components/ui/Card';

const PrivacyPolicyPage = () => {
  return (
    <MainLayout>
      <div className="container" style={{ padding: 'var(--space-12) var(--space-4) var(--space-16)', maxWidth: '840px' }}>
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span aria-hidden="true">/</span>
          <span className="current">Privacy Policy</span>
        </nav>

        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 800, marginBottom: 'var(--space-2)' }}>
          Privacy Policy
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)', marginBottom: 'var(--space-8)' }}>
          Last updated: October 2026 • NovaCart Data Protection & Privacy Commitment
        </p>

        <Card style={{ padding: 'var(--space-8)', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <div>
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: '0.5rem' }}>
              1. Information We Collect
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', lineHeight: 1.8 }}>
              NovaCart collects only the information necessary to fulfill your orders and maintain account security:
            </p>
            <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-muted)', fontSize: 'var(--text-sm)', lineHeight: 1.8, marginTop: '0.5rem' }}>
              <li><strong>Contact Information:</strong> Full name, verified email address, and mobile phone number for order notifications.</li>
              <li><strong>Shipping Coordinates:</strong> Complete physical address and PIN code to route deliveries through our carrier partners.</li>
              <li><strong>Transaction Records:</strong> Order numbers, item lists, timestamps, and total amounts.</li>
            </ul>
          </div>

          <div>
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: '0.5rem' }}>
              2. Payment Security & PCI-DSS Compliance
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', lineHeight: 1.8 }}>
              NovaCart does <strong>not</strong> collect, process, or store sensitive financial instruments on our servers. All digital transactions (UPI, Credit/Debit cards, NetBanking) are processed directly through <strong>Razorpay</strong>, a Payment Card Industry Data Security Standard (PCI-DSS Level 1) certified gateway. We only receive an encrypted token confirming payment success or failure.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: '0.5rem' }}>
              3. How We Use Your Data
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', lineHeight: 1.8 }}>
              Your personal information is utilized strictly to:
            </p>
            <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-muted)', fontSize: 'var(--text-sm)', lineHeight: 1.8, marginTop: '0.5rem' }}>
              <li>Process and ship purchased merchandise to your verified address.</li>
              <li>Transmit electronic tax invoices and SMS dispatch tracking links.</li>
              <li>Prevent unauthorized checkout attempts and fraudulent transactions.</li>
              <li>Send periodic newsletters (only if you have explicitly opted in, with 1-click unsubscribe).</li>
            </ul>
          </div>

          <div>
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: '0.5rem' }}>
              4. Data Retention & Your Right to Deletion
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', lineHeight: 1.8 }}>
              You retain full control over your personal data. At any time, you can edit your profile details, delete saved addresses, or permanently delete your entire account through the <strong>Security & Account</strong> tab in your profile dashboard. Account deletion permanently removes your profile and personal addresses from our active databases.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: '0.5rem' }}>
              5. Contact Our Privacy Grievance Officer
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', lineHeight: 1.8 }}>
              In accordance with the Information Technology Act 2000 and the Digital Personal Data Protection Act (DPDP), any inquiries or grievances regarding data privacy can be addressed to:<br />
              <strong>Grievance Officer:</strong> privacy@novacart.in • NovaCart India Technologies Pvt. Ltd., Bellandur, Bengaluru 560103.
            </p>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
};

export default PrivacyPolicyPage;
