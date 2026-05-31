// Supabase Edge Function: notify-subscribers
// Triggered when a new episode is published or live event starts
// Sends email notifications to all newsletter subscribers

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NotificationPayload {
      type: 'new_episode' | 'live_event'
      title: string
      description?: string
      url?: string
      eventDate?: string
}

serve(async (req) => {
      // Handle CORS preflight
      if (req.method === 'OPTIONS') {
            return new Response('ok', { headers: corsHeaders })
      }

      try {
            // Verify secret key (webhook authentication)
            const authHeader = req.headers.get('Authorization')
            const expectedKey = Deno.env.get('WEBHOOK_SECRET')

            if (expectedKey && authHeader !== `Bearer ${expectedKey}`) {
                  return new Response(
                        JSON.stringify({ error: 'Unauthorized' }),
                        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                  )
            }

            // Parse request body
            const payload: NotificationPayload = await req.json()

            if (!payload.type || !payload.title) {
                  return new Response(
                        JSON.stringify({ error: 'Missing required fields: type, title' }),
                        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                  )
            }

            // Initialize Supabase with service role key
            const supabaseUrl = Deno.env.get('SUPABASE_URL')!
            const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
            const supabase = createClient(supabaseUrl, supabaseServiceKey)

            // Fetch all active subscribers
            const { data: subscribers, error: fetchError } = await supabase
                  .from('newsletter_subscribers')
                  .select('email, name')
                  .eq('is_active', true)

            if (fetchError) {
                  throw new Error(`Failed to fetch subscribers: ${fetchError.message}`)
            }

            if (!subscribers || subscribers.length === 0) {
                  return new Response(
                        JSON.stringify({ message: 'No active subscribers to notify', sent: 0 }),
                        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                  )
            }

            // Email provider configuration
            // Using Resend as the email provider (you can swap for SendGrid, Mailchimp, etc.)
            const resendApiKey = Deno.env.get('RESEND_API_KEY')

            if (!resendApiKey) {
                  console.warn('RESEND_API_KEY not configured, logging emails instead')
                  console.log('Would send to:', subscribers.map(s => s.email))
                  return new Response(
                        JSON.stringify({
                              message: 'Email provider not configured (dry run)',
                              subscribers: subscribers.length
                        }),
                        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                  )
            }

            // Build email content
            const subject = payload.type === 'new_episode'
                  ? `🎙️ New Episode: ${payload.title}`
                  : `🔴 LIVE NOW: ${payload.title}`

            const htmlContent = buildEmailHtml(payload)

            // Send emails via Resend
            let sentCount = 0
            const errors: string[] = []

            for (const subscriber of subscribers) {
                  try {
                        const response = await fetch('https://api.resend.com/emails', {
                              method: 'POST',
                              headers: {
                                    'Authorization': `Bearer ${resendApiKey}`,
                                    'Content-Type': 'application/json',
                              },
                              body: JSON.stringify({
                                    from: 'THE TALK <noreply@thetalk.fm>',
                                    to: [subscriber.email],
                                    subject,
                                    html: htmlContent,
                              }),
                        })

                        if (response.ok) {
                              sentCount++
                        } else {
                              const errorData = await response.json()
                              errors.push(`${subscriber.email}: ${errorData.message}`)
                        }
                  } catch (emailError) {
                        errors.push(`${subscriber.email}: ${emailError.message}`)
                  }
            }

            // Log notification event
            await supabase.from('notification_logs').insert({
                  type: payload.type,
                  title: payload.title,
                  recipients_count: subscribers.length,
                  sent_count: sentCount,
                  errors: errors.length > 0 ? errors : null,
            }).catch(() => { }) // Non-critical, don't fail if logging fails

            return new Response(
                  JSON.stringify({
                        success: true,
                        message: `Notifications sent`,
                        total_subscribers: subscribers.length,
                        sent: sentCount,
                        errors: errors.length > 0 ? errors : undefined,
                  }),
                  { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )

      } catch (error) {
            console.error('Error in notify-subscribers:', error)
            return new Response(
                  JSON.stringify({ error: error.message }),
                  { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
      }
})

function buildEmailHtml(payload: NotificationPayload): string {
      const isLive = payload.type === 'live_event'
      const accentColor = isLive ? '#FF0000' : '#007BFF'

      return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%); padding: 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold; letter-spacing: 4px;">THE TALK</h1>
              <p style="color: #6C757D; margin: 8px 0 0; font-size: 12px; letter-spacing: 2px;">PODCAST BY MIJEAN ROCHUS</p>
            </td>
          </tr>
          
          <!-- Badge -->
          <tr>
            <td style="padding: 30px 40px 0; text-align: center;">
              <span style="display: inline-block; background-color: ${accentColor}; color: white; padding: 8px 20px; border-radius: 50px; font-size: 12px; font-weight: bold; letter-spacing: 1px;">
                ${isLive ? '🔴 LIVE NOW' : '🎙️ NEW EPISODE'}
              </span>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 30px 40px;">
              <h2 style="color: #000000; margin: 0 0 16px; font-size: 24px; font-weight: bold; text-align: center;">
                ${payload.title}
              </h2>
              ${payload.description ? `
              <p style="color: #666666; margin: 0 0 24px; font-size: 16px; line-height: 1.6; text-align: center;">
                ${payload.description}
              </p>
              ` : ''}
              ${payload.eventDate ? `
              <p style="color: ${accentColor}; margin: 0 0 24px; font-size: 14px; text-align: center; font-weight: bold;">
                📅 ${payload.eventDate}
              </p>
              ` : ''}
            </td>
          </tr>
          
          <!-- CTA Button -->
          <tr>
            <td style="padding: 0 40px 40px; text-align: center;">
              <a href="${payload.url || 'https://www.thetalkfashion.com'}" 
                 style="display: inline-block; background-color: ${accentColor}; color: white; padding: 16px 40px; border-radius: 50px; text-decoration: none; font-weight: bold; font-size: 14px; letter-spacing: 1px;">
                ${isLive ? 'JOIN LIVE →' : 'LISTEN NOW →'}
              </a>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9f9f9; padding: 24px 40px; text-align: center; border-top: 1px solid #eeeeee;">
              <p style="color: #999999; margin: 0; font-size: 12px;">
                © ${new Date().getFullYear()} THE TALK Podcast. All rights reserved.
              </p>
              <p style="color: #999999; margin: 8px 0 0; font-size: 11px;">
                <a href="{{unsubscribe_url}}" style="color: #999999;">Unsubscribe</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}
