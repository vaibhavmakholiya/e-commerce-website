import React from 'react';
import MainLayout from '../layouts/MainLayout';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';

const NotFoundPage = () => (
  <MainLayout>
    <section
      style={{ padding: 'var(--space-16) 0', textAlign: 'center' }}
      aria-labelledby="notfound-heading"
    >
      <div className="container">
        <p style={{ fontSize: '5rem', marginBottom: '1rem' }} aria-hidden="true">🔍</p>
        <Badge variant="danger" style={{ marginBottom: '1rem' }}>404 Not Found</Badge>
        <h1
          id="notfound-heading"
          style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', marginBottom: '1rem' }}
        >
          Page Not Found
        </h1>
        <p style={{ color: 'var(--text-muted)', maxWidth: '440px', margin: '0 auto var(--space-8)' }}>
          We couldn't find the page you're looking for. It may have been moved, deleted, or the URL might be incorrect.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button variant="primary" onClick={() => window.history.back()}>← Go Back</Button>
          <Button variant="secondary" as="a" href="/">Go to Homepage</Button>
        </div>
      </div>
    </section>
  </MainLayout>
);

export default NotFoundPage;
