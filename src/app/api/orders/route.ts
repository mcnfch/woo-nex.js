import { NextRequest, NextResponse } from 'next/server';
import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';

export async function GET(request: NextRequest) {
  try {
    // Get the JWT token from cookies
    const token = request.cookies.get('woo_token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Initialize WooCommerce API
    const api = new WooCommerceRestApi({
      url: process.env.NEXT_PUBLIC_WOOCOMMERCE_URL || '',
      consumerKey: process.env.NEXT_PUBLIC_WOOCOMMERCE_KEY || '',
      consumerSecret: process.env.NEXT_PUBLIC_WOOCOMMERCE_SECRET || '',
      version: 'wc/v3'
    });

    try {
      // Get user ID from the token
      const userId = await getUserIdFromToken(token);
      
      if (!userId) {
        return NextResponse.json(
          { error: 'Could not identify user from token' },
          { status: 401 }
        );
      }
      
      // Fetch orders for the customer with the matching user ID
      const { data: orders } = await api.get('orders', {
        customer: userId,
        per_page: 20 // Limit to 20 most recent orders
      });

      return NextResponse.json(orders);
    } catch (_error: any) {
      return NextResponse.json(
        { error: 'Failed to fetch orders', details: _error.message },
        { status: 500 }
      );
    }
  } catch (_error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch orders', details: _error.message },
      { status: 500 }
    );
  }
}

// Helper function to extract user ID from token
async function getUserIdFromToken(token: string): Promise<string | null> {
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
        return data.data.id;
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
        return payload.data.user.id;
      }
    }
    
    return null;
  } catch {
    return null;
  }
}
