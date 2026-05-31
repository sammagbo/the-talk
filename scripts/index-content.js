#!/usr/bin/env node
/**
 * Content Indexing Script for Semantic Search
 * Fetches content from Sanity and generates Gemini embeddings
 * Stores vectors in Supabase search_index table
 * 
 * Usage: node scripts/index-content.js
 */

import { createClient } from '@sanity/client';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Configuration
const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY;
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const SANITY_PROJECT_ID = process.env.VITE_SANITY_PROJECT_ID;
const SANITY_DATASET = process.env.VITE_SANITY_DATASET || 'production';

// Validate environment
if (!GEMINI_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_KEY || !SANITY_PROJECT_ID) {
      console.error('❌ Missing required environment variables:');
      console.error('   VITE_GEMINI_API_KEY, VITE_SUPABASE_URL, VITE_SANITY_PROJECT_ID');
      console.error('   (SUPABASE_SERVICE_ROLE_KEY or VITE_SUPABASE_ANON_KEY required)');
      process.exit(1);
}

// Initialize clients
const sanity = createClient({
      projectId: SANITY_PROJECT_ID,
      dataset: SANITY_DATASET,
      apiVersion: '2024-01-01',
      useCdn: false,
});

const supabase = createSupabaseClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

/**
 * Generate embedding using Gemini text-embedding-004
 */
async function generateEmbedding(text) {
      const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${GEMINI_API_KEY}`,
            {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                        model: 'models/gemini-embedding-001',
                        content: { parts: [{ text }] },
                  }),
            }
      );

      if (!response.ok) {
            const error = await response.text();
            throw new Error(`Gemini API error: ${error}`);
      }

      const data = await response.json();
      return data.embedding.values;
}

/**
 * Upsert content to search_index
 */
async function upsertSearchIndex(contentType, contentId, title, content, metadata = {}) {
      console.log(`  📝 Indexing: ${title.substring(0, 50)}...`);

      try {
            // Generate embedding
            const textToEmbed = `${title}. ${content}`.substring(0, 8000); // Gemini limit
            const embedding = await generateEmbedding(textToEmbed);

            // 7. Store in Supabase
            // Use RPC text_search or direct insert depending on key? 
            // We'll use the new 'upsert_document' RPC which is SECURITY DEFINER (allowing Anon key to write)

            const { error: upsertError } = await supabase.rpc('upsert_document', {
                  p_content_type: contentType,
                  p_content_id: contentId,
                  p_title: title,
                  p_content: content?.substring(0, 2000), // Store truncated content for display
                  p_embedding: embedding,
                  p_metadata: metadata
            });

            if (upsertError) {
                  // Fallback to direct insert if RPC fails (e.g. if user hasn't run migration)
                  console.warn(`⚠️ RPC failed, trying direct insert... (${upsertError.message})`);
                  const { error: directError } = await supabase.from('search_index').upsert({
                        content_type: contentType,
                        content_id: contentId,
                        title: title,
                        content: content?.substring(0, 2000), // Store truncated content for display
                        embedding: embedding,
                        metadata: metadata,
                        updated_at: new Date().toISOString(),
                  }, {
                        onConflict: 'content_id',
                  });

                  if (directError) {
                        console.error(`  ❌ Failed to store "${title}":`, directError.message);
                        return false;
                  }
            }

            console.log(`  ✅ Indexed successfully`);
            return true;
      } catch (err) {
            console.error(`  ❌ Error: ${err.message}`);
            return false;
      }
}

/**
 * Index all episodes from Sanity
 */
async function indexEpisodes() {
      console.log('\n🎧 Fetching episodes from Sanity...');

      const episodes = await sanity.fetch(`
    *[_type == "episode"] {
      _id,
      title,
      description,
      "slug": slug.current,
      "category": category->title,
      date
    }
  `);

      console.log(`   Found ${episodes.length} episodes`);

      let indexed = 0;
      for (const episode of episodes) {
            const success = await upsertSearchIndex(
                  'episode',
                  episode._id,
                  episode.title || 'Untitled Episode',
                  episode.description || '',
                  {
                        slug: episode.slug,
                        category: episode.category,
                        date: episode.date,
                  }
            );
            if (success) indexed++;

            // Rate limiting (Gemini free tier)
            await new Promise(r => setTimeout(r, 500));
      }

      return indexed;
}

/**
 * Index all blog posts from Sanity
 */
async function indexPosts() {
      console.log('\n📰 Fetching blog posts from Sanity...');

      const posts = await sanity.fetch(`
    *[_type == "post"] {
      _id,
      title,
      excerpt,
      "slug": slug.current,
      publishedAt
    }
  `);

      console.log(`   Found ${posts.length} posts`);

      let indexed = 0;
      for (const post of posts) {
            const success = await upsertSearchIndex(
                  'post',
                  post._id,
                  post.title || 'Untitled Post',
                  post.excerpt || '',
                  {
                        slug: post.slug,
                        publishedAt: post.publishedAt,
                  }
            );
            if (success) indexed++;

            // Rate limiting
            await new Promise(r => setTimeout(r, 500));
      }

      return indexed;
}

/**
 * Main execution
 */
async function main() {
      console.log('🚀 Starting content indexing for semantic search...\n');
      console.log('Configuration:');
      console.log(`   Supabase: ${SUPABASE_URL}`);
      console.log(`   Sanity: ${SANITY_PROJECT_ID}/${SANITY_DATASET}`);

      const episodesIndexed = await indexEpisodes();
      const postsIndexed = await indexPosts();

      console.log('\n' + '='.repeat(50));
      console.log('📊 Indexing Complete!');
      console.log(`   Episodes indexed: ${episodesIndexed}`);
      console.log(`   Posts indexed: ${postsIndexed}`);
      console.log(`   Total: ${episodesIndexed + postsIndexed}`);
      console.log('='.repeat(50));
}

main().catch(console.error);
