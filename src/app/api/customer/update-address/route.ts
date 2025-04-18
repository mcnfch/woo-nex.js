import { NextRequest, NextResponse } from 'next/server';
import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';

export async function PUT(request: NextRequest) {
  try {
    // Get the JWT token from cookies
    const token = request.cookies.get('woo_token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get request body
    const { billing, shipping } = await request.json();

    // Initialize WooCommerce API
    const api = new WooCommerceRestApi({
      url: process.env.NEXT_PUBLIC_WOOCOMMERCE_URL || '',
      consumerKey: process.env.NEXT_PUBLIC_WOOCOMMERCE_KEY || '',
      consumerSecret: process.env.NEXT_PUBLIC_WOOCOMMERCE_SECRET || '',
      version: 'wc/v3'
    });

    try {
      // Get user ID from JWT token
      const userId = await getUserIdFromToken(token);
      
      if (!userId) {
        return NextResponse.json(
          { error: 'Could not identify user from token' },
          { status: 401 }
        );
      }
      
      // Get customer ID from user ID using WooCommerce API
      const { data: customers } = await api.get('customers', {
        role: 'all'
      });
      
      // Find the customer with matching user ID
      const customer = customers.find((c: any) => String(c.id) === userId);
      
      if (!customer) {
        // If we can't find a direct match, try to find by email
        // Get user email from WordPress API
        const userResponse = await fetch(
          `${process.env.NEXT_PUBLIC_WOOCOMMERCE_URL}/wp-json/wp/v2/users/${userId}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Basic ${Buffer.from(
                `${process.env.NEXT_PUBLIC_WOOCOMMERCE_KEY}:${process.env.NEXT_PUBLIC_WOOCOMMERCE_SECRET}`
              ).toString('base64')}`
            }
          }
        );
        
        if (!userResponse.ok) {
          return NextResponse.json(
            { error: 'Failed to get user details' },
            { status: 500 }
          );
        }
        
        const userData = await userResponse.json();
        
        if (!userData.email) {
          return NextResponse.json(
            { error: 'User email not found' },
            { status: 404 }
          );
        }
        
        // Find customer by email
        const { data: emailCustomers } = await api.get('customers', {
          email: userData.email
        });
        
        if (emailCustomers.length === 0) {
          return NextResponse.json(
            { error: 'Customer not found' },
            { status: 404 }
          );
        }
        
        const customerByEmail = emailCustomers[0];
        
        // Update the customer data
        const updateData = {
          first_name: billing.first_name,
          last_name: billing.last_name,
          billing,
          shipping
        };
        
        const { data: updatedCustomer } = await api.put(`customers/${customerByEmail.id}`, updateData);
        
        return NextResponse.json(updatedCustomer);
      }
      
      // Update the customer data
      const updateData = {
        first_name: billing.first_name,
        last_name: billing.last_name,
        billing,
        shipping
      };
      
      const { data: updatedCustomer } = await api.put(`customers/${customer.id}`, updateData);
      
      return NextResponse.json(updatedCustomer);
    } catch (error: any) {
      return NextResponse.json(
        { error: 'Failed to update addresses', details: error.message },
        { status: 500 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to update addresses', details: error.message },
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
