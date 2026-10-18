import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || 'your registered email address';

  return (
    <MainLayout>
      <div
        className="container"
        style={{ padding: 'var(--space-12) var(--space-4) var(--space-16)', maxWidth: '480px', textAlign: 'center' }}
      >
        <span style={{ fontSize: '3.5rem', display: 'block', marginBottom: '1rem' }}>✉️</span>
        <Badge variant="info" style={{ marginBottom: '0.75rem' }}>Email Verification</Badge>
        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', fontWeight: 800, marginBottom: '0.75rem' }}>
          Check Your Inbox
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', lineHeight: 1.6, marginBottom: 'var(--space-8)' }}>
          We've sent a verification link to <strong>{email}</strong>. Please click the link inside to activate your NovaCart customer account and access express checkout.
        </p>

        <Card style={{ padding: 'var(--space-6)', textAlign: 'left' }}>
          <h2 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, marginBottom: '0.5rem' }}>
            Didn't receive the email?
          </h2>
          <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-muted)', fontSize: 'var(--text-xs)', lineHeight: 1.8, marginBottom: 'var(--space-4)' }}>
            <li>Check your spam or junk folder.</li>
            <li>Ensure you typed your email address correctly.</li>
            <li>Allow up to 2-3 minutes for server dispatch.</li>
          </ul>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link to="/login" className="btn btn-primary btn-block">
              Return to Sign In →
            </Link>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
};

export default VerifyEmailPage;
