import type { NextApiRequest, NextApiResponse } from 'next';
import { stripe } from '../../lib/stripe';

// Add cache control headers to prevent 304 responses
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).end('Method Not Allowed');
  }

  const { session_id } = req.query;

  if (!session_id || typeof session_id !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid session_id' });
  }

  try {
    // Set cache control headers to prevent 304 responses
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    
    const session = await stripe.checkout.sessions.retrieve(session_id);
    
    // Add a timestamp to force clients to see the response as new
    return res.status(200).json({
      session,
      timestamp: new Date().getTime()
    });
  } catch (error: any) {
    console.error('Error retrieving checkout session:', error);
    return res.status(500).json({
      error: error.message
    });
  }
}
