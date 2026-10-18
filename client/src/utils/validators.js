/**
 * NovaCart Client-Side Form Validators
 * All validators return { isValid: boolean, message: string }
 */

/**
 * Validate full name (minimum 2 characters, letters/spaces only)
 */
export const validateName = (name) => {
  if (!name || name.trim().length < 2) {
    return { isValid: false, message: 'Full name must be at least 2 characters.' };
  }
  if (/[^a-zA-Z\s]/.test(name.trim())) {
    return { isValid: false, message: 'Name can only contain letters and spaces.' };
  }
  return { isValid: true, message: '' };
};

/**
 * Validate email address
 */
export const validateEmail = (email) => {
  if (!email || !email.trim()) {
    return { isValid: false, message: 'Email address is required.' };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return { isValid: false, message: 'Please enter a valid email address.' };
  }
  return { isValid: true, message: '' };
};

/**
 * Validate password (minimum 8 chars, 1 uppercase, 1 digit)
 */
export const validatePassword = (password) => {
  if (!password) {
    return { isValid: false, message: 'Password is required.' };
  }
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters.' };
  }
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter.' };
  }
  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number.' };
  }
  return { isValid: true, message: '' };
};

/**
 * Validate that passwords match
 */
export const validatePasswordConfirm = (password, confirmPassword) => {
  if (!confirmPassword) {
    return { isValid: false, message: 'Please confirm your password.' };
  }
  if (password !== confirmPassword) {
    return { isValid: false, message: 'Passwords do not match.' };
  }
  return { isValid: true, message: '' };
};

/**
 * Validate Indian phone number (10 digits)
 */
export const validatePhone = (phone) => {
  if (!phone) {
    return { isValid: false, message: 'Phone number is required.' };
  }
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length !== 10) {
    return { isValid: false, message: 'Enter a valid 10-digit Indian mobile number.' };
  }
  if (!/^[6-9]\d{9}$/.test(cleaned)) {
    return { isValid: false, message: 'Enter a valid Indian mobile number starting with 6-9.' };
  }
  return { isValid: true, message: '' };
};

/**
 * Validate Indian PIN code (6 digits, valid prefix)
 */
export const validatePincode = (pin) => {
  if (!pin) {
    return { isValid: false, message: 'PIN code is required.' };
  }
  const cleaned = pin.replace(/\D/g, '');
  if (cleaned.length !== 6) {
    return { isValid: false, message: 'Enter a valid 6-digit PIN code.' };
  }
  if (!/^[1-9]\d{5}$/.test(cleaned)) {
    return { isValid: false, message: 'Enter a valid PIN code.' };
  }
  return { isValid: true, message: '' };
};

/**
 * Validate required text field
 */
export const validateRequired = (value, fieldName = 'This field') => {
  if (!value || value.toString().trim().length === 0) {
    return { isValid: false, message: `${fieldName} is required.` };
  }
  return { isValid: true, message: '' };
};

/**
 * Validate price (positive number)
 */
export const validatePrice = (price) => {
  const num = parseFloat(price);
  if (isNaN(num) || num <= 0) {
    return { isValid: false, message: 'Price must be a positive number.' };
  }
  return { isValid: true, message: '' };
};

/**
 * Validate stock quantity (non-negative integer)
 */
export const validateStock = (stock) => {
  const num = parseInt(stock, 10);
  if (isNaN(num) || num < 0) {
    return { isValid: false, message: 'Stock quantity must be 0 or greater.' };
  }
  return { isValid: true, message: '' };
};

/**
 * Simple debounce helper for search inputs
 */
export const debounce = (fn, delay = 400) => {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
};
