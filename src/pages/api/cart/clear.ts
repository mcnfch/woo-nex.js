import type { NextApiRequest, NextApiResponse } from 'next';
import redis from '../../../lib/redis';

// Prefix for cart keys in Redis
const CART_PREFIX = 'cart:';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed. Use DELETE.' });
  }

  try {
    // Get session ID from query parameter
    const { sessionId } = req.query;
    
    if (!sessionId || typeof sessionId !== 'string') {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    const cartKey = `${CART_PREFIX}${sessionId}`;
    
    // Delete the cart from Redis
    await redis.del(cartKey);
    
    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Cart cleared successfully',
      cart: {
        items: [],
        total: "0.00",
        itemCount: 0
      }
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    return res.status(500).json({ error: 'Failed to clear cart' });
  }
}
