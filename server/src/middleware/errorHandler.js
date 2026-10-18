const { sendError } = require('../utils/responseHandler');
const config = require('../config/env');

/**
 * Handle 404 Not Found routes
 */
const notFoundHandler = (req, res, next) => {
  const error = new Error(`Resource not found - ${req.method} ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * Centralized Global Error Handler Middleware
 * Intercepts Mongoose CastErrors, ValidationErrors, and Duplicate Key Errors
 * Ensures internal database details are never leaked in client responses
 */
const globalErrorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  let message = err.message || 'An internal server error occurred';
  let details = err.details || null;

  // 1. Mongoose Invalid ObjectId (CastError)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid resource identifier format for field '${err.path}'`;
    details = { field: err.path, reason: 'Malformed unique identifier' };
  }

  // 2. Mongoose Schema Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed for one or more fields';
    details = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message
    }));
  }

  // 3. Mongoose Duplicate Key Error (Code 11000)
  if (err.code === 11000) {
    statusCode = 409;
    const duplicatedFields = Object.keys(err.keyValue || {});
    const fieldName = duplicatedFields[0] || 'record';
    message = `A ${fieldName} with the provided value already exists in the system`;
    details = { duplicatedFields };
  }

  // 4. JWT / Authentication Errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token signature';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token has expired. Please sign in again';
  }

  // Log error on server terminal
  console.error(`[Error] ${req.method} ${req.originalUrl} -> Status ${statusCode}: ${message}`);
  if (config.nodeEnv === 'development' && err.stack) {
    console.error(err.stack);
  }

  const responseErrors = {
    details,
    ...(config.nodeEnv === 'development' && statusCode === 500 ? { stack: err.stack } : {})
  };

  sendError(res, message, responseErrors, statusCode);
};

module.exports = {
  notFoundHandler,
  globalErrorHandler
};
