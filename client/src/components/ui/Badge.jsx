import React from 'react';
import { cn } from '../../utils/helpers';

/**
 * Badge — Status and label indicator.
 * variant: 'success' | 'warning' | 'danger' | 'info' | 'default'
 * pill:    boolean — fully rounded
 */
const Badge = ({ children, variant = 'default', pill = true, className = '', ...props }) => {
  return (
    <span
      className={cn(
        'badge',
        pill && 'badge-pill',
        `badge-${variant}`,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
