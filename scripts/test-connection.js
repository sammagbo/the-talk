
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

console.log('Testing Supabase Connection...');
console.log('URL:', supabaseUrl);
console.log('Key length:', supabaseKey ? supabaseKey.length : 0);

if (!supabaseUrl || !supabaseKey) {
      console.error('Missing URL or Key');
      process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
      try {
            const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });
            if (error) {
                  console.error('Connection failed:', error.message);
            } else {
                  console.log('Connection successful! Users count:', data);
            }
      } catch (err) {
            console.error('Unexpected error:', err.message);
      }
}

testConnection();
