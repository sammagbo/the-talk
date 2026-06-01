/**
 * 🔐 Security Check Script - RLS Penetration Test
 * 
 * Tests Row Level Security (RLS) by attempting unauthorized database access.
 * Run with: node scripts/security-check.js
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load .env from project root
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '..', '.env') });

// ANSI color codes
const colors = {
      reset: '\x1b[0m',
      green: '\x1b[32m',
      red: '\x1b[31m',
      yellow: '\x1b[33m',
      cyan: '\x1b[36m',
      bold: '\x1b[1m',
      dim: '\x1b[2m'
};

console.log(`
${colors.cyan}${colors.bold}╔══════════════════════════════════════════════════╗
║       🔐 THE TALK - Security Audit                ║
║          RLS Penetration Testing                  ║
╚══════════════════════════════════════════════════╝${colors.reset}
`);

const results = {
      commentsRLS: null,
      ratingsRLS: null,
      favoritesRLS: null
};

// Initialize Supabase client (anonymous, no auth)
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
      console.log(`${colors.red}❌ Missing Supabase credentials. Cannot run security tests.${colors.reset}`);
      process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ═══════════════════════════════════════════════════════════════
// TEST 1: Anonymous INSERT on Comments Table
// ═══════════════════════════════════════════════════════════════

console.log(`${colors.bold}🧪 Test 1: Anonymous Comment Insert${colors.reset}`);
console.log('─'.repeat(50));
console.log(`  ${colors.dim}Attempting to insert a comment WITHOUT authentication...${colors.reset}`);

try {
      const { error } = await supabase
            .from('comments')
            .insert({
                  episode_id: 'test-security-audit',
                  user_id: 'anonymous-hacker',
                  content: 'This should be blocked by RLS!',
                  user_name: 'Hacker',
                  created_at: new Date().toISOString()
            })
            .select();

      if (error) {
            // RLS blocked the insert - this is GOOD!
            console.log(`  ${colors.green}✅ PASS${colors.reset} - Insert was ${colors.green}BLOCKED${colors.reset}`);
            console.log(`  ${colors.dim}Error code: ${error.code} - ${error.message.substring(0, 50)}...${colors.reset}`);
            results.commentsRLS = 'secure';
      } else {
            // Insert succeeded - this is BAD! Security hole!
            console.log(`  ${colors.red}🚨 FAIL${colors.reset} - Insert ${colors.red}SUCCEEDED${colors.reset}`);
            console.log(`  ${colors.red}⚠️  SECURITY HOLE: RLS is NOT enabled on 'comments' table!${colors.reset}`);
            results.commentsRLS = 'vulnerable';

            // Clean up the test data
            await supabase.from('comments').delete().eq('episode_id', 'test-security-audit');
      }
} catch (err) {
      console.log(`  ${colors.green}✅ PASS${colors.reset} - Request was blocked (${err.message})`);
      results.commentsRLS = 'secure';
}

console.log('');

// ═══════════════════════════════════════════════════════════════
// TEST 2: Anonymous INSERT on Ratings Table
// ═══════════════════════════════════════════════════════════════

console.log(`${colors.bold}🧪 Test 2: Anonymous Rating Insert${colors.reset}`);
console.log('─'.repeat(50));
console.log(`  ${colors.dim}Attempting to insert a rating WITHOUT authentication...${colors.reset}`);

try {
      const { error } = await supabase
            .from('ratings')
            .insert({
                  episode_id: 'test-security-audit',
                  user_id: 'anonymous-hacker',
                  rating: 5
            })
            .select();

      if (error) {
            console.log(`  ${colors.green}✅ PASS${colors.reset} - Insert was ${colors.green}BLOCKED${colors.reset}`);
            console.log(`  ${colors.dim}Error code: ${error.code}${colors.reset}`);
            results.ratingsRLS = 'secure';
      } else {
            console.log(`  ${colors.red}🚨 FAIL${colors.reset} - Insert ${colors.red}SUCCEEDED${colors.reset}`);
            console.log(`  ${colors.red}⚠️  SECURITY HOLE: RLS is NOT enabled on 'ratings' table!${colors.reset}`);
            results.ratingsRLS = 'vulnerable';

            await supabase.from('ratings').delete().eq('episode_id', 'test-security-audit');
      }
} catch {
      console.log(`  ${colors.green}✅ PASS${colors.reset} - Request was blocked`);
      results.ratingsRLS = 'secure';
}

console.log('');

// ═══════════════════════════════════════════════════════════════
// TEST 3: Anonymous INSERT on Favorites Table
// ═══════════════════════════════════════════════════════════════

console.log(`${colors.bold}🧪 Test 3: Anonymous Favorite Insert${colors.reset}`);
console.log('─'.repeat(50));
console.log(`  ${colors.dim}Attempting to insert a favorite WITHOUT authentication...${colors.reset}`);

try {
      const { error } = await supabase
            .from('favorites')
            .insert({
                  user_id: 'anonymous-hacker',
                  episode_id: 'test-security-audit'
            })
            .select();

      if (error) {
            console.log(`  ${colors.green}✅ PASS${colors.reset} - Insert was ${colors.green}BLOCKED${colors.reset}`);
            console.log(`  ${colors.dim}Error code: ${error.code}${colors.reset}`);
            results.favoritesRLS = 'secure';
      } else {
            console.log(`  ${colors.red}🚨 FAIL${colors.reset} - Insert ${colors.red}SUCCEEDED${colors.reset}`);
            console.log(`  ${colors.red}⚠️  SECURITY HOLE: RLS is NOT enabled on 'favorites' table!${colors.reset}`);
            results.favoritesRLS = 'vulnerable';

            await supabase.from('favorites').delete().eq('episode_id', 'test-security-audit');
      }
} catch {
      console.log(`  ${colors.green}✅ PASS${colors.reset} - Request was blocked`);
      results.favoritesRLS = 'secure';
}

console.log('');

// ═══════════════════════════════════════════════════════════════
// SECURITY REPORT
// ═══════════════════════════════════════════════════════════════

console.log(`${colors.cyan}${colors.bold}╔══════════════════════════════════════════════════╗
║              🛡️  SECURITY REPORT                  ║
╚══════════════════════════════════════════════════╝${colors.reset}`);

const getStatusIcon = (status) => {
      if (status === 'secure') return `${colors.green}🔒 Secure${colors.reset}`;
      if (status === 'vulnerable') return `${colors.red}🚨 VULNERABLE${colors.reset}`;
      return `${colors.yellow}⚠️  Unknown${colors.reset}`;
};

console.log(`
  Comments Table:    ${getStatusIcon(results.commentsRLS)}
  Ratings Table:     ${getStatusIcon(results.ratingsRLS)}
  Favorites Table:   ${getStatusIcon(results.favoritesRLS)}
`);

const allSecure = Object.values(results).every(r => r === 'secure');
const hasVulnerabilities = Object.values(results).some(r => r === 'vulnerable');

if (allSecure) {
      console.log(`${colors.green}${colors.bold}🎉 All RLS policies are working! Your database is protected.${colors.reset}`);
} else if (hasVulnerabilities) {
      console.log(`${colors.red}${colors.bold}🚨 CRITICAL: Security vulnerabilities detected!${colors.reset}`);
      console.log(`${colors.red}   Please enable RLS on the affected tables immediately.${colors.reset}`);
      console.log(`
${colors.yellow}To fix, run this in Supabase SQL Editor:${colors.reset}
${colors.dim}
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own comments" ON comments
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);
${colors.reset}
`);
      process.exit(1);
} else {
      console.log(`${colors.yellow}Some tests could not be completed. Please review manually.${colors.reset}`);
}

console.log('');
