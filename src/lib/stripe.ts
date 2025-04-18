import Stripe from 'stripe';

// Initialize Stripe with the secret key (using test key for development)
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY_TEST || '', {
  apiVersion: '2025-03-31.basil',
});
