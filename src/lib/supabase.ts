import { createClient } from '@supabase/supabase-js';

const supabaseUrl_raw = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey_raw = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isValidUrl = (url: string | undefined): boolean => {
  if (!url) return false;
  try {
    new URL(url);
    return url.startsWith('http://') || url.startsWith('https://');
  } catch {
    return false;
  }
};

const supabaseUrl = isValidUrl(supabaseUrl_raw) ? supabaseUrl_raw : 'https://placeholder-project.supabase.co';
const supabaseAnonKey = supabaseAnonKey_raw && supabaseAnonKey_raw !== 'YOUR_SUPABASE_ANON_KEY' ? supabaseAnonKey_raw : 'placeholder-key';

export const isSupabaseConfigured = isValidUrl(supabaseUrl_raw) && !!supabaseAnonKey_raw && supabaseAnonKey_raw !== 'YOUR_SUPABASE_ANON_KEY';

if (!isSupabaseConfigured) {
  console.warn('Supabase URL or Anon Key is missing or invalid. Please add valid ones to your environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
