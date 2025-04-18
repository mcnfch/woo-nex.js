'use client';

import { useState, useEffect } from 'react';
import { CartItem } from '../context/ShoppingBagContext';
import { getOrCreateSessionId } from '../lib/sessionUtils';

/**
 * Hook for interacting with the Redis-backed cart
 */
export function useRedisCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string>('');

  // Initialize session ID
  useEffect(() => {
    setSessionId(getOrCreateSessionId());
  }, []);

  // Fetch cart items from Redis when session ID is available
  useEffect(() => {
    if (!sessionId) return;
    
    const fetchCart = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/cart?sessionId=${sessionId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch cart');
        }
        
        const data = await response.json();
        setCartItems(data.items || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching cart:', err);
        setError('Failed to load your shopping bag');
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [sessionId]);

  /**
   * Add item to cart
   */
  const addItem = async (item: CartItem) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/cart/add?sessionId=${sessionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(item),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add item to cart');
      }
      
      const data = await response.json();
      setCartItems(data.cart.items || []);
      return data.cart.items;
    } catch (err) {
      console.error('Error adding item to cart:', err);
      setError('Failed to add item to your shopping bag');
      return cartItems;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Remove item from cart
   */
  const removeItem = async (id: number) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/cart/remove?sessionId=${sessionId}&itemId=${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to remove item from cart');
      }
      
      const data = await response.json();
      setCartItems(data.cart.items || []);
      return data.cart.items;
    } catch (err) {
      console.error('Error removing item from cart:', err);
      setError('Failed to remove item from your shopping bag');
      return cartItems;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update item quantity
   */
  const updateQuantity = async (id: number, quantity: number) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/cart/update?sessionId=${sessionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, quantity }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update item quantity');
      }
      
      const data = await response.json();
      setCartItems(data.cart.items || []);
      return data.cart.items;
    } catch (err) {
      console.error('Error updating item quantity:', err);
      setError('Failed to update item quantity');
      return cartItems;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Clear cart
   */
  const clearBag = async () => {
    try {
      setLoading(true);
      
      // If there are no items, just return an empty array without making an API call
      if (cartItems.length === 0) {
        return [];
      }
      
      // Try to clear via API, but don't throw errors
      try {
        const response = await fetch(`/api/cart/clear?sessionId=${sessionId}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          console.log('Cart cleared successfully via API');
        }
      } catch (apiError) {
        // Silently log but don't throw - we'll fall back to client-side clearing
        console.log('API cart clearing failed, falling back to client-side clearing');
      }
      
      // Always clear the local state regardless of API success
      setCartItems([]);
      return [];
    } catch (err) {
      // This should rarely happen now since we handle API errors internally
      console.error('Unexpected error in clearBag:', err);
      // Still clear the cart locally even if there was an error
      setCartItems([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    cartItems,
    loading,
    error,
    addItem,
    removeItem,
    updateQuantity,
    clearBag,
  };
}
