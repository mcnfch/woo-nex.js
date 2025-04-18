import { NextRequest, NextResponse } from 'next/server';
import { getPostById } from '../../../../lib/wordpress';

/**
 * API route to fetch a WordPress post by ID
 * This uses the WordPress REST API, not the WooCommerce API
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // In Next.js 15.3.0, params is a Promise that must be awaited
    const resolvedParams = await params;
    const id = resolvedParams.id;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      );
    }
    
    // Use our utility function to get the post or page
    const post = await getPostById(parseInt(id, 10));
    
    return NextResponse.json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json(
      { error: 'Failed to fetch post' },
      { status: 500 }
    );
  }
}
