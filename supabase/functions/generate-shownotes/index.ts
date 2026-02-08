// Supabase Edge Function: generate-shownotes
// Uses Gemini 1.5 Pro to generate show notes and tags from episode transcript/description
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')

const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
      if (req.method === 'OPTIONS') {
            return new Response('ok', { headers: corsHeaders })
      }

      try {
            if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not configured')

            const { content, title } = await req.json()

            if (!content) {
                  return new Response(
                        JSON.stringify({ error: 'Missing content' }),
                        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                  )
            }

            // Call Gemini API
            const prompt = `You are an expert podcast show notes writer. 
    Analyze the following content (transcript or description) for the episode "${title || 'Podcast Episode'}".
    
    Output a JSON object with two keys:
    1. "summary": A compelling, engaging 2-paragraph summary of the episode, written in the same language as the content (likely French or Portuguese). Use bullet points for key takeaways if appropriate.
    2. "tags": An array of 5-10 relevant SEO tags/keywords.

    Content:
    ${content.substring(0, 30000)} // Limit context window just in case
    `

            const response = await fetch(
                  `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${GEMINI_API_KEY}`,
                  {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                              contents: [{ parts: [{ text: prompt }] }],
                              generationConfig: {
                                    responseMimeType: "application/json"
                              }
                        }),
                  }
            )

            if (!response.ok) {
                  const error = await response.text()
                  throw new Error(`Gemini API error: ${error}`)
            }

            const data = await response.json()
            const generatedText = data.candidates[0].content.parts[0].text
            const result = JSON.parse(generatedText)

            return new Response(
                  JSON.stringify(result),
                  { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )

      } catch (error) {
            return new Response(
                  JSON.stringify({ error: error.message }),
                  { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
      }
})
