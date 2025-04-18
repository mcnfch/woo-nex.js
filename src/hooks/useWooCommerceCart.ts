'use client'

import { useShoppingBag } from '../context/ShoppingBagContext'

// Define CartItem interface here instead of importing
interface CartItem {
  id: number;
  name: string;
  price: string | number;
  quantity: number;
  image: string;
}

/**
 * Custom hook to adapt WooCommerce cart items 
 */
export function useWooCommerceCart() {
  const { 
    updateQuantity, 
    removeItem, 
    cartItems,
    loading
  } = useShoppingBag()

  // We're no longer syncing external items since we're using our own ShoppingBagContext
  // Instead, we return the methods needed by the UI

  const handleUpdateQuantity = (id: number, quantity: number) => {
    updateQuantity(id, quantity)
  }

  const handleRemoveItem = (id: number) => {
    removeItem(id)
  }

  // Calculate cart count and formatted price
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0)
  const totalPrice = cartItems.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0)
  const formattedTotalPrice = `$${totalPrice.toFixed(2)}`

  return {
    // Return cart state
    cartDetails: cartItems.reduce((acc, item) => {
      acc[item.id] = item
      return acc
    }, {} as Record<string | number, CartItem>),
    cartCount,
    formattedTotalPrice,
    loading,
    
    // Return adapter methods
    handleRemoveItem,
    handleUpdateQuantity
  }
}
