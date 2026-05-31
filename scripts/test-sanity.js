
import { createClient } from '@sanity/client';
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
        return {};
    }
}

const env = loadEnv();

console.log('Testing Sanity Connection...');
const client = createClient({
    projectId: env.VITE_SANITY_PROJECT_ID,
    dataset: env.VITE_SANITY_DATASET,
    useCdn: true,
    apiVersion: '2023-05-03',
    token: '' // Public dataset doesn't need token usually
});

async function testSanity() {
    try {
        const posts = await client.fetch('*[_type == "post"][0...5]{title}');
        console.log('Posts found:', posts.length);
        console.log('Titles:', posts.map(p => p.title));

        const episodes = await client.fetch('*[_type == "episode"][0...1]{title}');
        console.log('Episodes found:', episodes.length);
    } catch (err) {
        console.error('Sanity Error:', err.message);
    }
}

testSanity();
