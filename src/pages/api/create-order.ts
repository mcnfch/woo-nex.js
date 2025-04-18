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
