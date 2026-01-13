import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Initialize Supabase client
let supabase = null;

try {
    if (supabaseUrl && supabaseAnonKey) {
        supabase = createClient(supabaseUrl, supabaseAnonKey, {
            auth: {
                autoRefreshToken: true,
                persistSession: true,
                detectSessionInUrl: true,
            },
        });
    } else {
        console.warn('Supabase credentials not configured');
    }
} catch (error) {
    console.warn('Supabase initialization failed:', error);
}

export { supabase };
export default supabase;
