import type { NextApiRequest, NextApiResponse } from 'next';
import redis from '../../../lib/redis';

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

// Prefix for cart keys in Redis
const CART_PREFIX = 'cart:';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed. Use GET.' });
  }

  try {
    // Get session ID from query parameter
    const { sessionId } = req.query;
    
    if (!sessionId || typeof sessionId !== 'string') {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    const cartKey = `${CART_PREFIX}${sessionId}`;
    
    // Get cart data from Redis
    const cartData = await redis.get(cartKey);
    const cartItems: CartItem[] = cartData ? JSON.parse(cartData) : [];
    
    // Calculate cart total
    const cartTotal = cartItems.reduce(
      (sum, item) => sum + (parseFloat(item.price) * item.quantity), 
      0
    ).toFixed(2);

    // Return cart data
    return res.status(200).json({
      items: cartItems,
      total: cartTotal,
      itemCount: cartItems.reduce((count, item) => count + item.quantity, 0)
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    return res.status(500).json({ error: 'Failed to fetch cart' });
  }
}
