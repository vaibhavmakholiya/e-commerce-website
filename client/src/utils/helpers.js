/**
 * NovaCart — General-purpose utility functions
 */

/**
 * Combine class names conditionally (similar to clsx)
 * Usage: cn('base-class', condition && 'extra-class')
 */
export const cn = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

/**
 * Truncate a string to max length and add ellipsis
 */
export const truncate = (str, maxLength = 80) => {
  if (!str) return '';
  return str.length > maxLength ? str.slice(0, maxLength).trimEnd() + '…' : str;
};

/**
 * Generate a slug from text (for URL-safe identifiers)
 * e.g. "Samsung Galaxy S25" → "samsung-galaxy-s25"
 */
export const slugify = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Generate a unique order number string
 * e.g. "NC-20261015-4829"
 */
export const generateOrderNumber = () => {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `NC-${dateStr}-${rand}`;
};

/**
 * Check if a product is discounted
 */
export const isDiscounted = (price, salePrice) => {
  return salePrice && salePrice > 0 && salePrice < price;
};

/**
 * Scroll smoothly to a DOM element by id
 */
export const scrollToId = (id) => {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

/**
 * Get order status color badge class
 */
export const getOrderStatusBadge = (status) => {
  const map = {
    Pending: 'badge-warning',
    Processing: 'badge-info',
    Shipped: 'badge-info',
    Delivered: 'badge-success',
    Cancelled: 'badge-danger',
  };
  return map[status] || 'badge-default';
};
