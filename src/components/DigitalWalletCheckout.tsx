'use client';

import React, { useEffect, useState } from 'react';
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useShoppingBag } from '../context/ShoppingBagContext';

// Initialize Stripe with the publishable key (using test key for development)
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_TEST || '');

export default function DigitalWalletCheckout() {
  const [clientSecret, setClientSecret] = useState<string>('');
  const { cartItems } = useShoppingBag();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Create a checkout session as soon as the page loads
    const createCheckoutSession = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/checkout-sessions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ cartItems }),
        });

        if (!response.ok) {
          throw new Error('Failed to create checkout session');
        }

        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (err: any) {
        console.error('Error creating checkout session:', err);
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (cartItems.length > 0) {
      createCheckoutSession();
    }
  }, [cartItems]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-500 mb-4">Error: {error}</div>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!clientSecret) {
    return null;
  }

  return (
    <div id="checkout" className="bg-white rounded-lg shadow-sm w-full">
      <EmbeddedCheckoutProvider
        stripe={stripePromise}
        options={{ clientSecret }}
      >
        <EmbeddedCheckout className="min-h-[500px]" />
      </EmbeddedCheckoutProvider>
    </div>
  );
}
