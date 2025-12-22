/* eslint-disable no-undef */
export default async function handler(request) {
    // Only allow POST requests
    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        const { email } = await request.json();

        // Validate email
        if (!email || !isValidEmail(email)) {
            return new Response(JSON.stringify({ error: 'Invalid email address' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Get Mailchimp credentials from environment
        const apiKey = process.env.MAILCHIMP_API_KEY;
        const listId = process.env.MAILCHIMP_LIST_ID;
        const serverPrefix = process.env.MAILCHIMP_SERVER_PREFIX; // e.g., 'us21'

        if (!apiKey || !listId || !serverPrefix) {
            console.error('Missing Mailchimp configuration');
            return new Response(JSON.stringify({ error: 'Newsletter service not configured' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Mailchimp API endpoint
        const url = `https://${serverPrefix}.api.mailchimp.com/3.0/lists/${listId}/members`;

        // Make request to Mailchimp
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${btoa(`anystring:${apiKey}`)}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email_address: email,
                status: 'subscribed',
                tags: ['website', 'newsletter'],
            }),
        });

        const data = await response.json();

        // Handle Mailchimp response
        if (response.ok) {
            return new Response(JSON.stringify({
                success: true,
                message: 'Successfully subscribed!'
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Handle already subscribed
        if (data.title === 'Member Exists') {
            return new Response(JSON.stringify({
                success: true,
                message: 'You are already subscribed!'
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Handle other errors
        console.error('Mailchimp error:', data);
        return new Response(JSON.stringify({
            error: data.detail || 'Failed to subscribe'
        }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Subscribe error:', error);
        return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

// Email validation helper
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
