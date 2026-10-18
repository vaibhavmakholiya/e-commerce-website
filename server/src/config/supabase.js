const { createClient } = require('@supabase/supabase-js');
const config = require('./env');

let supabase = null;

if (config.supabase.url && config.supabase.anonKey && !config.supabase.url.includes('placeholder')) {
  supabase = createClient(config.supabase.url, config.supabase.anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  console.log('[Auth Service] Supabase client initialized.');
} else {
  console.log('[Auth Service Note] Supabase environment variables are currently placeholders. Development mock verification mode is active.');
}

module.exports = supabase;
