// WordPress API utility functions

/**
 * Fetch a WordPress post or page by ID
 * @param id The post or page ID
 * @returns The post or page content
 */
export async function getPostById(id: number) {
  try {
    const woocommerceUrl = process.env.NEXT_PUBLIC_WOOCOMMERCE_URL;
    const consumerKey = process.env.NEXT_PUBLIC_WOOCOMMERCE_KEY;
    const consumerSecret = process.env.NEXT_PUBLIC_WOOCOMMERCE_SECRET;
    
    if (!woocommerceUrl || !consumerKey || !consumerSecret) {
      throw new Error('WordPress API credentials not found in environment variables');
    }
    
    // Create authentication string for Basic Auth
    const authString = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
    
    // Try to fetch as a page first
    let response = await fetch(`${woocommerceUrl}/wp-json/wp/v2/pages/${id}`, {
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      next: { 
        revalidate: 3600 // Revalidate every hour
      }
    });
    
    // If page not found, try as a post
    if (!response.ok) {
      response = await fetch(`${woocommerceUrl}/wp-json/wp/v2/posts/${id}`, {
        headers: {
          'Authorization': `Basic ${authString}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        next: { 
          revalidate: 3600 // Revalidate every hour
        }
      });
      
      // If still not found, try custom endpoint for any post type
      if (!response.ok) {
        // This is a custom endpoint that can fetch any post type by ID
        response = await fetch(`${woocommerceUrl}/wp-json/wp/v2/any/${id}`, {
          headers: {
            'Authorization': `Basic ${authString}`,
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          },
          next: { 
            revalidate: 3600 // Revalidate every hour
          }
        });
        
        // If still not found, create a fallback content
        if (!response.ok) {
          return {
            id,
            title: {
              rendered: "Content Not Found"
            },
            content: {
              rendered: `<p>The content with ID ${id} could not be found. Please check the ID and try again.</p>`
            },
            date: new Date().toISOString()
          };
        }
      }
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching WordPress content:', error);
    throw error;
  }
}
