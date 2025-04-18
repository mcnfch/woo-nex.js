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
// TTL for cart data in seconds (7 days)
const CART_TTL = 60 * 60 * 24 * 7;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed. Use DELETE.' });
  }

  try {
    // Get session ID and item ID from query parameters
    const { sessionId, itemId } = req.query;
    
    if (!sessionId || typeof sessionId !== 'string') {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    if (!itemId) {
      return res.status(400).json({ error: 'Item ID is required' });
    }

    const cartKey = `${CART_PREFIX}${sessionId}`;
    
    // Get existing cart from Redis
    const cartData = await redis.get(cartKey);
    let cartItems: CartItem[] = cartData ? JSON.parse(cartData) : [];

    // Remove the item from cart
    const itemIdNum = parseInt(itemId as string, 10);
    cartItems = cartItems.filter(item => item.id !== itemIdNum);

    // Save updated cart to Redis with TTL
    await redis.set(cartKey, JSON.stringify(cartItems), 'EX', CART_TTL);

    // Return updated cart
    return res.status(200).json({ 
      success: true,
      message: 'Product removed from cart',
      cart: {
        items: cartItems,
        total: cartItems.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0).toFixed(2)
      }
    });
  } catch (error) {
    console.error('Error removing from cart:', error);
    return res.status(500).json({ error: 'Failed to remove product from cart' });
  }
}
