
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

console.log('Script started');

function loadEnv() {
    try {
        const path = resolve('.env');
        console.log('Reading .env from:', path);
        const envContent = readFileSync(path, 'utf8');
        console.log('File content length:', envContent.length);

        const env = {};
        envContent.split(/\r?\n/).forEach(line => {
            if (!line || line.trim().startsWith('#')) return;

            const match = line.match(/^\s*([^=]+?)\s*=\s*(.*)?$/);
            if (match) {
                const key = match[1].trim();
                const value = match[2] ? match[2].trim().replace(/^['"]|['"]$/g, '') : '';
                env[key] = value;
            }
        });
        return env;
    } catch (e) {
        console.error('Error loading env:', e);
        return {};
    }
}

const env = loadEnv();
const supabaseUrl = env['VITE_SUPABASE_URL'];
const supabaseKey = env['VITE_SUPABASE_ANON_KEY'];

console.log('Configuration:');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey ? (supabaseKey.substring(0, 5) + '...') : 'Missing');

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing credentials, aborting.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    console.log('Fetching users...');
    try {
        // Just checking connection, even if table is empty or permission denied, 
        // we'll get a distinctive error compared to "network error" or "invalid URL"
        const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });

        if (error) {
            console.error('Supabase Error:', error);
        } else {
            console.log('Success! Supabase is reachable.');
        }
    } catch (err) {
        console.error('Exception:', err);
    }
}

testConnection();
