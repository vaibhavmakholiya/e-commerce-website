const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProduct,
  getProductSlug
} = require('../controllers/productController');
const { validateProductQuery } = require('../validators/productValidator');

router.get('/', validateProductQuery, getProducts);
router.get('/slug/:slug', getProductSlug);
router.get('/:id', getProduct);

module.exports = router;
