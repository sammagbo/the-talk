import { loadStripe } from '@stripe/stripe-js';

let stripePromise;
const getStripe = () => {
    if (!stripePromise) {
        stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
    }
    return stripePromise;
};

export const redirectToCheckout = async (productId) => {
    const stripe = await getStripe();
    const { error } = await stripe.redirectToCheckout({
        lineItems: [{ price: productId, quantity: 1 }],
        mode: 'payment',
        successUrl: `${window.location.origin}/success`,
        cancelUrl: `${window.location.origin}/store`,
    });

    if (error) {
        console.error('Stripe redirect error:', error);
    }
};
