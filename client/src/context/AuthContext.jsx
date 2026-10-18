import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  supabase,
  isSupabaseConfigured,
  signUp as supabaseSignUp,
  signIn as supabaseSignIn,
  signOut as supabaseSignOut,
  resetPassword as supabaseResetPassword,
  updatePassword as supabaseUpdatePassword
} from '../services/supabase';
import apiClient from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Default sample profile for seamless 1-click test checkout
const DEFAULT_DEMO_USER = {
  id: 'usr_demo_8821',
  name: 'Arjun Sharma',
  email: 'arjun.sharma@example.in',
  phone: '9876543210',
  role: 'customer',
  avatar: '👨🏽‍💻',
  memberSince: 'January 2025',
  addresses: [
    {
      id: 'addr_1',
      fullName: 'Arjun Sharma',
      phone: '9876543210',
      street: 'Flat 402, Green Glen Layout, Bellandur',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560103',
      isDefault: true,
      tag: 'Home'
    },
    {
      id: 'addr_2',
      fullName: 'Arjun Sharma (Office)',
      phone: '9876543210',
      street: 'EcoSpace Tech Park, 4th Floor, Outer Ring Rd',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560103',
      isDefault: false,
      tag: 'Work'
    }
  ]
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('novacart_user_v1');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  // Sync state to localStorage
  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem('novacart_user_v1', JSON.stringify(user));
      } else {
        localStorage.removeItem('novacart_user_v1');
        localStorage.removeItem('novacart_auth_token');
      }
    } catch (e) {
      console.error('Error syncing auth state to localStorage', e);
    }
  }, [user]);

  // Synchronize with backend to get the latest MongoDB user profile
  const syncWithBackend = useCallback(async (token) => {
    if (!token) return;
    try {
      localStorage.setItem('novacart_auth_token', token);
      const res = await apiClient.get('/auth/me');
      if (res?.data) {
        setUser((prev) => ({
          ...prev,
          ...res.data,
          id: res.data._id || res.data.id || prev?.id
        }));
      }
    } catch (err) {
      console.warn('[Auth] Backend sync deferred:', err.message);
    }
  }, []);

  // Listen to Supabase auth state changes if configured
  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          syncWithBackend(session.access_token);
        }
        setLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (event === 'SIGNED_IN' && session) {
            await syncWithBackend(session.access_token);
          } else if (event === 'SIGNED_OUT') {
            setUser(null);
            localStorage.removeItem('novacart_auth_token');
          }
        }
      );

      return () => {
        subscription.unsubscribe();
      };
    } else {
      setLoading(false);
    }
  }, [syncWithBackend]);

  /**
   * Log in with email and password
   */
  const login = async (email, password) => {
    const { data, error } = await supabaseSignIn(email, password);
    if (error) throw error;

    const token = data.session?.access_token || 'mock_jwt_token_usr_demo_8821';
    localStorage.setItem('novacart_auth_token', token);

    const loggedUser = {
      id: data.user.id,
      name: data.user.user_metadata?.name || email.split('@')[0],
      email: data.user.email,
      phone: '',
      role: 'customer',
      avatar: '👤',
      memberSince: 'October 2026',
      addresses: DEFAULT_DEMO_USER.addresses
    };

    setUser(loggedUser);

    // Sync to backend MongoDB profile
    try {
      await apiClient.post('/auth/sync', { name: loggedUser.name });
    } catch (e) {
      console.warn('[Auth] Non-blocking sync alert:', e.message);
    }

    return { success: true, user: loggedUser };
  };

  /**
   * 1-Click Demo Login
   */
  const loginAsDemo = () => {
    localStorage.setItem('novacart_auth_token', 'mock_jwt_token_usr_demo_8821');
    setUser(DEFAULT_DEMO_USER);
    return DEFAULT_DEMO_USER;
  };

  /**
   * Register a new user
   */
  const register = async (fullName, email, password) => {
    const { data, error } = await supabaseSignUp(email, password, fullName);
    if (error) throw error;

    const token = data.session?.access_token || 'mock_jwt_token_usr_' + Date.now();
    localStorage.setItem('novacart_auth_token', token);

    const newUser = {
      id: data.user.id,
      name: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: '',
      role: 'customer',
      avatar: '👤',
      memberSince: 'October 2026',
      addresses: []
    };

    setUser(newUser);

    try {
      await apiClient.post('/auth/sync', { name: newUser.name });
    } catch (e) {
      console.warn('[Auth] Non-blocking sync alert:', e.message);
    }

    return { success: true, user: newUser };
  };

  /**
   * Log out
   */
  const logout = async () => {
    await supabaseSignOut();
    setUser(null);
    localStorage.removeItem('novacart_auth_token');
    localStorage.removeItem('novacart_user_v1');
  };

  /**
   * Update profile
   */
  const updateProfile = async (updates) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : null));
    try {
      await apiClient.put('/auth/profile', updates);
    } catch (e) {
      console.warn('[Auth] Profile update offline sync deferred.');
    }
    return { success: true };
  };

  /**
   * Add a new shipping address
   */
  const addAddress = async (address) => {
    const newAddress = {
      ...address,
      id: 'addr_' + Date.now(),
      isDefault: user?.addresses?.length === 0 || address.isDefault
    };

    setUser((prev) => {
      if (!prev) return null;
      let existing = prev.addresses || [];
      if (newAddress.isDefault) {
        existing = existing.map((a) => ({ ...a, isDefault: false }));
      }
      return {
        ...prev,
        addresses: [...existing, newAddress]
      };
    });

    try {
      await apiClient.post('/auth/address', address);
    } catch (e) {
      console.warn('[Auth] Address sync deferred.');
    }

    return { success: true, address: newAddress };
  };

  /**
   * Delete an address
   */
  const deleteAddress = async (addressId) => {
    setUser((prev) => {
      if (!prev) return null;
      const filtered = prev.addresses.filter((a) => a.id !== addressId && a._id !== addressId);
      if (filtered.length > 0 && !filtered.some((a) => a.isDefault)) {
        filtered[0].isDefault = true;
      }
      return {
        ...prev,
        addresses: filtered
      };
    });

    try {
      await apiClient.delete(`/auth/address/${addressId}`);
    } catch (e) {
      console.warn('[Auth] Address deletion sync deferred.');
    }

    return { success: true };
  };

  /**
   * Set default address
   */
  const setDefaultAddress = async (addressId) => {
    setUser((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        addresses: prev.addresses.map((a) => ({
          ...a,
          isDefault: a.id === addressId || a._id === addressId
        }))
      };
    });

    try {
      await apiClient.patch(`/auth/address/${addressId}/default`);
    } catch (e) {
      console.warn('[Auth] Default address sync deferred.');
    }

    return { success: true };
  };

  /**
   * Delete account
   */
  const deleteAccount = async () => {
    try {
      await apiClient.delete('/auth/account');
    } catch (e) {
      console.warn('[Auth] Account deletion sync alert.');
    }
    await supabaseSignOut();
    setUser(null);
    localStorage.clear();
    return { success: true };
  };

  /**
   * Request password reset email
   */
  const requestPasswordReset = async (email) => {
    const { error } = await supabaseResetPassword(email);
    if (error) throw error;
    return {
      success: true,
      message: `If an account exists for ${email}, a password reset link has been dispatched.`
    };
  };

  /**
   * Update password (via reset link token)
   */
  const updatePassword = async (newPassword) => {
    const { error } = await supabaseUpdatePassword(newPassword);
    if (error) throw error;
    return { success: true, message: 'Password updated successfully!' };
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isSupabaseConfigured,
    login,
    loginAsDemo,
    register,
    logout,
    updateProfile,
    addAddress,
    deleteAddress,
    setDefaultAddress,
    deleteAccount,
    requestPasswordReset,
    updatePassword
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
