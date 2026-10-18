import React from 'react';
import { cn } from '../../utils/helpers';

/**
 * Button — The design system's primary interactive element.
 *
 * Props:
 *   variant: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost'
 *   size:    'sm' | 'md' | 'lg'
 *   isLoading: boolean — shows spinner and disables interaction
 *   block:   boolean — full width
 *   as:      'button' | 'a' | any — render as different element
 */
const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  block = false,
  className = '',
  disabled = false,
  as: Tag = 'button',
  ...props
}) => {
  const classes = cn(
    'btn',
    `btn-${variant}`,
    size === 'sm' && 'btn-sm',
    size === 'lg' && 'btn-lg',
    block && 'btn-block',
    className
  );

  return (
    <Tag
      className={classes}
      disabled={isLoading || disabled}
      aria-busy={isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <span className="spinner spinner-sm" aria-hidden="true" />
          <span>Loading…</span>
        </>
      ) : (
        children
      )}
    </Tag>
  );
};

export default Button;
