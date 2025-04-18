'use client'

import React from 'react'
import { ShoppingBagProvider } from '../context/ShoppingBagContext'

interface CartProviderProps {
  children: React.ReactNode
}

// Simple cart provider that just wraps our ShoppingBagContext
function CartProvider({ children }: CartProviderProps) {
  return (
    <ShoppingBagProvider>
      {children}
    </ShoppingBagProvider>
  )
}

// For compatibility with type imports
export type { CartProvider as CartProviderType };

export default CartProvider
