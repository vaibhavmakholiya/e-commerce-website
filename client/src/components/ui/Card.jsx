import React from 'react';
import { cn } from '../../utils/helpers';

/**
 * Card — Glass-morphic surface container.
 * Variants: default (opaque), glass, interactive (hover lift)
 */
export const Card = ({ children, variant = 'default', className = '', ...props }) => {
  return (
    <div
      className={cn(
        'card',
        variant === 'glass' && 'card-glass',
        variant === 'interactive' && 'card-interactive',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '', ...props }) => (
  <div className={cn('card-header', className)} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ children, className = '', ...props }) => (
  <div className={cn('card-footer', className)} {...props}>
    {children}
  </div>
);

export default Card;
