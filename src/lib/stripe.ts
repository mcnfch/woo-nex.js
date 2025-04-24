import Stripe from 'stripe';

// Initialize Stripe with the secret key (using live key for production)
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-03-31.basil',
});
