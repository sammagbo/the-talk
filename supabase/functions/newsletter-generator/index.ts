// Supabase Edge Function: newsletter-generator
// Uses Gemini 1.5 Pro to draft a weekly newsletter based on recent content
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

            const { context, tone = 'engaging' } = await req.json()

            // Prompt for Newsletter
            const prompt = `You are the editor of "THE TALK", a premium fashion and lifestyle newsletter by Mijean Rochus.
    Draft a weekly newsletter based on the following context/updates:
    
    "${context || 'No specific updates, write a general engagement email about fashion trends.'}"
    
    Guidelines:
    - Tone: ${tone} (Options: professional, friendly, high-fashion, casual).
    - Structure:
      - Subject Line: Catchy, short, emoji-friendly.
      - Greeting: Warm and personal.
      - Body: Discuss the updates, add value/insight.
      - CTA: Encourage listening to the latest episode or visiting the blog.
      - Sign-off: "Best, Mijean".
    
    Output Format: JSON with "subject" and "body" (HTML or Markdown).
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
