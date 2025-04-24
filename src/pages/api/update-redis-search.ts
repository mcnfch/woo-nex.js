import type { NextApiRequest, NextApiResponse } from 'next';
import Redis from 'ioredis';
import { getProducts, decodeHtmlEntities } from '../../lib/woocommerce';

// Create Redis client instance for search functionality with type assertions
const redisSearch = new Redis({
  port: 6380,
  host: 'localhost',
}) as Redis & {
  keys(pattern: string): Promise<string[]>;
  del(...keys: string[]): Promise<number>;
  quit(): Promise<'OK'>;
};

type UpdateResponse = {
  success: boolean;
  message: string;
  totalProducts?: number;
};

/**
 * API endpoint to update Redis search database
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UpdateResponse>
) {
  // Only allow POST requests for security
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // Test connection
    await redisSearch.ping();
    console.log('✅ Connected to Redis Search');
    
    // Fetch products from WooCommerce API
    console.log('Fetching products from WooCommerce API...');
    const products = await getProducts();
    console.log(`✅ Fetched ${products.length} products from WooCommerce API`);
    
    // Store products in Redis
    console.log('Updating products in Redis...');
    const pipeline = redisSearch.pipeline();
    
    // Track all product IDs for cleanup
    const currentProductIds = new Set<string>();
    
    for (const product of products) {
      currentProductIds.add(product.id.toString());
      
      // Decode HTML entities in product data before storing
      if (product.name) {
        product.name = decodeHtmlEntities(product.name);
      }
      
      if (product.description) {
        product.description = decodeHtmlEntities(product.description);
      }
      
      if (product.short_description) {
        product.short_description = decodeHtmlEntities(product.short_description);
      }
      
      if (product.categories && Array.isArray(product.categories)) {
        product.categories = product.categories.map((cat: any) => ({
          ...cat,
          name: cat.name ? decodeHtmlEntities(cat.name) : cat.name
        }));
      }
      
      // Store full product data
      pipeline.set(`product:${product.id}`, JSON.stringify(product));
      
      // Update search indices
      
      // Index by name (lowercase for case-insensitive search)
      if (product.name) {
        pipeline.set(`product_name:${product.name.toLowerCase()}`, product.id.toString());
        
        // Add word-by-word indexing for partial matches
        const words = product.name.toLowerCase().split(' ');
        for (const word of words) {
          if (word.length > 2) { // Only index words longer than 2 characters
            pipeline.sadd(`word:${word}`, product.id.toString());
          }
        }
      }
      
      // Index by category
      if (product.categories && product.categories.length > 0) {
        for (const category of product.categories) {
          pipeline.sadd(`category:${category.id}`, product.id.toString());
          if (category.name) {
            pipeline.sadd(`category_name:${category.name.toLowerCase()}`, product.id.toString());
          }
        }
      }
    }
    
    // Execute all commands in pipeline
    await pipeline.exec();
    console.log(`✅ Updated ${products.length} products in Redis`);
    
    // Clean up old products that no longer exist
    const existingKeys = await redisSearch.keys('product:*');
    const keysToDelete = existingKeys.filter(key => {
      const id = key.split(':')[1];
      return !currentProductIds.has(id);
    });
    
    if (keysToDelete.length > 0) {
      await redisSearch.del(...keysToDelete);
      console.log(`✅ Removed ${keysToDelete.length} obsolete product records`);
    }
    
    // Update the timestamp for the last update
    await redisSearch.set('products:last_updated', new Date().toISOString());
    
    // Close Redis connection
    await redisSearch.quit();
    
    return res.status(200).json({
      success: true,
      message: 'Redis search update completed successfully',
      totalProducts: products.length
    });
    
  } catch (error) {
    console.error('❌ Redis search update failed:', error);
    
    // Close Redis connection if still open
    try {
      await redisSearch.quit();
    } catch (e) {
      console.error('Error closing Redis connection:', e);
    }
    
    return res.status(500).json({
      success: false,
      message: `Redis search update failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  }
}
