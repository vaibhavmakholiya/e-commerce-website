const rateLimit = require('express-rate-limit');

/**
 * General API Rate Limiter
 * 300 requests per 15 minutes per IP
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP address. Please try again after 15 minutes.'
  }
});

/**
 * Strict Rate Limiter for Authentication & Order Submission
 * 30 requests per 15 minutes per IP
 */
const sensitiveLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Rate limit exceeded for sensitive operation. Please try again shortly.'
  }
});

module.exports = {
  apiLimiter,
  sensitiveLimiter
};
