import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;
    
    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    // WooCommerce API credentials from environment variables
    const consumerKey = process.env.NEXT_PUBLIC_WOOCOMMERCE_KEY;
    const consumerSecret = process.env.NEXT_PUBLIC_WOOCOMMERCE_SECRET;
    const baseUrl = process.env.NEXT_PUBLIC_WOOCOMMERCE_URL;
    
    if (!consumerKey || !consumerSecret || !baseUrl) {
      return NextResponse.json(
        { error: 'API credentials not configured' },
        { status: 500 }
      );
    }
    
    // Use WordPress JWT authentication if available
    const loginUrl = `${baseUrl}/wp-json/jwt-auth/v1/token`;
    
    const response = await fetch(loginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: email,
        password
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      // If JWT auth fails, try basic auth as fallback
      if (response.status === 404) {
        // Fallback to basic auth to get customer info
        const customerUrl = `${baseUrl}/wp-json/wc/v3/customers`;
        
        const customerResponse = await fetch(`${customerUrl}?email=${encodeURIComponent(email)}`, {
          method: 'GET',
          headers: {
            'Authorization': `Basic ${Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64')}`
          }
        });
        
        const customers = await customerResponse.json();
        
        if (!customerResponse.ok || !customers.length) {
          return NextResponse.json(
            { error: 'Invalid email or password' },
            { status: 401 }
          );
        }
        
        // Create a response with user data
        const response = NextResponse.json({
          id: customers[0].id,
          email: customers[0].email,
          firstName: customers[0].first_name,
          lastName: customers[0].last_name
        });
        
        // Set a cookie for authentication
        response.cookies.set('woo_token', JSON.stringify({
          id: customers[0].id,
          email: customers[0].email,
          name: `${customers[0].first_name} ${customers[0].last_name}`
        }), {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 60 * 60 * 24 * 7, // 1 week
          path: '/'
        });
        
        return response;
      }
      
      return NextResponse.json(
        { error: data.message || 'Login failed' },
        { status: response.status }
      );
    }
    
    // Create a response with user data
    const successResponse = NextResponse.json({
      token: data.token,
      user: {
        id: data.user_id,
        email: data.user_email,
        name: data.user_display_name
      }
    });
    
    // Set token in cookie
    successResponse.cookies.set('woo_token', data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/'
    });
    
    return successResponse;
    
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
