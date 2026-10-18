const {
  queryProducts,
  getProductById,
  getProductBySlug,
  getCategories
} = require('../services/productService');
const { sendSuccess, sendError } = require('../utils/responseHandler');

/**
 * GET /api/v1/products
 */
const getProducts = async (req, res, next) => {
  try {
    const result = await queryProducts(req.query);
    return sendSuccess(res, 'Products retrieved successfully', result);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/products/:id
 */
const getProduct = async (req, res, next) => {
  try {
    const product = await getProductById(req.params.id);
    if (!product) {
      return sendError(res, `Product with ID '${req.params.id}' not found`, null, 404);
    }
    return sendSuccess(res, 'Product details retrieved', product);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/products/slug/:slug
 */
const getProductSlug = async (req, res, next) => {
  try {
    const product = await getProductBySlug(req.params.slug);
    if (!product) {
      return sendError(res, `Product with slug '${req.params.slug}' not found`, null, 404);
    }
    return sendSuccess(res, 'Product details retrieved', product);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/categories
 */
const listCategories = async (req, res, next) => {
  try {
    const categories = await getCategories();
    return sendSuccess(res, 'Categories retrieved successfully', categories);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/categories/:slugOrId/products
 */
const getCategoryProducts = async (req, res, next) => {
  try {
    const { slugOrId } = req.params;
    const result = await queryProducts({
      ...req.query,
      category: slugOrId
    });
    return sendSuccess(res, `Products for category '${slugOrId}' retrieved`, result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProduct,
  getProductSlug,
  listCategories,
  getCategoryProducts
};
