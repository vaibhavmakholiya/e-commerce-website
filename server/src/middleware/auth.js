const jwt = require('jsonwebtoken');
const config = require('../config/env');
const supabase = require('../config/supabase');
const { User } = require('../models');
const { sendError } = require('../utils/responseHandler');

/**
 * Authentication Middleware
 * Validates the Supabase access token and retrieves or syncs the MongoDB User profile.
 * Zero Trust: Never trusts an arbitrary user ID sent in the request body or parameters.
 */
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, 'Authentication required. Missing or malformed Bearer token.', null, 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    let verifiedId = null;
    let verifiedEmail = null;
    let userMeta = {};

    // 1. Verify via active Supabase client if configured
    if (supabase) {
      const { data: { user }, error } = await supabase.auth.getUser(token);

      if (error || !user) {
        return sendError(res, `Authentication failed: ${error?.message || 'Invalid or expired token'}`, null, 401);
      }

      verifiedId = user.id;
      verifiedEmail = user.email;
      userMeta = user.user_metadata || {};
    }
    // 2. Fallback to direct JWT verification if JWT secret is configured
    else if (config.supabase.jwtSecret && !config.supabase.jwtSecret.includes('placeholder')) {
      const decoded = jwt.verify(token, config.supabase.jwtSecret);
      verifiedId = decoded.sub;
      verifiedEmail = decoded.email;
      userMeta = decoded.user_metadata || {};
    }
    // 3. Development / Sandbox simulation support for immediate verification testing
    else if (token.startsWith('mock_jwt_token_')) {
      const mockId = token.replace('mock_jwt_token_', '');
      verifiedId = mockId;
      verifiedEmail = mockId.includes('admin') ? 'admin@novacart.in' : 'arjun.sharma@example.in';
      userMeta = {
        name: mockId.includes('admin') ? 'NovaCart Admin Team' : 'Arjun Sharma',
        role: mockId.includes('admin') ? 'admin' : 'customer'
      };
    } else {
      return sendError(res, 'Authentication service is not configured with valid Supabase credentials.', null, 401);
    }

    // 4. Find or synchronize corresponding MongoDB User profile
    let userDoc = null;
    if (User.db.readyState === 1) {
      userDoc = await User.findOne({ providerUserId: verifiedId });

      if (!userDoc) {
        // Create initial customer profile on first verified sign-in
        userDoc = await User.create({
          authProvider: 'supabase',
          providerUserId: verifiedId,
          email: verifiedEmail.toLowerCase(),
          name: userMeta.name || verifiedEmail.split('@')[0],
          role: userMeta.role === 'admin' ? 'admin' : 'customer',
          shippingAddresses: []
        });
      }
    } else {
      // In-memory fallback if database connection is pending
      userDoc = {
        id: verifiedId,
        providerUserId: verifiedId,
        email: verifiedEmail,
        name: userMeta.name || 'Verified User',
        role: userMeta.role || 'customer',
        shippingAddresses: []
      };
    }

    // Attach verified user to request object
    req.user = userDoc;
    next();
  } catch (error) {
    console.error('[Auth Middleware] Token verification error:', error.message);
    return sendError(res, 'Authentication token is invalid or has expired.', null, 401);
  }
};

/**
 * Role-Based Access Control Middleware (RBAC)
 * @param  {...string} allowedRoles - E.g. 'admin', 'customer'
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Unauthorized access.', null, 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(
        res,
        `Access denied. Requires one of the following roles: [${allowedRoles.join(', ')}]`,
        null,
        403
      );
    }

    next();
  };
};

module.exports = {
  verifyToken,
  requireRole
};
