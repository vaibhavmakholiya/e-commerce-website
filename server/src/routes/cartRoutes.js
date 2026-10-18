const express = require('express');
const router = express.Router();
const {
  fetchCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  emptyCart
} = require('../controllers/cartController');
const {
  validateCartItemBody,
  validateCartQuantityPatch
} = require('../validators/cartValidator');
const { verifyToken } = require('../middleware/auth');

// Optional auth: if header present, verify and attach user; otherwise allow guest cart
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return verifyToken(req, res, next);
  }
  next();
};

router.use(optionalAuth);

router.get('/', fetchCart);
router.post('/items', validateCartItemBody, addCartItem);
router.patch('/items/:itemId', validateCartQuantityPatch, updateCartItem);
router.delete('/items/:itemId', removeCartItem);
router.delete('/', emptyCart);

module.exports = router;
