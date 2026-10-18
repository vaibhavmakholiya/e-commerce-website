const express = require('express');
const router = express.Router();
const {
  getMe,
  syncUser,
  updateProfile,
  addAddress,
  deleteAddress,
  setDefaultAddress,
  deleteAccount
} = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

// All auth profile routes require verified authentication identity
router.use(verifyToken);

router.get('/me', getMe);
router.post('/sync', syncUser);
router.put('/profile', updateProfile);

// Shipping addresses sub-resource
router.post('/address', addAddress);
router.delete('/address/:id', deleteAddress);
router.patch('/address/:id/default', setDefaultAddress);

// Account deletion workflow
router.delete('/account', deleteAccount);

module.exports = router;
