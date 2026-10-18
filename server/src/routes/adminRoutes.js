const express = require('express');
const router = express.Router();
const {
  addProduct,
  editProduct,
  removeProduct,
  listOrders,
  setOrderStatus,
  listUsers,
  addCategory,
  editCategory
} = require('../controllers/adminController');
const { verifyToken, requireRole } = require('../middleware/auth');
const { validateProductBody } = require('../validators/productValidator');
const { validateOrderStatusUpdate } = require('../validators/orderValidator');

// Strict security: require verified authentication AND administrator role
router.use(verifyToken);
router.use(requireRole('admin'));

// Products Management
router.post('/products', validateProductBody, addProduct);
router.patch('/products/:id', editProduct);
router.delete('/products/:id', removeProduct);

// Orders Management
router.get('/orders', listOrders);
router.patch('/orders/:id/status', validateOrderStatusUpdate, setOrderStatus);

// Users Management
router.get('/users', listUsers);

// Categories Management
router.post('/categories', addCategory);
router.patch('/categories/:id', editCategory);

module.exports = router;
