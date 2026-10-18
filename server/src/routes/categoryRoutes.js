const express = require('express');
const router = express.Router();
const {
  listCategories,
  getCategoryProducts
} = require('../controllers/productController');
const { validateProductQuery } = require('../validators/productValidator');

router.get('/', listCategories);
router.get('/:slugOrId/products', validateProductQuery, getCategoryProducts);

module.exports = router;
