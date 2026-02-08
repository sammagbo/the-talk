// Supabase Edge Function: search-vector
// Semantic search using Gemini text-embedding-004 + pgvector
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Configuration
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
      // Handle CORS
      if (req.method === 'OPTIONS') {
            return new Response('ok', { headers: corsHeaders })
      }

      try {
            // Validate environment variables early
            if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not configured')
            if (!SUPABASE_URL) throw new Error('SUPABASE_URL not configured')
            if (!SUPABASE_SERVICE_KEY) throw new Error('SUPABASE_SERVICE_ROLE_KEY not configured')

            // Parse request body safely
            let body;
            try {
                  body = await req.json()
            } catch {
                  return new Response(
                        JSON.stringify({ error: 'Invalid JSON body' }),
                        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                  )
            }

            const { query, threshold = 0.5, count = 10 } = body

            if (!query) {
                  return new Response(
                        JSON.stringify({ error: 'Missing query parameter' }),
                        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                  )
            }

            // 1. Generate embedding for user query
            const embeddingResponse = await fetch(
                  `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${GEMINI_API_KEY}`,
                  {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                              model: 'models/text-embedding-004',
                              content: { parts: [{ text: query }] },
                        }),
                  }
            )

            if (!embeddingResponse.ok) {
                  const error = await embeddingResponse.text()
                  throw new Error(`Gemini API error: ${error}`)
            }

            const embeddingData = await embeddingResponse.json()
            const embedding = embeddingData.embedding.values

            // 2. Search using match_documents function
            const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

            const { data: results, error } = await supabase.rpc('match_documents', {
                  query_embedding: embedding,
                  match_threshold: threshold,
                  match_count: count,
            })

            if (error) throw error

            return new Response(
                  JSON.stringify({ results }),
                  { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )

      } catch (error) {
            return new Response(
                  JSON.stringify({ error: error.message }),
                  { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
      }
})
