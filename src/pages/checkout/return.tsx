import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import { useShoppingBag } from '../../context/ShoppingBagContext';
import { GetServerSideProps } from 'next';
import { stripe } from '../../lib/stripe';
import { getOrCreateSessionId } from '../../lib/sessionUtils';
import dynamic from 'next/dynamic';

// Dynamically import the Confetti component to avoid SSR issues
const ReactConfetti = dynamic(() => import('react-confetti'), { ssr: false });

// Simple checkout header like on the checkout page
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

type ReturnPageProps = {
  status: 'complete' | 'open' | 'error';
  customerEmail?: string;
  errorMessage?: string;
  sessionId?: string;
  paymentIntentId?: string;
  customerDetails?: {
    address?: {
      city?: string;
      country?: string;
      line1?: string;
      line2?: string;
      postal_code?: string;
      state?: string;
    };
    email?: string;
    name?: string;
    phone?: string;
  };
  discountInfo?: any;
  discountAmount?: number;
  lineItems?: any;
  amount_total?: number;
}

export default function ReturnPage({ 
  status, 
  customerEmail, 
  errorMessage,
  sessionId,
  paymentIntentId,
  customerDetails,
  discountInfo,
  discountAmount,
  lineItems,
  amount_total
}: ReturnPageProps) {
  const { clearBag } = useShoppingBag();
  const router = useRouter();
  const [orderCreated, setOrderCreated] = useState<boolean>(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<number | null>(null);
  const orderCreationAttempted = useRef<boolean>(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [showConfetti, setShowConfetti] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [customerId, setCustomerId] = useState<number | null>(null);
  
  // Check if user is logged in
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch('/api/customer/me', {
          credentials: 'include', // Ensure cookies are sent with the request
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const customerData = await response.json();
          setIsLoggedIn(true);
          // Handle both string and number formats for customer ID
          const id = customerData.id || customerData.ID;
          setCustomerId(id ? Number(id) : null);
          console.log('Customer authenticated:', { id: Number(id) });
        } else {
          setIsLoggedIn(false);
          setCustomerId(null);
          console.log('Customer not authenticated');
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        setIsLoggedIn(false);
        setCustomerId(null);
      }
    };

    // Run auth check immediately
    checkAuthStatus();
  }, []);
  
  // Set window size for confetti
  useEffect(() => {
    if (typeof window !== 'undefined' && status === 'complete') {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
      
      // Show confetti with a slight delay for better user experience
      setTimeout(() => {
        setShowConfetti(true);
      }, 300);
      
      // Stop confetti after 5 seconds
      setTimeout(() => {
        setShowConfetti(false);
      }, 5000);
    }
  }, [status]);
  
  // Create order when payment is complete
  useEffect(() => {
    // Only attempt to create an order once
    if (status === 'complete' && sessionId && !orderCreated && !orderCreationAttempted.current) {
      orderCreationAttempted.current = true;
      
      const createOrder = async () => {
        try {
          // Get the cart session ID from sessionUtils
          const cartSessionId = typeof window !== 'undefined' ? getOrCreateSessionId() : '';
          
          if (!cartSessionId) {
            throw new Error('Cart session ID not available');
          }
          
          // Extract first and last name from full name
          let firstName = '';
          let lastName = '';
          
          if (customerDetails?.name) {
            const nameParts = customerDetails.name.split(' ');
            firstName = nameParts[0] || '';
            lastName = nameParts.slice(1).join(' ') || '';
          }
          
          // Log authentication status before creating order
          console.log('Creating order with auth status:', { isLoggedIn, customerId });
          
          // Prepare payment data for order creation
          const paymentData = {
            sessionId,
            paymentIntentId,
            billing: {
              first_name: firstName,
              last_name: lastName,
              email: customerDetails?.email || '',
              phone: customerDetails?.phone || '',
              address_1: customerDetails?.address?.line1 || '',
              city: customerDetails?.address?.city || '',
              state: customerDetails?.address?.state || '',
              postcode: customerDetails?.address?.postal_code || '',
              country: customerDetails?.address?.country || 'US'
            },
            // Include discount information if available
            discountInfo: discountInfo || null,
            discountAmount: discountAmount || 0,
            // Include actual line items and total from Stripe
            stripeLineItems: lineItems || [],
            amountTotal: amount_total || 0,
            // Include customer ID if user is logged in
            customerId: isLoggedIn && customerId ? Number(customerId) : null
          };
          
          // Call the API to create the order
          const response = await fetch('/api/create-order', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              sessionId: cartSessionId,
              paymentData
            })
          });
          
          const responseData = await response.json();
          
          if (!response.ok) {
            throw new Error(responseData.message || responseData.error || 'Failed to create order');
          }
          
          setOrderCreated(true);
          setOrderId(responseData.order.id);
          
          // Clear the bag after successful order creation
          clearBag();
        } catch (error: any) {
          console.error('Error creating order:', error);
          setOrderError(error.message || 'Failed to create order');
          
          // Still clear the bag even if order creation fails
          // The payment was successful, so we don't want to charge the customer again
          clearBag();
        }
      };
      
      createOrder();
    }
  }, [status, sessionId, paymentIntentId, customerDetails, clearBag, orderCreated, discountInfo, discountAmount, lineItems, amount_total, isLoggedIn, customerId]);

  // Redirect to home if status is open
  useEffect(() => {
    if (status === 'open') {
      router.push('/');
    }
  }, [status, router]);

  return (
    <div className="min-h-screen bg-white">
      {/* Show confetti when payment is successful */}
      {status === 'complete' && showConfetti && (
        <ReactConfetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={500}
          gravity={0.2}
        />
      )}
      
      <CheckoutHeader />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-lg mx-auto bg-white rounded-lg shadow-md p-8 text-center">
          {status === 'error' ? (
            <>
              <div className="text-6xl mb-4">❌</div>
              <h1 className="text-2xl font-semibold mb-4">Payment Error</h1>
              <p className="text-gray-600 mb-6">{errorMessage || 'There was an issue processing your payment.'}</p>
              <Link href="/checkout" className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded-lg">
                Return to Checkout
              </Link>
            </>
          ) : (
            <>
              <div className="text-6xl mb-4">✅</div>
              <h1 className="text-2xl font-semibold mb-4">Payment Successful!</h1>
              <p className="text-gray-600 mb-6">
                We appreciate your business! {customerEmail && `A confirmation email will be sent to ${customerEmail}.`}
              </p>
              
              {orderCreated && orderId && (
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <p className="text-sm text-gray-500 mb-1">Order Number</p>
                  <p className="font-medium text-lg">{orderId}</p>
                </div>
              )}
              
              {orderError && (
                <div className="bg-red-50 p-4 rounded-lg mb-6">
                  <p className="text-sm text-red-600">Note: {orderError}</p>
                  <p className="text-sm text-red-600">Your payment was processed successfully, but there was an issue creating your order. Our team will process it manually.</p>
                </div>
              )}
              
              {discountInfo && discountAmount && (
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <p className="text-sm text-gray-500 mb-1">Discount Information</p>
                  <p className="font-medium text-lg">Discount Amount: ${(discountAmount / 100).toFixed(2)}</p>
                  <p className="text-sm text-gray-500">Discount Details:</p>
                  <ul>
                    {discountInfo.map((discount: any, index: number) => (
                      <li key={index}>{discount.discount?.coupon?.name || discount.description || 'Promotion code applied'}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {lineItems && (
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <p className="text-sm text-gray-500 mb-1">Order Summary</p>
                  <ul>
                    {lineItems.map((item: any, index: number) => (
                      <li key={index}>
                        <p className="font-medium text-lg">{item.description}</p>
                        <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                        <p className="text-sm text-gray-500">Price: {item.price.unit_amount / 100} {item.price.currency}</p>
                      </li>
                    ))}
                  </ul>
                  <p className="text-sm text-gray-500">Total: {(amount_total ?? 0) / 100} {lineItems[0]?.price?.currency}</p>
                </div>
              )}
              
              <Link href="/" className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded-lg">
                Continue Shopping
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const { session_id } = query;

  if (!session_id || typeof session_id !== 'string') {
    return {
      props: {
        status: 'error',
        errorMessage: 'Please provide a valid session ID'
      }
    };
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: [
        'line_items.data', 
        'line_items.data.price.product', 
        'payment_intent', 
        'customer_details', 
        'total_details.breakdown'
      ]
    });

    if (session.status === 'open') {
      return {
        props: {
          status: 'open'
        }
      };
    }

    if (session.status === 'complete') {
      // Get payment intent ID
      const paymentIntentId = typeof session.payment_intent === 'string' 
        ? session.payment_intent 
        : session.payment_intent?.id || '';
      
      // Get discount information if available
      const discountInfo = session.total_details?.breakdown?.discounts || [];
      
      // Get line items with actual prices
      const lineItems = session.line_items?.data || [];
      
      return {
        props: {
          status: 'complete',
          customerEmail: session.customer_details?.email || '',
          sessionId: session_id,
          paymentIntentId,
          customerDetails: session.customer_details || {},
          discountInfo: discountInfo.length > 0 ? discountInfo : null,
          discountAmount: session.total_details?.amount_discount || 0,
          lineItems: lineItems,
          amount_total: session.amount_total || 0
        }
      };
    }

    return {
      props: {
        status: 'error',
        errorMessage: 'Payment not completed'
      }
    };
  } catch (error: any) {
    console.error('Error retrieving checkout session:', error);
    return {
      props: {
        status: 'error',
        errorMessage: error.message || 'Failed to retrieve session information'
      }
    };
  }
}
