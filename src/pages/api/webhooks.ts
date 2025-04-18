import type { NextApiRequest, NextApiResponse } from 'next';
import { buffer } from 'micro';
import Stripe from 'stripe';
import { stripe } from '../../lib/stripe';

// This is your Stripe CLI webhook secret for testing
// You'll need to set this in your .env file
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

// Disable the default body parser to get the raw body
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  let event: Stripe.Event;
  
  try {
    // Get the raw body
    const rawBody = await buffer(req);
    
    // Get the signature from headers
    const signature = req.headers['stripe-signature'] as string;
    
    // Verify the event
    event = stripe.webhooks.constructEvent(
      rawBody.toString(),
      signature,
      endpointSecret
    );
  } catch (err: any) {
    console.error(`⚠️ Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('💰 Payment successful!', session.id);
        
        // Here you would typically:
        // 1. Update your database to mark the order as paid
        // 2. Fulfill the order (e.g., send confirmation email)
        // 3. Clear the user's cart
        
        break;
        
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('💰 PaymentIntent successful!', paymentIntent.id);
        break;
        
      case 'payment_intent.payment_failed':
        const failedPaymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('❌ Payment failed:', failedPaymentIntent.id);
        break;
        
      default:
        // Unexpected event type
        console.log(`🤔 Unhandled event type: ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    res.status(200).json({ received: true });
  } catch (err) {
    console.error(`Error processing webhook: ${err}`);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
}
