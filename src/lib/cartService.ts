import redis from './redis';
import { CartItem } from '../context/ShoppingBagContext';

// Prefix for cart keys in Redis
const CART_PREFIX = 'cart:';

// TTL for cart data in seconds (7 days)
const CART_TTL = 60 * 60 * 24 * 7;

/**
 * Get a unique cart ID for a user
 * @param userId User ID or session ID
 * @returns Formatted cart key for Redis
 */
const getCartKey = (userId: string): string => {
  return `${CART_PREFIX}${userId}`;
};

/**
 * Get cart items from Redis
 * @param userId User ID or session ID
 * @returns Array of cart items
 */
export const getCart = async (userId: string): Promise<CartItem[]> => {
  try {
    const cartData = await redis.get(getCartKey(userId));
    return cartData ? JSON.parse(cartData) : [];
  } catch (error) {
    console.error('Error getting cart from Redis:', error);
    return [];
  }
};

/**
 * Save cart items to Redis
 * @param userId User ID or session ID
 * @param items Cart items to save
 */
export const saveCart = async (userId: string, items: CartItem[]): Promise<void> => {
  try {
    await redis.set(
      getCartKey(userId),
      JSON.stringify(items),
      'EX',
      CART_TTL
    );
  } catch (error) {
    console.error('Error saving cart to Redis:', error);
  }
};

/**
 * Add item to cart in Redis
 * @param userId User ID or session ID
 * @param item Item to add to cart
 */
export const addCartItem = async (userId: string, item: CartItem): Promise<CartItem[]> => {
  try {
    const currentCart = await getCart(userId);
    
    // Check if item already exists in cart
    const existingItemIndex = currentCart.findIndex(
      (i) => i.id === item.id && 
             i.variation_id === item.variation_id && 
             i.attributes === item.attributes
    );

    if (existingItemIndex > -1) {
      // Update quantity if item exists
      currentCart[existingItemIndex].quantity += item.quantity;
    } else {
      // Add new item
      currentCart.push(item);
    }

    // Save updated cart
    await saveCart(userId, currentCart);
    return currentCart;
  } catch (error) {
    console.error('Error adding item to cart:', error);
    return [];
  }
};

/**
 * Remove item from cart in Redis
 * @param userId User ID or session ID
 * @param itemId ID of item to remove
 */
export const removeCartItem = async (userId: string, itemId: number): Promise<CartItem[]> => {
  try {
    const currentCart = await getCart(userId);
    const updatedCart = currentCart.filter(item => item.id !== itemId);
    await saveCart(userId, updatedCart);
    return updatedCart;
  } catch (error) {
    console.error('Error removing item from cart:', error);
    return [];
  }
};

/**
 * Update item quantity in cart
 * @param userId User ID or session ID
 * @param itemId ID of item to update
 * @param quantity New quantity
 */
export const updateCartItemQuantity = async (
  userId: string,
  itemId: number,
  quantity: number
): Promise<CartItem[]> => {
  try {
    const currentCart = await getCart(userId);
    const updatedCart = currentCart.map(item => 
      item.id === itemId ? { ...item, quantity } : item
    );
    await saveCart(userId, updatedCart);
    return updatedCart;
  } catch (error) {
    console.error('Error updating cart item quantity:', error);
    return [];
  }
};

/**
 * Clear cart in Redis
 * @param userId User ID or session ID
 */
export const clearCart = async (userId: string): Promise<void> => {
  try {
    await redis.del(getCartKey(userId));
  } catch (error) {
    console.error('Error clearing cart:', error);
  }
};
