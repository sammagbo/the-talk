import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with the public key from environment variables
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_KEY);

/**
 * Get the Stripe instance
 * @returns {Promise} Stripe instance
 */
export const getStripe = () => stripePromise;

/**
 * Redirect to Stripe Checkout for a specific product
 * @param {string} productId - Stripe Price ID for the product
 */
export const handleBuy = async (productId) => {
    const stripe = await getStripe();

    if (!stripe) {
        console.error('Stripe not initialized. Check VITE_STRIPE_KEY.');
        alert('Store is not configured yet. Please try again later.');
        return;
    }

    try {
        const { error } = await stripe.redirectToCheckout({
            lineItems: [{ price: productId, quantity: 1 }],
            mode: 'payment',
            successUrl: `${window.location.origin}/store?success=true`,
            cancelUrl: `${window.location.origin}/store?canceled=true`,
        });

        if (error) {
            console.error('Stripe Checkout Error:', error.message);
            alert(error.message);
        }
    } catch (err) {
        console.error('Stripe Error:', err);
        alert('An error occurred. Please try again.');
    }
};

export default getStripe;
