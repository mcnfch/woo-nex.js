import { Product } from './woocommerce';

/**
 * Check if a product has variant images
 * @param product The product to check
 * @returns Boolean indicating if any variants have unique images
 */
export function hasVariantImages(product: Product): boolean {
  // If not a variable product or no variations, return false
  if (product.type !== 'variable' || !product.variations || !Array.isArray(product.variations) || product.variations.length === 0) {
    return false;
  }

  // Get the main product image URLs for comparison
  const mainImageUrls = new Set(product.images.map(img => normalizeImageUrl(img.src)));
  
  // Check if any variation has an image that's different from the main product images
  for (const variation of product.variations) {
    if (variation.image && variation.image.src) {
      const normalizedVariationUrl = normalizeImageUrl(variation.image.src);
      
      // If this variation image is not in the main product images, then we have variant-specific images
      if (!mainImageUrls.has(normalizedVariationUrl)) {
        return true;
      }
    }
  }
  
  // No variant-specific images found
  return false;
}

/**
 * Find the matching variant image based on selected attributes
 * @param product The product with variations
 * @param selectedAttributes The currently selected attributes
 * @returns The URL of the matching variant image, or undefined if no match
 */
export function findMatchingVariantImage(
  product: Product, 
  selectedAttributes: Record<string, string>
): string | undefined {
  if (!product.variations || !Array.isArray(product.variations) || 
      Object.keys(selectedAttributes).length === 0) {
    return undefined;
  }
  
  // Find variations that match ALL selected attributes
  const matchingVariations = product.variations.filter(variation => {
    if (!variation.attributes || !Array.isArray(variation.attributes)) {
      return false;
    }
    
    // Check if ALL selected attributes match this variation
    return Object.entries(selectedAttributes).every(([attrName, attrValue]) => {
      // Find the matching attribute in this variation
      const matchingAttr = variation.attributes.find(
        attr => attr.name.toLowerCase() === attrName.toLowerCase()
      );
      
      // If attribute exists and matches the selected value
      return matchingAttr && matchingAttr.option === attrValue;
    });
  });
  
  // If we found matching variations with images, return the first one's image
  const variationWithImage = matchingVariations.find(v => v.image && v.image.src);
  if (variationWithImage?.image?.src) {
    return variationWithImage.image.src;
  }
  
  // If no exact match found, try to find a variation that matches at least one attribute
  // Prioritize color attributes as they're most likely to have unique images
  const colorAttribute = Object.entries(selectedAttributes).find(
    ([name]) => name.toLowerCase() === 'color' || name.toLowerCase() === 'colour'
  );
  
  if (colorAttribute) {
    const [colorName, colorValue] = colorAttribute;
    
    // Find variations that match this color
    const colorMatchingVariations = product.variations.filter(variation => {
      if (!variation.attributes || !Array.isArray(variation.attributes)) {
        return false;
      }
      
      return variation.attributes.some(
        attr => attr.name.toLowerCase() === colorName.toLowerCase() && 
                attr.option === colorValue
      );
    });
    
    // Return the first variation with an image
    const colorVariationWithImage = colorMatchingVariations.find(v => v.image && v.image.src);
    if (colorVariationWithImage?.image?.src) {
      return colorVariationWithImage.image.src;
    }
  }
  
  return undefined;
}

/**
 * Normalize image URLs for comparison by removing query parameters and ensuring consistent protocol
 */
function normalizeImageUrl(url: string): string {
  if (!url) return '';
  
  // Remove query parameters
  let normalized = url.split('?')[0];
  
  // Ensure consistent protocol (https)
  normalized = normalized.replace(/^http:\/\//, 'https://');
  
  // Remove CDN prefixes (i0.wp.com, etc.)
  normalized = normalized.replace(/^https:\/\/i[0-9]\.wp\.com\//, '');
  
  // Ensure URL starts with https:// if it doesn't already
  if (!normalized.startsWith('http')) {
    normalized = 'https://' + normalized;
  }
  
  return normalized;
}

/**
 * Get a mapping of variant attributes to their image
 * @param product The product with variations
 * @returns A map of attribute combinations to image URLs
 */
export function getVariantImageMap(product: Product): Map<string, string> {
  const variantImageMap = new Map<string, string>();
  
  if (!product.variations || !Array.isArray(product.variations)) {
    return variantImageMap;
  }
  
  // Get the main product image URLs for comparison
  const mainImageUrls = new Set(product.images.map(img => normalizeImageUrl(img.src)));
  
  product.variations.forEach(variation => {
    if (variation.image && variation.image.src && variation.attributes && variation.attributes.length > 0) {
      // Only include the image if it's different from all main product images
      const normalizedVariationUrl = normalizeImageUrl(variation.image.src);
      if (!mainImageUrls.has(normalizedVariationUrl)) {
        // Create a key from the attributes (e.g., "color:red,size:medium")
        const attributeKey = variation.attributes
          .map(attr => `${attr.name.toLowerCase()}:${attr.option.toLowerCase()}`)
          .sort()
          .join(',');
        
        variantImageMap.set(attributeKey, variation.image.src);
      }
    }
  });
  
  return variantImageMap;
}
