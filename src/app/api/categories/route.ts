import { NextRequest, NextResponse } from 'next/server';
import { getCategories } from '../../../lib/woocommerce';

// Enable dynamic functionality for this route
export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every hour

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parent = searchParams.get('parent');
    
    // Convert parent to number if provided
    const parentId = parent ? parseInt(parent, 10) : undefined;
    
    // Use the utility function to fetch categories
    const categories = await getCategories(parentId);
    
    if (categories.length === 0) {
      return NextResponse.json(
        { message: 'No categories found or error fetching categories' },
        { status: 404 }
      );
    }

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error in categories API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories from WooCommerce' },
      { status: 500 }
    );
  }
}
