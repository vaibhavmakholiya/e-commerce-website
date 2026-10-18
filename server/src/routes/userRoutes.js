const express = require('express');
const router = express.Router();
const {
  getMe,
  updateMe,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress
} = require('../controllers/userController');
const { verifyToken } = require('../middleware/auth');

// All /users/me endpoints require verified authentication identity
router.use(verifyToken);

router.get('/me', getMe);
router.patch('/me', updateMe);

router.get('/me/addresses', getAddresses);
router.post('/me/addresses', addAddress);
router.patch('/me/addresses/:id', updateAddress);
router.delete('/me/addresses/:id', deleteAddress);

module.exports = router;
