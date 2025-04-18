'use client';

import React from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { useShoppingBag } from '../context/ShoppingBagContext';
import Image from 'next/image';
import StripeEmbeddedCheckout from '../components/EmbeddedCheckout';

// Simple checkout header
const CheckoutHeader = () => (
  <header className="py-4 border-b">
    <div className="container mx-auto px-1">
      <div className="flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold">
          <Image 
            src="/images/ggd-logo.png" 
            alt="Groovy Gallery Designs" 
            width={200} 
            height={50}
            priority
          />
        </Link>
        <Link href="/" className="text-sm hover:underline">
          Continue Shopping
        </Link>
      </div>
    </div>
  </header>
);

// Main checkout page component
export default function CheckoutPage() {
  const { cartItems, loading } = useShoppingBag();

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <CheckoutHeader />
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold mb-6 text-center">Checkout</h1>
          <div className="max-w-3xl mx-auto">
            {/* Skeleton loading UI instead of spinner */}
            <div className="mb-8 border rounded-lg overflow-hidden">
              <div className="bg-gray-100 py-3 px-4 border-b">
                <div className="h-6 bg-gray-200 rounded w-24"></div>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-gray-200 rounded"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <CheckoutHeader />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🛒</div>
            <p className="text-gray-600 mb-4">Your cart is empty</p>
            <Link href="/" className="text-purple-600 hover:text-purple-800 font-medium">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>Checkout | Groovy Gallery Designs</title>
        <meta name="description" content="Complete your purchase" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      
      <CheckoutHeader />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-3xl font-bold mb-6 text-center">Checkout</h1>
        
        <div className="max-w-3xl mx-auto">
          {/* Stripe Checkout Section - Now full width */}
          <StripeEmbeddedCheckout />
        </div>
      </div>
    </div>
  );
}
