// Schema utility functions for structured data
import { Product, Category } from './woocommerce';

/**
 * Process image URL to remove WordPress CDN prefixes
 * @param url The image URL to process
 * @returns The processed image URL
 */
export function processImageUrl(url: string): string {
  if (!url) return '';
  
  try {
    // Remove WordPress CDN prefixes (i0.wp.com, etc.)
    let normalized = url.replace(/^https?:\/\/i[0-9]\.wp\.com\//, '');
    
    // Ensure URL starts with https:// if it doesn't already
    if (!normalized.startsWith('http')) {
      normalized = `https://${normalized}`;
    }
    
    // Ensure consistent protocol (https)
    normalized = normalized.replace(/^http:\/\//, 'https://');
    
    return normalized;
  } catch (error) {
    console.error('Error processing image URL:', error);
    return url;
  }
}

/**
 * Generate JSON-LD schema for a product
 * @param product The product data
 * @returns Schema.org Product schema
 */
export function generateProductSchema(product: Product) {
  // Base URL for absolute URLs in schema
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://groovygallerydesigns.com';
  
  // Process image URLs
  const images = product.images && product.images.length > 0 
    ? product.images.map(img => processImageUrl(img.src))
    : [];
  
  // Format price to ensure it's a valid number string without currency symbols
  const price = product.price ? product.price.replace(/[^0-9.]/g, '') : '0';
  
  // Set price valid until to one year from now
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
  const priceValidUntil = oneYearFromNow.toISOString().split('T')[0];
  
  // Create a minimal product schema that strictly follows Google's requirements
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": images.length > 0 ? images[0] : '',
    "description": product.short_description || product.description || '',
    "sku": product.sku || '',
    "brand": {
      "@type": "Brand",
      "name": "Groovy Gallery Designs"
    },
    "offers": {
      "@type": "Offer",
      "url": `${baseUrl}/product-details/${product.slug}`,
      "price": price,
      "priceCurrency": "USD",
      "priceValidUntil": priceValidUntil,
      "availability": (product as any).stock_status === 'instock' 
        ? "https://schema.org/InStock" 
        : "https://schema.org/OutOfStock"
    }
  };
}

/**
 * Generate JSON-LD schema for a category
 * @param category The category data
 * @param products Products in the category
 * @returns Schema.org ItemList schema
 */
export function generateCategorySchema(category: Category, products: Product[]) {
  // Base URL for absolute URLs in schema
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://groovygallerydesigns.com';
  
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": category.name,
    "description": category.description || `Products in the ${category.name} category`,
    "numberOfItems": products.length,
    "itemListElement": products.map((product, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Product",
        "name": product.name,
        "url": `${baseUrl}/product-details/${product.slug}`,
        "image": product.images && product.images.length > 0 
          ? processImageUrl(product.images[0].src)
          : '',
        "offers": {
          "@type": "Offer",
          "price": product.price ? product.price.replace(/[^0-9.]/g, '') : '0',
          "priceCurrency": "USD",
          "availability": (product as any).stock_status === 'instock' 
            ? "https://schema.org/InStock" 
            : "https://schema.org/OutOfStock"
        }
      }
    }))
  };
}

/**
 * Generate JSON-LD schema for the organization/website
 * @returns Schema.org Organization schema
 */
export function generateOrganizationSchema() {
  // Base URL for absolute URLs in schema
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://groovygallerydesigns.com';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Groovy Gallery Designs',
    url: baseUrl,
    logo: `${baseUrl}/images/logo.png`,
    sameAs: [
      'https://facebook.com/groovygallerydesigns',
      'https://instagram.com/groovygallerydesigns'
    ]
  };
}
