import type { NextApiRequest, NextApiResponse } from 'next';
import Redis from 'ioredis';
import { decodeHtmlEntities } from '../../lib/woocommerce';

// Create Redis client instance for search with type assertions
const redisSearch = new Redis({
  port: 6380,
  host: 'localhost',
}) as Redis & {
  get(key: string): Promise<string | null>;
  smembers(key: string): Promise<string[]>;
};

type SearchResult = {
  products: any[];
  message?: string;
};

/**
 * Search API endpoint
 * Queries the Redis search database for products
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SearchResult>
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ products: [], message: 'Method not allowed' });
  }

  const { query } = req.query;
  
  if (!query || typeof query !== 'string') {
    return res.status(400).json({ products: [], message: 'Search query is required' });
  }

  try {
    // Convert query to lowercase for case-insensitive search
    const searchTerm = query.toLowerCase();
    
    // Split search term into words
    const words = searchTerm.split(' ').filter(word => word.length > 2);
    
    // Get product IDs that match any of the words
    const productIds = new Set<string>();
    
    // First try exact name match
    const exactMatch = await redisSearch.get(`product_name:${searchTerm}`);
    if (exactMatch) {
      productIds.add(exactMatch);
    }
    
    // Then try word matches
    for (const word of words) {
      console.log(`Searching for word: ${word}`);
      const ids = await redisSearch.smembers(`word:${word}`);
      console.log(`Found ${ids.length} matches for word: ${word}`);
      ids.forEach((id: string) => productIds.add(id));
      
      // Try partial word matches too (if word is 3+ characters)
      if (word.length >= 3) {
        const partialIds = await redisSearch.smembers(`partial:${word}`);
        console.log(`Found ${partialIds.length} partial matches for: ${word}`);
        partialIds.forEach((id: string) => productIds.add(id));
      }
    }
    
    // Then try category name matches
    const categoryMatches = await redisSearch.smembers(`category_name:${searchTerm}`);
    console.log(`Found ${categoryMatches.length} category matches for: ${searchTerm}`);
    categoryMatches.forEach((id: string) => productIds.add(id));
    
    // Get full product data for each ID
    const products = [];
    // Convert the Set to an Array for iteration to avoid TypeScript errors
    const productIdArray = Array.from(productIds);
    for (const id of productIdArray) {
      const productData = await redisSearch.get(`product:${id}`);
      if (productData) {
        const product = JSON.parse(productData);
        
        // Decode HTML entities in product name and categories
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
        
        products.push(product);
      }
    }
    
    // Return the results
    console.log(`Total unique products found: ${productIds.size}`);
    return res.status(200).json({ 
      products,
      message: products.length > 0 ? `Found ${products.length} products` : 'No products found'
    });
    
  } catch (error) {
    console.error('Search error:', error);
    return res.status(500).json({ 
      products: [], 
      message: 'Error searching products' 
    });
  }
}
