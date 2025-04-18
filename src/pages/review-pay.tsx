'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useShoppingBag } from '../context/ShoppingBagContext';
import Image from 'next/image';
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with the public key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

// Simple header component for the review page
const ReviewHeader = () => (
  <header className="py-4 border-b">
    <div className="container mx-auto px-4">
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
        <Link href="/checkout" className="text-sm hover:underline">
          Back to Checkout
        </Link>
      </div>
    </div>
  </header>
);

export default function ReviewPayPage() {
  const router = useRouter();
  const { cartItems, loading } = useShoppingBag();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Helper function to ensure query params are strings
  const getQueryParam = (param: string | string[] | undefined): string => {
    if (!param) return '';
    return Array.isArray(param) ? param[0] : param;
  };
  
  // Get data from query params
  const {
    paymentMethod,
    billingFirstName,
    billingLastName,
    billingEmail,
    billingPhone,
    // ... other fields
  } = router.query;
  
  // Calculate totals - same as checkout page
  const subtotal = cartItems.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
  const shipping = 5.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;
  
  const handlePayment = async () => {
    setProcessing(true);
    setError(null);
    
    try {
      // Create payment intent
      const response = await fetch('/api/stripe-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: total,
          // Include other necessary metadata
          payment_method: getQueryParam(paymentMethod),
          billing_details: {
            name: `${getQueryParam(billingFirstName)} ${getQueryParam(billingLastName)}`,
            email: getQueryParam(billingEmail),
            phone: getQueryParam(billingPhone),
            // ... other billing details
          },
          // ... shipping details if different
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }
      
      const { clientSecret } = await response.json();
      
      // Process payment based on selected method
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe failed to initialize');
      }
      
      let result;
      
      const paymentMethodString = getQueryParam(paymentMethod);
      
      switch (paymentMethodString) {
        case 'card':
          // Use the stored card details from previous page
          result = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
              card: {
                token: getQueryParam(router.query.cardToken),
              },
              billing_details: {
                name: `${getQueryParam(billingFirstName)} ${getQueryParam(billingLastName)}`,
                email: getQueryParam(billingEmail),
                phone: getQueryParam(billingPhone),
              },
            },
          });
          break;
          
        case 'apple':
          // Apple Pay workflow - this is simplified
          // In a real implementation, we would use Apple Pay JS and confirmPayment
          alert('Apple Pay is not fully implemented in this demo');
          // Redirect to success page for demo purposes
          router.push('/checkout/success');
          return;
          
        case 'google':
          // Google Pay workflow - this is simplified
          // In a real implementation, we would use Google Pay JS and confirmPayment
          alert('Google Pay is not fully implemented in this demo');
          // Redirect to success page for demo purposes
          router.push('/checkout/success');
          return;
          
        case 'stripe':
          // Stripe Link or redirect to Stripe Checkout
          // In a real implementation we would use redirectToCheckout with a session ID
          alert('Stripe checkout is not fully implemented in this demo');
          // Redirect to success page for demo purposes
          router.push('/checkout/success');
          return;
          
        default:
          throw new Error('Invalid payment method');
      }
      
      if (result?.error) {
        throw result.error;
      }
      
      // If we get here, payment was successful
      router.push('/checkout/success');
      
    } catch (err: any) {
      setError(err.message || 'An error occurred during payment processing');
      console.error('Payment error:', err);
    } finally {
      setProcessing(false);
    }
  };
  
  // Handle loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <ReviewHeader />
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold mb-6 text-center">Review Your Order</h1>
          <div className="max-w-3xl mx-auto">
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
  
  // Handle empty cart
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <ReviewHeader />
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
        <title>Review and Pay | Groovy Gallery Designs</title>
        <meta name="description" content="Review your order and complete payment" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      
      <ReviewHeader />
      
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-3xl font-bold mb-6 text-center">Review Your Order</h1>
        
        {/* Order Summary */}
        <div className="mb-8 border rounded-lg overflow-hidden">
          <div className="bg-gray-100 py-3 px-4 border-b">
            <h2 className="font-medium">Order Summary</h2>
          </div>
          
          <div className="p-4">
            {cartItems.map((item) => (
              <div key={`${item.id}-${item.variation_id || 'standard'}`} className="flex py-4 border-b last:border-0">
                <div className="w-20 h-20 mr-4 flex-shrink-0">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover rounded"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <h3 className="font-medium">{item.name}</h3>
                    <div className="font-medium">${(parseFloat(item.price) * item.quantity).toFixed(2)}</div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {item.size && <div>Size: {item.size}</div>}
                    <div>Quantity: {item.quantity}</div>
                  </div>
                </div>
              </div>
            ))}
            
            <div className="mt-4 pt-4 border-t space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Shipping</span>
                <span>${shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold pt-2 border-t">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Payment Method Summary */}
        <div className="mb-8 border rounded-lg overflow-hidden">
          <div className="bg-gray-100 py-3 px-4 border-b">
            <h2 className="font-medium">Payment Method</h2>
          </div>
          
          <div className="p-4">
            <div className="flex items-center">
              {getQueryParam(paymentMethod) === 'card' && (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  <span>Credit Card</span>
                  <span className="ml-2 text-gray-600">ending in {getQueryParam(router.query.cardLast4)}</span>
                </>
              )}
              
              {getQueryParam(paymentMethod) === 'apple' && (
                <>
                  <span className="mr-2">
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11"/>
                    </svg>
                  </span>
                  <span>Apple Pay</span>
                </>
              )}
              
              {getQueryParam(paymentMethod) === 'google' && (
                <>
                  <Image 
                    src="/images/payments/google-pay-svgrepo-com.svg" 
                    alt="Google Pay" 
                    width={24} 
                    height={24}
                    className="mr-2"
                  />
                  <span>Google Pay</span>
                </>
              )}
              
              {getQueryParam(paymentMethod) === 'stripe' && (
                <>
                  <Image 
                    src="/images/payments/stripe-svgrepo-com.svg" 
                    alt="Stripe" 
                    width={24} 
                    height={24}
                    className="mr-2"
                  />
                  <span>Stripe</span>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Billing & Shipping Summary */}
        <div className="mb-8 border rounded-lg overflow-hidden">
          <div className="bg-gray-100 py-3 px-4 border-b">
            <h2 className="font-medium">Billing & Shipping</h2>
          </div>
          
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-2">Billing Address</h3>
                <p className="text-gray-800">
                  {getQueryParam(billingFirstName)} {getQueryParam(billingLastName)}<br />
                  {getQueryParam(router.query.billingAddress1)}<br />
                  {getQueryParam(router.query.billingAddress2) && <>{getQueryParam(router.query.billingAddress2)}<br /></>}
                  {getQueryParam(router.query.billingCity)}, {getQueryParam(router.query.billingState)} {getQueryParam(router.query.billingPostcode)}<br />
                  {getQueryParam(router.query.billingCountry)}<br />
                  {getQueryParam(billingEmail)}<br />
                  {getQueryParam(billingPhone)}
                </p>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Shipping Address</h3>
                <p className="text-gray-800">
                  {getQueryParam(router.query.sameAsBilling) === 'true' ? (
                    <>
                      {getQueryParam(billingFirstName)} {getQueryParam(billingLastName)}<br />
                      {getQueryParam(router.query.billingAddress1)}<br />
                      {getQueryParam(router.query.billingAddress2) && <>{getQueryParam(router.query.billingAddress2)}<br /></>}
                      {getQueryParam(router.query.billingCity)}, {getQueryParam(router.query.billingState)} {getQueryParam(router.query.billingPostcode)}<br />
                      {getQueryParam(router.query.billingCountry)}
                    </>
                  ) : (
                    <>
                      {getQueryParam(router.query.shippingFirstName)} {getQueryParam(router.query.shippingLastName)}<br />
                      {getQueryParam(router.query.shippingAddress1)}<br />
                      {getQueryParam(router.query.shippingAddress2) && <>{getQueryParam(router.query.shippingAddress2)}<br /></>}
                      {getQueryParam(router.query.shippingCity)}, {getQueryParam(router.query.shippingState)} {getQueryParam(router.query.shippingPostcode)}<br />
                      {getQueryParam(router.query.shippingCountry)}
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Pay Button */}
        <div className="max-w-lg mx-auto">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
              <strong className="font-bold">Error:</strong>
              <span className="block sm:inline"> {error}</span>
            </div>
          )}
          
          <button
            onClick={handlePayment}
            disabled={processing}
            className={`w-full py-3 rounded-md font-medium text-white ${
              processing ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {processing ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              `Pay $${total.toFixed(2)}`
            )}
          </button>
          
          <div className="text-center mt-4">
            <p className="text-sm text-gray-500">
              By proceeding, you agree to our <Link href="/terms" className="underline">Terms and Conditions</Link>
            </p>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-100 py-4 border-t mt-8">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          <p> 2025 Groovy Gallery Designs. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
