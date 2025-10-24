import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error("Missing VITE_SUPABASE_URL environment variable. Please ensure it's set in your .env file.");
}
if (!supabaseAnonKey) {
  throw new Error("Missing VITE_SUPABASE_ANON_KEY environment variable. Please ensure it's set in your .env file.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);