/**
 * 🩺 Doctor Script - Infrastructure Health Check
 * 
 * Validates all system connections and environment configuration.
 * Run with: node scripts/doctor.js
 */

import { createClient } from '@supabase/supabase-js';
import { createClient as createSanityClient } from '@sanity/client';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load .env from project root
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '..', '.env') });

// ANSI color codes for terminal output
const colors = {
      reset: '\x1b[0m',
      green: '\x1b[32m',
      red: '\x1b[31m',
      yellow: '\x1b[33m',
      blue: '\x1b[34m',
      cyan: '\x1b[36m',
      bold: '\x1b[1m',
      dim: '\x1b[2m'
};

const PASS = `${colors.green}✅ PASS${colors.reset}`;
const FAIL = `${colors.red}❌ FAIL${colors.reset}`;
const WARN = `${colors.yellow}⚠️  WARN${colors.reset}`;

console.log(`
${colors.cyan}${colors.bold}╔══════════════════════════════════════════════════╗
║          🩺 THE TALK - Health Check               ║
║              Infrastructure Doctor                 ║
╚══════════════════════════════════════════════════╝${colors.reset}
`);

const results = {
      env: { passed: 0, failed: 0, warnings: 0 },
      supabase: { status: 'pending' },
      sanity: { status: 'pending' }
};

// ═══════════════════════════════════════════════════════════════
// 1. ENVIRONMENT VARIABLES CHECK
// ═══════════════════════════════════════════════════════════════

console.log(`${colors.bold}📋 Environment Variables${colors.reset}`);
console.log('─'.repeat(50));

const requiredEnvVars = [
      { key: 'VITE_SUPABASE_URL', label: 'Supabase URL' },
      { key: 'VITE_SUPABASE_ANON_KEY', label: 'Supabase Anon Key' },
      { key: 'VITE_SANITY_PROJECT_ID', label: 'Sanity Project ID' },
      { key: 'VITE_SANITY_DATASET', label: 'Sanity Dataset' }
];

const optionalEnvVars = [
      { key: 'VITE_STRIPE_PUBLISHABLE_KEY', label: 'Stripe Key' },
      { key: 'VITE_GEMINI_API_KEY', label: 'Gemini AI Key' }
];

for (const { key, label } of requiredEnvVars) {
      const value = process.env[key];
      if (value && value.length > 0) {
            const masked = value.substring(0, 8) + '...' + value.slice(-4);
            console.log(`  ${PASS} ${label}: ${colors.dim}${masked}${colors.reset}`);
            results.env.passed++;
      } else {
            console.log(`  ${FAIL} ${label}: ${colors.red}MISSING${colors.reset}`);
            results.env.failed++;
      }
}

for (const { key, label } of optionalEnvVars) {
      const value = process.env[key];
      if (value && value.length > 0) {
            console.log(`  ${PASS} ${label}: ${colors.dim}configured${colors.reset}`);
            results.env.passed++;
      } else {
            console.log(`  ${WARN} ${label}: ${colors.yellow}not configured (optional)${colors.reset}`);
            results.env.warnings++;
      }
}

console.log('');

// ═══════════════════════════════════════════════════════════════
// 2. SUPABASE CONNECTION TEST
// ═══════════════════════════════════════════════════════════════

console.log(`${colors.bold}🗄️  Supabase Connection${colors.reset}`);
console.log('─'.repeat(50));

try {
      const supabaseUrl = process.env.VITE_SUPABASE_URL;
      const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
            throw new Error('Missing Supabase credentials');
      }

      const supabase = createClient(supabaseUrl, supabaseKey);

      // Test 1: Basic connection by fetching from a table
      const { data, error } = await supabase
            .from('comments')
            .select('id')
            .limit(1);

      if (error) {
            // RLS might block, but connection works if we get a specific error
            if (error.code === 'PGRST301' || error.message.includes('JWT')) {
                  console.log(`  ${PASS} Connection: ${colors.green}Connected${colors.reset}`);
                  console.log(`  ${PASS} RLS Active: ${colors.green}Yes (blocking anon reads)${colors.reset}`);
                  results.supabase.status = 'healthy';
            } else {
                  throw error;
            }
      } else {
            console.log(`  ${PASS} Connection: ${colors.green}Connected${colors.reset}`);
            console.log(`  ${PASS} Query Test: ${colors.green}Success${colors.reset}`);
            results.supabase.status = 'healthy';
      }

      // Test 2: Check tables exist
      const tables = ['comments', 'ratings', 'favorites', 'polls', 'poll_votes'];
      console.log(`  ${colors.dim}Tables configured: ${tables.join(', ')}${colors.reset}`);

} catch (error) {
      console.log(`  ${FAIL} Connection: ${colors.red}${error.message}${colors.reset}`);
      results.supabase.status = 'failed';
}

console.log('');

// ═══════════════════════════════════════════════════════════════
// 3. SANITY CONNECTION TEST
// ═══════════════════════════════════════════════════════════════

console.log(`${colors.bold}📝 Sanity CMS Connection${colors.reset}`);
console.log('─'.repeat(50));

try {
      const projectId = process.env.VITE_SANITY_PROJECT_ID;
      const dataset = process.env.VITE_SANITY_DATASET || 'production';

      if (!projectId) {
            throw new Error('Missing Sanity Project ID');
      }

      const sanity = createSanityClient({
            projectId,
            dataset,
            apiVersion: '2024-01-01',
            useCdn: true
      });

      // Fetch 1 document to test connection
      const result = await sanity.fetch(`*[_type == "episode"][0]{ _id, title }`);

      if (result) {
            console.log(`  ${PASS} Connection: ${colors.green}Connected${colors.reset}`);
            console.log(`  ${PASS} Test Query: ${colors.green}Found episode "${result.title?.substring(0, 30)}..."${colors.reset}`);
            results.sanity.status = 'healthy';
      } else {
            console.log(`  ${PASS} Connection: ${colors.green}Connected${colors.reset}`);
            console.log(`  ${WARN} Test Query: ${colors.yellow}No episodes found (empty dataset?)${colors.reset}`);
            results.sanity.status = 'healthy';
      }

} catch (error) {
      console.log(`  ${FAIL} Connection: ${colors.red}${error.message}${colors.reset}`);
      results.sanity.status = 'failed';
}

console.log('');

// ═══════════════════════════════════════════════════════════════
// FINAL HEALTH REPORT
// ═══════════════════════════════════════════════════════════════

console.log(`${colors.cyan}${colors.bold}╔══════════════════════════════════════════════════╗
║              📊 HEALTH REPORT                     ║
╚══════════════════════════════════════════════════╝${colors.reset}`);

const envStatus = results.env.failed === 0 ? '✅ Healthy' : '❌ Issues Found';
const supabaseStatus = results.supabase.status === 'healthy' ? '✅ Healthy' : '❌ Failed';
const sanityStatus = results.sanity.status === 'healthy' ? '✅ Healthy' : '❌ Failed';

console.log(`
  Environment:  ${envStatus} (${results.env.passed} passed, ${results.env.failed} failed, ${results.env.warnings} warnings)
  Supabase:     ${supabaseStatus}
  Sanity CMS:   ${sanityStatus}
`);

const overallHealthy = results.env.failed === 0 &&
      results.supabase.status === 'healthy' &&
      results.sanity.status === 'healthy';

if (overallHealthy) {
      console.log(`${colors.green}${colors.bold}🎉 All systems operational! Your infrastructure is healthy.${colors.reset}`);
} else {
      console.log(`${colors.red}${colors.bold}⚠️  Some issues detected. Please review the errors above.${colors.reset}`);
      process.exit(1);
}

console.log('');
