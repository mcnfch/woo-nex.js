import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, password } = body;
    
    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }
    
    // Generate a username from email if not provided
    const username = email.split('@')[0];
    
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
    
    // Create customer in WooCommerce
    const apiUrl = `${baseUrl}/wp-json/wc/v3/customers`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64')}`
      },
      body: JSON.stringify({
        email,
        first_name: firstName,
        last_name: lastName,
        username,
        password
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || 'Registration failed' },
        { status: response.status }
      );
    }
    
    // Return success response with user data (excluding sensitive info)
    return NextResponse.json({
      id: data.id,
      email: data.email,
      firstName: data.first_name,
      lastName: data.last_name,
      username: data.username
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
