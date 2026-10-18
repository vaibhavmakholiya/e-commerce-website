import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured =
  Boolean(supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('placeholder'));

/**
 * Initialize Supabase client
 */
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    })
  : null;

/**
 * Register with email and password
 */
export const signUp = async (email, password, fullName) => {
  if (!isSupabaseConfigured) {
    // Return mock response when using development placeholders
    return {
      data: {
        user: {
          id: 'usr_' + Date.now(),
          email,
          user_metadata: { name: fullName }
        },
        session: {
          access_token: 'mock_jwt_token_usr_' + Date.now()
        }
      },
      error: null
    };
  }

  return await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: fullName
      }
    }
  });
};

/**
 * Sign in with email and password
 */
export const signIn = async (email, password) => {
  if (!isSupabaseConfigured) {
    return {
      data: {
        user: {
          id: 'usr_demo_8821',
          email,
          user_metadata: { name: 'Arjun Sharma' }
        },
        session: {
          access_token: 'mock_jwt_token_usr_demo_8821'
        }
      },
      error: null
    };
  }

  return await supabase.auth.signInWithPassword({
    email,
    password
  });
};

/**
 * Sign out
 */
export const signOut = async () => {
  if (isSupabaseConfigured) {
    return await supabase.auth.signOut();
  }
  return { error: null };
};

/**
 * Send password reset email
 */
export const resetPassword = async (email) => {
  if (!isSupabaseConfigured) {
    return { data: {}, error: null };
  }

  return await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`
  });
};

/**
 * Update password (after following reset link)
 */
export const updatePassword = async (newPassword) => {
  if (!isSupabaseConfigured) {
    return { data: {}, error: null };
  }

  return await supabase.auth.updateUser({
    password: newPassword
  });
};

/**
 * Get current session
 */
export const getSession = async () => {
  if (!isSupabaseConfigured) {
    return null;
  }
  const { data } = await supabase.auth.getSession();
  return data.session;
};
