'use server'

import Redis from 'ioredis';
import { decodeHtmlEntities } from '../../lib/woocommerce';
import { Product } from '../../types/woocommerce';

// Create Redis client instance for search
const redisSearch = new Redis({
  port: 6380,
  host: 'localhost',
});

/**
 * Server action to search products
 * Directly connects to Redis without going through API route
 */
export async function searchProducts(query: string): Promise<Product[]> {
  if (!query || typeof query !== 'string' || query.length < 2) {
    return [];
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
      const ids = await redisSearch.smembers(`word:${word}`);
      ids.forEach((id: string) => productIds.add(id));
      
      // Try partial word matches too (if word is 3+ characters)
      if (word.length >= 3) {
        const partialIds = await redisSearch.smembers(`partial:${word}`);
        partialIds.forEach((id: string) => productIds.add(id));
      }
    }
    
    // Try category name matches
    const categoryMatches = await redisSearch.smembers(`category_name:${searchTerm}`);
    categoryMatches.forEach((id: string) => productIds.add(id));
    
    // Get full product data for each ID
    const products: Product[] = [];
    const productIdArray = Array.from(productIds);
    
    for (const id of productIdArray) {
      const productData = await redisSearch.get(`product:${id}`);
      if (productData) {
        try {
          const product = JSON.parse(productData) as Product;
          
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
        } catch (parseError) {
          // Skip invalid JSON products
          console.error(`Error parsing product ${id}:`, parseError);
        }
      }
    }
    
    return products;
    
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
}
