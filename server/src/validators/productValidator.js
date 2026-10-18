/**
 * Product Request Validators
 */

const validateProductBody = (req, res, next) => {
  const { name, price, description, SKU, category } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push({ field: 'name', message: 'Product name must be at least 2 characters long' });
  }

  if (price === undefined || typeof price !== 'number' || price < 0) {
    errors.push({ field: 'price', message: 'Product price must be a positive number' });
  }

  if (!description || typeof description !== 'string' || description.trim().length < 10) {
    errors.push({ field: 'description', message: 'Product description must be at least 10 characters long' });
  }

  if (!SKU || typeof SKU !== 'string' || SKU.trim().length < 3) {
    errors.push({ field: 'SKU', message: 'Valid SKU code is required' });
  }

  if (!category) {
    errors.push({ field: 'category', message: 'Product category is required' });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed for product payload',
      errors: { details: errors }
    });
  }

  next();
};

const validateProductQuery = (req, res, next) => {
  const { page, limit, minPrice, maxPrice, rating } = req.query;

  if (page && (isNaN(Number(page)) || Number(page) < 1)) {
    req.query.page = 1;
  }
  if (limit && (isNaN(Number(limit)) || Number(limit) < 1 || Number(limit) > 100)) {
    req.query.limit = 12;
  }
  if (minPrice && isNaN(Number(minPrice))) {
    req.query.minPrice = 0;
  }
  if (maxPrice && isNaN(Number(maxPrice))) {
    delete req.query.maxPrice;
  }
  if (rating && (isNaN(Number(rating)) || Number(rating) < 0 || Number(rating) > 5)) {
    delete req.query.rating;
  }

  next();
};

module.exports = {
  validateProductBody,
  validateProductQuery
};
