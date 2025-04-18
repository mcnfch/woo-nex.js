'use client'

import { useState } from 'react'

interface CheckoutButtonProps {
  className?: string
}

export default function CheckoutButton({ className = '' }: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  
  async function handleCheckout() {
    setIsLoading(true)
    
    try {
      // For now, just redirect to a simple checkout page
      window.location.href = '/checkout';
      
      // When fully implemented with Stripe, we would do:
      // 1. Fetch cart items from your WooCommerce API
      // 2. Create a checkout session with Stripe
      // 3. Redirect to the Stripe checkout page
    } catch (error) {
      console.error('Error in checkout:', error)
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleCheckout}
      disabled={isLoading}
      className={`w-full bg-black text-white py-3 px-6 rounded flex items-center justify-center space-x-2 ${
        isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-gray-800'
      } ${className}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      <span>{isLoading ? 'Loading...' : 'CHECK OUT'}</span>
    </button>
  )
}
