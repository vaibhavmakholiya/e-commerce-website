import React from 'react';
import { cn } from '../../utils/helpers';

/**
 * Spinner — Animated loading indicator.
 * size: 'sm' | 'md' | 'lg'
 */
export const Spinner = ({ size = 'md', className = '', label = 'Loading…' }) => (
  <span
    role="status"
    aria-label={label}
    className={cn(`spinner spinner-${size}`, className)}
  />
);

/**
 * PageLoader — Full-page centered loading overlay.
 */
export const PageLoader = ({ message = 'Loading…' }) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      gap: '1.25rem',
    }}
    role="status"
    aria-live="polite"
  >
    <Spinner size="lg" />
    <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>{message}</p>
  </div>
);

/**
 * Skeleton — Shimmer placeholder for loading states.
 */
export const Skeleton = ({ width = '100%', height = '16px', borderRadius = 'var(--radius-sm)', className = '' }) => (
  <div
    aria-hidden="true"
    className={cn('skeleton', className)}
    style={{ width, height, borderRadius, display: 'block' }}
  />
);

/**
 * SkeletonProductCard — Placeholder matching a ProductCard's dimensions.
 */
export const SkeletonProductCard = () => (
  <div className="card" style={{ padding: 0, overflow: 'hidden' }} aria-hidden="true">
    <Skeleton height="220px" borderRadius="0" />
    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
      <Skeleton height="12px" width="50%" />
      <Skeleton height="16px" width="80%" />
      <Skeleton height="16px" width="65%" />
      <Skeleton height="24px" width="40%" />
    </div>
  </div>
);

export default Spinner;
