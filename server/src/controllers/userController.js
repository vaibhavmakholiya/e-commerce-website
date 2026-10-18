const { User } = require('../models');
const { sendSuccess, sendError } = require('../utils/responseHandler');

/**
 * GET /api/v1/users/me & /api/v1/auth/me
 */
const getMe = async (req, res) => {
  return sendSuccess(res, 'Profile retrieved successfully', req.user);
};

/**
 * PATCH /api/v1/users/me
 */
const updateMe = async (req, res, next) => {
  try {
    const { name, phone, preferences } = req.body;
    const updates = {};
    if (name) updates.name = name.trim();
    if (phone !== undefined) updates.phone = phone.trim();
    if (preferences) updates.preferences = { ...req.user.preferences, ...preferences };

    if (User.db.readyState === 1 && req.user._id) {
      const updated = await User.findByIdAndUpdate(req.user._id, updates, {
        new: true,
        runValidators: true
      });
      return sendSuccess(res, 'Profile updated successfully', updated);
    }

    req.user = { ...req.user, ...updates };
    return sendSuccess(res, 'Profile updated successfully', req.user);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/users/me/addresses
 */
const getAddresses = async (req, res) => {
  return sendSuccess(res, 'Shipping addresses retrieved', req.user.shippingAddresses || []);
};

/**
 * POST /api/v1/users/me/addresses
 */
const addAddress = async (req, res, next) => {
  try {
    const { fullName, phone, street, city, state, pincode, tag, isDefault } = req.body;

    if (!fullName || !phone || !street || !city || !state || !pincode) {
      return sendError(res, 'All address fields are required', null, 400);
    }

    const newAddr = {
      fullName: fullName.trim(),
      phone: phone.trim(),
      street: street.trim(),
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
      tag: tag || 'Home',
      isDefault: Boolean(isDefault)
    };

    if (User.db.readyState === 1 && req.user._id) {
      const user = await User.findById(req.user._id);
      if (newAddr.isDefault) {
        user.shippingAddresses.forEach((a) => (a.isDefault = false));
      }
      user.shippingAddresses.push({
        ...newAddr,
        isDefault: newAddr.isDefault || user.shippingAddresses.length === 0
      });
      await user.save();
      return sendSuccess(res, 'Address added successfully', user.shippingAddresses, 201);
    }

    // Memory fallback
    if (!req.user.shippingAddresses) req.user.shippingAddresses = [];
    const created = { ...newAddr, _id: 'addr_' + Date.now(), id: 'addr_' + Date.now() };
    req.user.shippingAddresses.push(created);
    return sendSuccess(res, 'Address added successfully', req.user.shippingAddresses, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/users/me/addresses/:id
 */
const updateAddress = async (req, res, next) => {
  try {
    const addressId = req.params.id;
    const updates = req.body;

    if (User.db.readyState === 1 && req.user._id) {
      const user = await User.findById(req.user._id);
      const addr = user.shippingAddresses.id(addressId);
      if (!addr) {
        return sendError(res, 'Address not found', null, 404);
      }

      if (updates.isDefault) {
        user.shippingAddresses.forEach((a) => (a.isDefault = false));
      }

      Object.assign(addr, updates);
      await user.save();
      return sendSuccess(res, 'Address updated successfully', user.shippingAddresses);
    }

    return sendSuccess(res, 'Address updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/users/me/addresses/:id
 */
const deleteAddress = async (req, res, next) => {
  try {
    const addressId = req.params.id;

    if (User.db.readyState === 1 && req.user._id) {
      const user = await User.findById(req.user._id);
      user.shippingAddresses = user.shippingAddresses.filter((a) => a._id.toString() !== addressId);
      await user.save();
      return sendSuccess(res, 'Address deleted successfully', user.shippingAddresses);
    }

    if (req.user.shippingAddresses) {
      req.user.shippingAddresses = req.user.shippingAddresses.filter(
        (a) => a._id !== addressId && a.id !== addressId
      );
    }
    return sendSuccess(res, 'Address deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMe,
  updateMe,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress
};
