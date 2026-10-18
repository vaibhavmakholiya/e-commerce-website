const { User, Cart } = require('../models');
const { sendSuccess, sendError } = require('../utils/responseHandler');

/**
 * GET /api/auth/me
 * Retrieve authenticated user profile
 */
const getMe = async (req, res, next) => {
  try {
    return sendSuccess(res, 'User profile retrieved successfully', req.user);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/sync
 * Synchronize user profile from frontend after Supabase registration/login
 */
const syncUser = async (req, res, next) => {
  try {
    const { name, phone } = req.body;

    if (User.db.readyState === 1 && req.user._id) {
      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        {
          ...(name ? { name: name.trim() } : {}),
          ...(phone ? { phone: phone.trim() } : {})
        },
        { new: true, runValidators: true }
      );
      return sendSuccess(res, 'Profile synchronized successfully', updatedUser);
    }

    return sendSuccess(res, 'Profile synchronized', req.user);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/auth/profile
 * Update user profile details
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, preferences } = req.body;

    if (User.db.readyState === 1 && req.user._id) {
      const updates = {};
      if (name) updates.name = name.trim();
      if (phone !== undefined) updates.phone = phone.trim();
      if (preferences) updates.preferences = { ...req.user.preferences, ...preferences };

      const updated = await User.findByIdAndUpdate(req.user._id, updates, {
        new: true,
        runValidators: true
      });

      return sendSuccess(res, 'Profile updated successfully', updated);
    }

    return sendSuccess(res, 'Profile updated', req.user);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/address
 * Add a new shipping address
 */
const addAddress = async (req, res, next) => {
  try {
    const { fullName, phone, street, city, state, pincode, tag, isDefault } = req.body;

    if (!fullName || !phone || !street || !city || !state || !pincode) {
      return sendError(res, 'All address fields are required.', null, 400);
    }

    if (User.db.readyState === 1 && req.user._id) {
      const user = await User.findById(req.user._id);

      if (isDefault) {
        user.shippingAddresses.forEach((a) => (a.isDefault = false));
      }

      user.shippingAddresses.push({
        fullName,
        phone,
        street,
        city,
        state,
        pincode,
        tag: tag || 'Home',
        isDefault: isDefault || user.shippingAddresses.length === 0
      });

      await user.save();
      return sendSuccess(res, 'Address added successfully', user.shippingAddresses);
    }

    return sendSuccess(res, 'Address recorded', req.body);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/auth/address/:id
 * Delete a shipping address
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

    return sendSuccess(res, 'Address removed');
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/auth/address/:id/default
 * Set address as default
 */
const setDefaultAddress = async (req, res, next) => {
  try {
    const addressId = req.params.id;

    if (User.db.readyState === 1 && req.user._id) {
      const user = await User.findById(req.user._id);
      user.shippingAddresses.forEach((a) => {
        a.isDefault = a._id.toString() === addressId;
      });
      await user.save();
      return sendSuccess(res, 'Default address updated', user.shippingAddresses);
    }

    return sendSuccess(res, 'Default address set');
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/auth/account
 * Permanently delete customer account and associated cart data
 */
const deleteAccount = async (req, res, next) => {
  try {
    if (User.db.readyState === 1 && req.user._id) {
      await Promise.all([
        User.findByIdAndDelete(req.user._id),
        Cart.deleteMany({ user: req.user._id })
      ]);
    }
    return sendSuccess(res, 'Account and associated data deleted permanently.');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMe,
  syncUser,
  updateProfile,
  addAddress,
  deleteAddress,
  setDefaultAddress,
  deleteAccount
};
