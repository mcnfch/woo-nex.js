import type { NextApiRequest, NextApiResponse } from 'next';
import redis from '../../lib/redis';
import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';

// Initialize WooCommerce API
const api = new WooCommerceRestApi({
  url: process.env.NEXT_PUBLIC_WOOCOMMERCE_URL || 'https://ggbe.groovygallerydesigns.com',
  consumerKey: process.env.NEXT_PUBLIC_WOOCOMMERCE_KEY || '',
  consumerSecret: process.env.NEXT_PUBLIC_WOOCOMMERCE_SECRET || '',
  version: 'wc/v3'
});

// Prefix for cart keys in Redis
const CART_PREFIX = 'cart:';

// Define the cart item interface
interface CartItem {
  id: number;
  name: string;
  price: string;
  quantity: number;
  image: string;
  size?: string;
  variation_id?: number;
  attributes?: string;
}

// Helper function to extract user ID from token
async function getUserIdFromToken(token: string): Promise<number | null> {
  try {
    // Try to validate with WordPress JWT validation endpoint
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_WOOCOMMERCE_URL}/wp-json/jwt-auth/v1/token/validate`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (response.ok) {
      const data = await response.json();
      
      // Extract user ID from response if available
      if (data && data.data && data.data.id) {
        return Number(data.data.id);
      }
    }
    
    // If validation fails or doesn't return user ID, try to decode token
    const base64Url = token.split('.')[1];
    if (base64Url) {
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      const payload = JSON.parse(jsonPayload);
      
      // Extract user ID from payload
      if (payload.data && payload.data.user && payload.data.user.id) {
        return Number(payload.data.user.id);
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting user ID from token:', error);
    return null;
  }
}

// Helper function to get customer ID from user ID
async function getCustomerIdFromUserId(userId: number): Promise<number | null> {
  try {
    // Get all customers
    const { data: customers } = await api.get('customers');
    
    // Find the customer with matching user ID
    const customer = customers.find((c: any) => Number(c.id) === userId);
    
    if (customer) {
      return Number(customer.id);
    }
    
    return null;
  } catch (error) {
    console.error('Error getting customer ID from user ID:', error);
    return null;
  }
}

/**
 * API endpoint to create a WooCommerce order from Redis cart data
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    // Get session ID and payment data from request body
    const { sessionId, paymentData } = req.body;
    
    if (!sessionId || typeof sessionId !== 'string') {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    if (!paymentData) {
      return res.status(400).json({ error: 'Payment data is required' });
    }

    // Get cart data from Redis
    const cartKey = `${CART_PREFIX}${sessionId}`;
    const cartData = await redis.get(cartKey);
    
    if (!cartData) {
      return res.status(404).json({ error: 'Cart not found' });
    }
    
    let cartItems: CartItem[] = [];
    
    try {
      cartItems = JSON.parse(cartData);
    } catch {
      return res.status(500).json({ error: 'Invalid cart data format' });
    }
    
    if (!cartItems.length) {
      return res.status(400).json({ error: 'Cart is empty' });
    }
    
    // Format line items for WooCommerce
    const lineItems = cartItems.map(item => ({
      product_id: item.id,
      variation_id: item.variation_id || 0,
      quantity: item.quantity
    }));
    
    // Create order payload
    const orderData: any = {
      payment_method: 'stripe',
      payment_method_title: 'Credit Card (Stripe)',
      set_paid: true,
      status: 'processing', // Mark as processing, not completed
      billing: {
        first_name: paymentData.billing?.first_name || 'Guest',
        last_name: paymentData.billing?.last_name || 'Customer',
        address_1: paymentData.billing?.address_1 || '',
        city: paymentData.billing?.city || '',
        state: paymentData.billing?.state || '',
        postcode: paymentData.billing?.postcode || '',
        country: paymentData.billing?.country || 'US',
        email: paymentData.billing?.email || '',
        phone: paymentData.billing?.phone || ''
      },
      shipping: {
        first_name: paymentData.shipping?.first_name || paymentData.billing?.first_name || 'Guest',
        last_name: paymentData.shipping?.last_name || paymentData.billing?.last_name || 'Customer',
        address_1: paymentData.shipping?.address_1 || paymentData.billing?.address_1 || '',
        city: paymentData.shipping?.city || paymentData.billing?.city || '',
        state: paymentData.shipping?.state || paymentData.billing?.state || '',
        postcode: paymentData.shipping?.postcode || paymentData.billing?.postcode || '',
        country: paymentData.shipping?.country || paymentData.billing?.country || 'US'
      },
      line_items: lineItems,
      meta_data: [
        {
          key: 'stripe_payment_intent_id',
          value: paymentData.paymentIntentId || ''
        },
        {
          key: 'stripe_session_id',
          value: paymentData.sessionId || ''
        },
        {
          key: 'cart_session_id',
          value: sessionId
        }
      ]
    };

    // Check for authentication token in cookies
    let customerId: number | null = null;
    const authToken = req.cookies.woo_token;

    if (authToken) {
      try {
        // Try to parse the token if it's a JSON string (some implementations store token info as JSON)
        let token = authToken;
        try {
          const tokenData = JSON.parse(authToken);
          if (tokenData.id) {
            // If token is stored as JSON with ID, use that directly
            customerId = Number(tokenData.id);
            console.log('Found customer ID in token JSON:', customerId);
          } else if (tokenData.token) {
            // If token is stored with a token property, use that for JWT validation
            token = tokenData.token;
          }
        } catch {
          // If not JSON, use the token string directly for JWT validation
          const userId = await getUserIdFromToken(token);
          if (userId) {
            customerId = await getCustomerIdFromUserId(userId);
            console.log('Found customer ID from JWT token:', customerId);
          }
        }
      } catch (error) {
        console.error('Error processing authentication token:', error);
      }
    }

    // If we have a customer ID from the token, use it
    if (customerId) {
      orderData.customer_id = customerId;
      console.log('Creating order for authenticated customer:', customerId);
    } else if (paymentData.customerId && typeof paymentData.customerId !== 'undefined') {
      // Fallback to customer ID from payment data if provided
      const id = Number(paymentData.customerId);
      if (!isNaN(id) && id > 0) {
        orderData.customer_id = id;
        console.log('Creating order using customer ID from payment data:', id);
      } else {
        console.log('Invalid customer ID format in payment data:', paymentData.customerId);
      }
    } else {
      console.log('Creating guest order (no customer ID)');
    }

    // Add discount information if available
    if (paymentData.discountInfo && paymentData.discountAmount && paymentData.discountAmount > 0) {
      // Convert discount amount from cents to dollars
      const discountAmountDollars = (paymentData.discountAmount / 100).toFixed(2);
      
      // Add discount meta data
      orderData.meta_data.push({
        key: 'stripe_discount_amount',
        value: discountAmountDollars
      });
      
      // Get promotion code information if available
      let promoDescription = 'Stripe Promotion';
      
      if (paymentData.discountInfo.length > 0 && 
          paymentData.discountInfo[0].discount && 
          paymentData.discountInfo[0].discount.coupon) {
        const coupon = paymentData.discountInfo[0].discount.coupon;
        promoDescription = coupon.name || 'Stripe Promotion';
      }
      
      // Add fee line to apply the discount
      orderData.fee_lines = [
        {
          name: `Discount: ${promoDescription}`,
          total: `-${discountAmountDollars}`, // Negative amount for discount
          tax_status: 'none'
        }
      ];
    }

    try {
      // Create order in WooCommerce
      const { data: order } = await api.post('orders', orderData);
      
      // Clear the cart from Redis
      await redis.del(cartKey);
      
      // Return success response with order data
      return res.status(201).json({
        success: true,
        message: 'Order created successfully',
        order: {
          id: order.id,
          number: order.number,
          status: order.status,
          total: order.total,
          line_items: order.line_items,
          discount_total: order.discount_total || '0.00'
        }
      });
    } catch (wooError: any) {
      console.error('WooCommerce order creation error:', wooError.response?.data || wooError.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to create order in WooCommerce',
        error: wooError.message,
        details: wooError.response?.data || {}
      });
    }
  } catch (error: any) {
    // Return error response
    console.error('General order creation error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message || 'Unknown error'
    });
  }
}
