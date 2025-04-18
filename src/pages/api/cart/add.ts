import type { NextApiRequest, NextApiResponse } from 'next';
import redis from '../../../lib/redis';

// Define the expected request body structure
interface AddToCartRequest {
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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    // Get session ID from query parameter
    const { sessionId } = req.query;
    
    if (!sessionId || typeof sessionId !== 'string') {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    const cartKey = `${CART_PREFIX}${sessionId}`;
    const item = req.body as AddToCartRequest;

    // Validate required fields
    if (!item.id || !item.name || !item.price || !item.quantity) {
      return res.status(400).json({ error: 'Missing required product information' });
    }

    // Get existing cart from Redis
    const cartData = await redis.get(cartKey);
    const cartItems: AddToCartRequest[] = cartData ? JSON.parse(cartData) : [];

    // Check if item already exists in cart
    const existingItemIndex = cartItems.findIndex(cartItem => 
      cartItem.id === item.id && 
      cartItem.variation_id === item.variation_id && 
      cartItem.attributes === item.attributes
    );

    if (existingItemIndex >= 0) {
      // Update quantity if item exists
      cartItems[existingItemIndex].quantity += item.quantity;
    } else {
      // Add new item to cart
      cartItems.push(item);
    }

    // Save updated cart to Redis with TTL
    await redis.set(cartKey, JSON.stringify(cartItems), 'EX', CART_TTL);

    // Return updated cart
    return res.status(200).json({ 
      success: true,
      message: 'Product added to cart',
      cart: {
        items: cartItems,
        total: cartItems.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0).toFixed(2)
      }
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    return res.status(500).json({ error: 'Failed to add product to cart' });
  }
}
