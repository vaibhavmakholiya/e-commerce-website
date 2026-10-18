import React from 'react';
import Button from './Button';

/**
 * EmptyState — Displayed when a list or query returns no results.
 *
 * Props:
 *   icon:        string/emoji
 *   title:       string
 *   description: string
 *   action:      { label: string, onClick: fn }
 */
const EmptyState = ({
  icon = '📭',
  title = 'Nothing here yet',
  description = '',
  action,
}) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '4rem 2rem',
      gap: '1rem',
    }}
    role="status"
    aria-live="polite"
  >
    <span style={{ fontSize: '3rem', lineHeight: 1 }} aria-hidden="true">
      {icon}
    </span>
    <h3 style={{ fontSize: 'var(--text-xl)', color: 'var(--text-main)' }}>{title}</h3>
    {description && (
      <p style={{ color: 'var(--text-muted)', maxWidth: '380px', fontSize: 'var(--text-sm)' }}>
        {description}
      </p>
    )}
    {action && (
      <Button variant="primary" onClick={action.onClick} style={{ marginTop: '0.5rem' }}>
        {action.label}
      </Button>
    )}
  </div>
);

export default EmptyState;
