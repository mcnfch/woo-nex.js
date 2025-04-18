import type { NextApiRequest, NextApiResponse } from 'next';
import redis from '../../../lib/redis';

// Define the expected request body structure
interface UpdateCartRequest {
  id: number;
  quantity: number;
  attributes?: string;
}

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
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed. Use PUT.' });
  }

  try {
    // Get session ID from query parameter
    const { sessionId } = req.query;
    
    if (!sessionId || typeof sessionId !== 'string') {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    const { id, quantity, attributes } = req.body as UpdateCartRequest;

    if (!id || typeof quantity !== 'number') {
      return res.status(400).json({ error: 'Missing product ID or quantity' });
    }

    if (quantity < 1) {
      return res.status(400).json({ error: 'Quantity must be at least 1' });
    }

    const cartKey = `${CART_PREFIX}${sessionId}`;
    
    // Get existing cart from Redis
    const cartData = await redis.get(cartKey);
    const cartItems: CartItem[] = cartData ? JSON.parse(cartData) : [];

    // Find the item in the cart
    const itemIndex = cartItems.findIndex(item => 
      item.id === id && (!attributes || item.attributes === attributes)
    );

    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Item not found in cart' });
    }

    // Update the item quantity
    cartItems[itemIndex].quantity = quantity;

    // Save updated cart to Redis with TTL
    await redis.set(cartKey, JSON.stringify(cartItems), 'EX', CART_TTL);

    // Return updated cart
    return res.status(200).json({ 
      success: true,
      message: 'Cart updated successfully',
      cart: {
        items: cartItems,
        total: cartItems.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0).toFixed(2)
      }
    });
  } catch (error) {
    console.error('Error updating cart:', error);
    return res.status(500).json({ error: 'Failed to update cart' });
  }
}
