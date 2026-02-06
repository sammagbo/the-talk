import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

function loadEnv() {
    try {
        const path = resolve('.env');
        const envContent = readFileSync(path, 'utf8');
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
const supabase = createClient(env['VITE_SUPABASE_URL'], env['VITE_SUPABASE_ANON_KEY']);

console.log('\n🔍 VERIFICAÇÃO DA BASE DE DADOS\n');
console.log('='.repeat(50));

async function checkTables() {
    const tables = [
        { name: 'users', label: '👤 Usuários' },
        { name: 'comments', label: '💬 Comentários' },
        { name: 'favorites', label: '❤️ Favoritos' },
        { name: 'newsletter_subscribers', label: '📧 Newsletter' },
        { name: 'playback_history', label: '🎧 Histórico' }
    ];

    for (const table of tables) {
        const { count, error } = await supabase
            .from(table.name)
            .select('*', { count: 'exact', head: true });

        if (error) {
            console.log(`${table.label}: ❌ Erro - ${error.message}`);
        } else {
            console.log(`${table.label}: ✅ ${count || 0} registros`);
        }
    }

    console.log('='.repeat(50));
    console.log('\n✅ Verificação concluída!\n');
}

checkTables();
