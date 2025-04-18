import type { NextApiRequest, NextApiResponse } from 'next'
import { stripe } from '../../lib/stripe'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    try {
      const origin = req.headers.origin || '';
      const { cartItems } = req.body;
      
      // Create Stripe checkout session
      // We're keeping it simple but ensuring domain verification through the Stripe Dashboard
      // The PMD ID 'pmd_1REY3MKjv4zJvSsvqZizdHvI' should be verified in the Stripe Dashboard
      // This allows Apple Pay, Google Pay and other wallet methods to appear automatically
      const session = await stripe.checkout.sessions.create({
        ui_mode: 'embedded',
        line_items: cartItems.map((item: any) => ({
          price_data: {
            currency: 'usd',
            product_data: {
              name: item.name,
              images: item.image ? [item.image] : [],
            },
            unit_amount: Math.round(parseFloat(item.price) * 100), // Convert to cents
            tax_behavior: 'exclusive', // Price doesn't include tax, will be added separately
          },
          quantity: item.quantity,
        })),
        mode: 'payment',
        return_url: `${origin}/checkout/return?session_id={CHECKOUT_SESSION_ID}`,
        shipping_address_collection: {
          allowed_countries: ['US'],
        },
        billing_address_collection: 'required',
        automatic_tax: {
          enabled: true
        },
        allow_promotion_codes: true,
        payment_intent_data: {
          statement_descriptor: 'Groovy Gallery LLC',
          statement_descriptor_suffix: 'GGD',
        },
        custom_text: {
          submit: {
            message: 'Pay Groovy Gallery LLC'
          }
        }
      });

      res.status(200).json({ clientSecret: session.client_secret });
    } catch (error: any) {
      console.error('Error in checkout session creation:', error);
      res.status(500).json({ statusCode: 500, message: error.message });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}
