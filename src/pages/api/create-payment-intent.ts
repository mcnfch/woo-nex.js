import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-03-31.basil',
});

// Define the cart item interface
interface CartItem {
  id: number;
  name: string;
  price: string;
  quantity: number;
  image: string;
  size?: string;
  variation_id?: number;
  attributes?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const { items } = req.body as { items: CartItem[] };
    
    if (!items || !items.length) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Safely parse prices and calculate order amount from items
    const amount = items.reduce((sum, item) => {
      // Handle different price formats, ensure it's a valid number
      const price = typeof item.price === 'string' 
        ? parseFloat(item.price.replace(/[^\d.-]/g, '')) 
        : parseFloat(String(item.price));
      
      if (isNaN(price)) {
        console.error(`Invalid price format for item ${item.id}: ${item.price}`);
        return sum;
      }
      
      return sum + Math.round(price * 100) * item.quantity;
    }, 0);

    if (amount <= 0) {
      return res.status(400).json({ error: 'Invalid order amount' });
    }

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      // Enable the following payment method types
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'always',
      },
      payment_method_types: ['card', 'us_bank_account', 'klarna', 'afterpay_clearpay', 'link'],
      metadata: {
        order_id: `order_${Date.now()}`,
        items: JSON.stringify(items.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity
        })).slice(0, 10)) // Limit metadata size
      }
    });

    return res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      amount: amount / 100 // Return amount in dollars for frontend display
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return res.status(500).json({ 
      error: 'Error creating payment intent',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
