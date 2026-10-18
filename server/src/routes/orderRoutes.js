const express = require('express');
const router = express.Router();
const {
  placeOrder,
  listMyOrders,
  getOrder
} = require('../controllers/orderController');
const { validateOrderBody } = require('../validators/orderValidator');
const { verifyToken } = require('../middleware/auth');
const { sensitiveLimiter } = require('../middleware/rateLimiter');

// All order operations require verified authentication
router.use(verifyToken);

router.post('/', sensitiveLimiter, validateOrderBody, placeOrder);
router.get('/my', listMyOrders);
router.get('/:id', getOrder);

module.exports = router;
