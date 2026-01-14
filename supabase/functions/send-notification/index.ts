/**
 * Supabase Edge Function: Send Push Notification
 * 
 * Usage:
 *   POST /functions/v1/send-notification
 *   Body: { title: string, body: string, url?: string, userId?: string }
 * 
 * To deploy:
 *   supabase functions deploy send-notification
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS headers for browser requests
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Send Web Push notification using the Web Push protocol
 * Note: This is a simplified implementation. For production, use a proper web-push library.
 */
async function sendWebPush(subscription: any, payload: any, vapidPrivateKey: string, vapidPublicKey: string) {
    const { endpoint, p256dh, auth } = subscription;

    // For a complete implementation, you would use the web-push protocol
    // with ECDH key agreement and AES-GCM encryption.
    // 
    // For now, we'll use a third-party push service or you can integrate with:
    // - Firebase Cloud Messaging (FCM) for web push
    // - OneSignal
    // - Pusher

    console.log('Would send push to:', endpoint);
    console.log('Payload:', payload);

    // Return mock success for development
    return { success: true, endpoint };
}

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { title, body, url, userId } = await req.json();

        if (!title || !body) {
            return new Response(
                JSON.stringify({ error: 'Title and body are required' }),
                {
                    status: 400,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                }
            );
        }

        // Initialize Supabase client with service role key
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');
        const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY');

        const supabase = createClient(supabaseUrl, supabaseKey);

        // Get subscriptions
        let query = supabase.from('push_subscriptions').select('*');

        // If userId specified, only send to that user
        if (userId) {
            query = query.eq('user_id', userId);
        }

        const { data: subscriptions, error: fetchError } = await query;

        if (fetchError) {
            console.error('Error fetching subscriptions:', fetchError);
            return new Response(
                JSON.stringify({ error: 'Failed to fetch subscriptions' }),
                {
                    status: 500,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                }
            );
        }

        if (!subscriptions || subscriptions.length === 0) {
            return new Response(
                JSON.stringify({
                    success: true,
                    sent: 0,
                    message: 'No subscriptions found'
                }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Prepare notification payload
        const payload = JSON.stringify({ title, body, url: url || '/' });

        // Send to each subscription
        const results = await Promise.allSettled(
            subscriptions.map(sub =>
                sendWebPush(sub, payload, vapidPrivateKey!, vapidPublicKey!)
            )
        );

        const successful = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;

        // Update last_used_at for successful sends
        if (successful > 0) {
            await supabase
                .from('push_subscriptions')
                .update({ last_used_at: new Date().toISOString() })
                .in('endpoint', subscriptions.map(s => s.endpoint));
        }

        return new Response(
            JSON.stringify({
                success: true,
                sent: successful,
                failed,
                total: subscriptions.length
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        console.error('Error:', error);
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
        );
    }
});
