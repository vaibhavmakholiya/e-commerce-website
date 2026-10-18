/**
 * NovaCart Formatters & Localization Utilities
 * Standards configured for Indian E-Commerce Market (₹ INR)
 */

/**
 * Formats a numeric price into Indian Rupee (₹ INR) format
 * @param {number} amount - Amount in INR
 * @returns {string} e.g. "₹1,49,999" or "₹499"
 */
export const formatPrice = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '₹0';
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

/**
 * Calculates and formats discount percentage
 * @param {number} originalPrice
 * @param {number} salePrice
 * @returns {string} e.g. "25% OFF"
 */
export const formatDiscount = (originalPrice, salePrice) => {
  if (!originalPrice || !salePrice || salePrice >= originalPrice) {
    return '';
  }
  const discountPercent = Math.round(((originalPrice - salePrice) / originalPrice) * 100);
  return `${discountPercent}% OFF`;
};

/**
 * Formats compact numbers (e.g., review counts, views)
 * @param {number} num
 * @returns {string} e.g. "1.4k", "12k"
 */
export const formatCompactNumber = (num) => {
  if (!num || isNaN(num)) return '0';
  return new Intl.NumberFormat('en-IN', {
    notation: 'compact',
    compactDisplay: 'short'
  }).format(num);
};

/**
 * Formats ISO date string into readable Indian standard format
 * @param {string|Date} dateString
 * @returns {string} e.g. "15 Oct 2026"
 */
export const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(date);
};

/**
 * Formats 10-digit Indian mobile number
 * @param {string} phone
 * @returns {string} e.g. "+91 98765 43210"
 */
export const formatPhone = (phone) => {
  if (!phone) return '';
  const cleaned = ('' + phone).replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  return phone;
};
