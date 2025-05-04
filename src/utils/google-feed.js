/**
 * Utility functions for generating Google Merchant Center XML feed
 */

// Import the category mapping
const { getGoogleCategory } = require('../../data/category-mapping');

/**
 * Creates an XML feed for Google Merchant Center from WooCommerce products
 * @param {Array} products - Array of WooCommerce product objects
 * @returns {string} XML content as string
 */
function createXmlFeed(products) {
  // Get store information from environment variables
  const storeName = process.env.NEXT_PUBLIC_SITE_NAME || 'Groovy Gallery Designs';
  const storeUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://groovygallerydesigns.com';
  
  // Start building the XML
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>${storeName} Products</title>
    <link>${storeUrl}</link>
    <description>Latest products from ${storeName}</description>
`;

  // Process each product
  products.forEach(product => {
    // Skip products that don't have required fields
    if (!product.id || !product.name || !product.price) return;
    
    // Check if the product has variations
    if (product.type === 'variable' && product.variations && product.variations.length > 0) {
      // Process each variation as a separate item
      xml = processVariations(product, xml);
    } else {
      // Process simple product
      xml += createProductXml(product);
    }
  });
  
  // Close the XML
  xml += `  </channel>
</rss>`;

  return xml;
}

/**
 * Process product variations and add them to the XML feed
 * @param {Object} product - Parent product
 * @param {String} xml - Existing XML string
 * @returns {String} Updated XML with variations
 */
function processVariations(product, xml) {
  let updatedXml = xml;
  
  // Skip if no variations
  if (!product.variations || product.variations.length === 0) {
    return updatedXml;
  }
  
  // Process each variation
  product.variations.forEach(variation => {
    // Create a variant product object with necessary fields
    const variantProduct = {
      ...variation,
      parent_id: product.id,
      name: product.name,
      description: product.description,
      short_description: product.short_description,
      categories: product.categories,
      slug: product.slug,
      permalink: variation.permalink || product.permalink,
      // Ensure variation has images - use parent product images if not available
      images: variation.image ? 
        [variation.image, ...(product.images || [])] : 
        product.images
    };
    
    // Extract attributes from variation
    if (variation.attributes && variation.attributes.length > 0) {
      variantProduct.variation_attributes = variation.attributes;
    }
    
    // Add the variation to XML
    updatedXml += createProductXml(variantProduct);
  });
  
  return updatedXml;
}

/**
 * Creates XML for a single product
 * @param {Object} product - WooCommerce product
 * @returns {string} XML string for the product
 */
function createProductXml(product) {
  let productXml = `\n  <item>`;
  
  // Basic product information
  const productId = product.id;
  const parentId = product.parent_id || product.id;
  const itemGroupId = parentId !== productId ? parentId : null;
  
  // Use SKU if available, otherwise use ID
  const productSku = product.sku || `product-${productId}`;
  
  productXml += `\n      <g:id>${escapeXml(productSku)}</g:id>`;
  if (itemGroupId) {
    productXml += `\n      <g:item_group_id>${escapeXml(parentId.toString())}</g:item_group_id>`;
  }
  
  productXml += `\n      <g:title>${escapeXml(product.name)}</g:title>`;
  
  // Use short description if available, otherwise use regular description
  const description = product.short_description || product.description || '';
  // Strip HTML tags from description
  const strippedDescription = description.replace(/<\/?[^>]+(>|$)/g, "");
  // If description is empty, use the product name as the description
  const finalDescription = strippedDescription.trim() ? strippedDescription : `${product.name} - Festival and rave wear from Groovy Gallery Designs`;
  productXml += `\n      <g:description>${escapeXml(finalDescription)}</g:description>`;
  
  // Product URL - ensure we're using the exact domain registered in Google Merchant Center
  let slug = product.slug;
  
  // If product has a permalink, extract the slug from it
  if (product.permalink) {
    // Extract the slug from the permalink
    const permalinkParts = product.permalink.split('/');
    // Get the last non-empty part before any query parameters
    for (let i = permalinkParts.length - 1; i >= 0; i--) {
      if (permalinkParts[i] && !permalinkParts[i].includes('?')) {
        slug = permalinkParts[i];
        break;
      }
    }
  }
  
  // Fallback to generating a slug from the name if needed
  if (!slug) {
    slug = product.name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
  }
  
  // Use the correct domain for the store
  const merchantDomain = "https://groovygallerydesigns.com";
  productXml += `\n      <g:link>${escapeXml(`${merchantDomain}/product-details/${slug}`)}</g:link>`;
  
  // Image URL - ensure we always have an image
  if (product.images && product.images.length > 0) {
    // Use the direct image URL from the product data
    productXml += `\n      <g:image_link>${escapeXml(product.images[0].src)}</g:image_link>`;
    
    // Add additional images if available
    for (let i = 1; i < Math.min(product.images.length, 10); i++) {
      productXml += `\n      <g:additional_image_link>${escapeXml(product.images[i].src)}</g:additional_image_link>`;
    }
  }
  
  // Availability
  const availability = product.stock_status === 'instock' ? 'in stock' : 'out of stock';
  productXml += `\n      <g:availability>${availability}</g:availability>`;
  
  // Price
  const price = product.price || product.regular_price || '0';
  productXml += `\n      <g:price>${price} USD</g:price>`;
  
  // Sale price - always set to the same as regular price
  productXml += `\n      <g:sale_price>${price} USD</g:sale_price>`;
  
  // Condition (assuming all products are new)
  productXml += `\n      <g:condition>new</g:condition>`;
  
  // Brand - only include if product has a specific brand
  // For products that truly don't have a brand, leave this field empty
  if (product.brand && product.brand.trim() !== '') {
    productXml += `\n      <g:brand>${escapeXml(product.brand)}</g:brand>`;
  }
  
  // MPN (Manufacturer Part Number) - using SKU if available
  if (product.sku) {
    productXml += `\n      <g:mpn>${escapeXml(product.sku)}</g:mpn>`;
  }
  
  // Product type (category)
  const productType = determineProductType(product);
  if (productType) {
    productXml += `\n      <g:product_type>${escapeXml(productType)}</g:product_type>`;
    
    // Google product category - map from WooCommerce category
    const googleCategory = mapToGoogleCategory(productType);
    if (googleCategory) {
      productXml += `\n      <g:google_product_category>${escapeXml(googleCategory)}</g:google_product_category>`;
    }
  }
  
  // Add variant-specific attributes if this is a variation
  if (product.attributes || product.variation_attributes) {
    const attributes = product.variation_attributes || product.attributes || [];
    
    // Extract color information
    const colorAttribute = attributes.find(attr => 
      attr.name && (
        attr.name.toLowerCase() === 'color' || 
        attr.name.toLowerCase() === 'colour' ||
        attr.name.toLowerCase() === 'pa_color' ||
        attr.name.toLowerCase() === 'pa_colour'
      )
    );
    
    if (colorAttribute && colorAttribute.option && colorAttribute.option.trim() !== '') {
      productXml += `\n      <g:color>${escapeXml(colorAttribute.option)}</g:color>`;
    } else {
      // Try to determine color from product name or other attributes
      const color = determineColor(product);
      if (color) {
        productXml += `\n      <g:color>${escapeXml(color)}</g:color>`;
      }
    }
    
    // Extract size information
    const sizeAttribute = attributes.find(attr => 
      attr.name && (
        attr.name.toLowerCase() === 'size' || 
        attr.name.toLowerCase() === 'pa_size'
      )
    );
    
    if (sizeAttribute && sizeAttribute.option && sizeAttribute.option.trim() !== '') {
      productXml += `\n      <g:size>${escapeXml(sizeAttribute.option)}</g:size>`;
    } else {
      // Try to determine size from product name or other attributes
      const size = determineSize(product);
      if (size) {
        productXml += `\n      <g:size>${escapeXml(size)}</g:size>`;
      }
    }
    
    // Process all other attributes
    attributes.forEach(attr => {
      if (attr.name && attr.option && attr.option.trim() !== '') {
        const attrName = attr.name.toLowerCase();
        
        // Skip color and size as they're already handled
        if (attrName === 'color' || attrName === 'colour' || 
            attrName === 'pa_color' || attrName === 'pa_colour' || 
            attrName === 'size' || attrName === 'pa_size') {
          return;
        }
        
        // Skip "ships from" attributes
        if (attrName.includes('ships') || attrName.includes('shipping') || 
            attrName.includes('from') || attrName.includes('ships_from')) {
          return;
        }
        
        // Skip "not included" attributes
        if (attrName.includes('not_included') || attrName.includes('not included')) {
          return;
        }
        
        // Add as custom attribute with underscores instead of spaces
        const safeAttrName = attrName.replace(/\s+/g, '_').replace(/^pa_/, '');
        productXml += `\n      <g:${safeAttrName}>${escapeXml(attr.option)}</g:${safeAttrName}>`;
      }
    });
  }
  
  // Add apparel-specific attributes
  // Gender
  const gender = determineGender(product);
  if (gender) {
    productXml += `\n      <g:gender>${escapeXml(gender)}</g:gender>`;
  }
  
  // Age group
  const ageGroup = determineAgeGroup(product);
  if (ageGroup) {
    productXml += `\n      <g:age_group>${escapeXml(ageGroup)}</g:age_group>`;
  }
  
  // Add shipping information
  productXml += `\n      <g:shipping>`;
  productXml += `\n        <g:country>US</g:country>`;
  productXml += `\n        <g:service>Standard</g:service>`;
  productXml += `\n        <g:price>0 USD</g:price>`; // Free shipping
  productXml += `\n      </g:shipping>`;
  
  // Add custom attributes for sunglasses
  if (productType && productType.toLowerCase().includes('sunglasses')) {
    if (product.attributes) {
      const lensesColor = product.attributes.find(attr => attr.name === 'Lenses Color');
      if (lensesColor && lensesColor.options && lensesColor.options.length > 0) {
        productXml += `\n      <g:lens_color>${escapeXml(lensesColor.options[0])}</g:lens_color>`;
      }
      
      const frameColor = product.attributes.find(attr => attr.name === 'Frame Color');
      if (frameColor && frameColor.options && frameColor.options.length > 0) {
        productXml += `\n      <g:frame_color>${escapeXml(frameColor.options[0])}</g:frame_color>`;
      }
    }
  }
  
  productXml += `\n  </item>`;
  return productXml;
}

/**
 * Determines if a product is an apparel item based on categories or name
 * @param {Object} product - WooCommerce product
 * @returns {boolean} True if product is apparel
 */
function isApparelProduct(product) {
  const apparelKeywords = [
    'shirt', 'top', 'dress', 'skirt', 'pants', 'leggings', 'shorts', 'hat', 
    'cap', 'boots', 'shoes', 'footwear', 'jacket', 'hoodie', 'sweatshirt', 
    'bikini', 'swimwear', 'bottoms', 'clothing', 'apparel', 'wear', 'outfit'
  ];
  
  // Check product name
  const productNameLower = product.name.toLowerCase();
  if (apparelKeywords.some(keyword => productNameLower.includes(keyword))) {
    return true;
  }
  
  // Check categories
  if (product.categories && product.categories.length > 0) {
    const categoryNames = product.categories.map(cat => cat.name.toLowerCase());
    if (categoryNames.some(name => apparelKeywords.some(keyword => name.includes(keyword)))) {
      return true;
    }
  }
  
  return false;
}

/**
 * Determines gender from product name or categories
 * @param {Object} product - WooCommerce product
 * @returns {string|null} Gender or null if not determinable
 */
function determineGender(product) {
  const productNameLower = product.name.toLowerCase();
  const description = (product.short_description || product.description || '').toLowerCase();
  
  // Check for explicit gender mentions
  if (productNameLower.includes('women') || 
      productNameLower.includes('womens') || 
      productNameLower.includes('female') || 
      description.includes('women') || 
      description.includes('womens') || 
      description.includes('female')) {
    return 'female';
  }
  
  if (productNameLower.includes('men') || 
      productNameLower.includes('mens') || 
      productNameLower.includes('male') || 
      description.includes('men') || 
      description.includes('mens') || 
      description.includes('male')) {
    return 'male';
  }
  
  // Check categories for gender hints
  if (product.categories && product.categories.length > 0) {
    const categoryNames = product.categories.map(cat => cat.name.toLowerCase());
    if (categoryNames.some(name => name.includes('women') || name.includes('female'))) {
      return 'female';
    }
    if (categoryNames.some(name => name.includes('men') || name.includes('male'))) {
      return 'male';
    }
  }
  
  // Check variation attributes for gender
  if (product.variation_attributes) {
    const genderAttr = product.variation_attributes.find(attr => 
      attr.name.toLowerCase() === 'gender'
    );
    if (genderAttr && genderAttr.option) {
      return genderAttr.option.toLowerCase();
    }
  }
  
  // Default to unisex if we can't determine
  return 'unisex';
}

/**
 * Determines the age group for a product
 * @param {Object} product - WooCommerce product
 * @returns {string} Age group (adult, kids, toddler, infant, newborn)
 */
function determineAgeGroup(product) {
  // Check product name for age indicators
  const productName = product.name.toLowerCase();
  
  if (productName.includes('children') || 
      productName.includes('kids') || 
      productName.includes('child') || 
      productName.includes('youth') || 
      productName.includes('junior')) {
    return 'kids';
  } else if (productName.includes('toddler')) {
    return 'toddler';
  } else if (productName.includes('infant') || productName.includes('baby')) {
    return 'infant';
  } else if (productName.includes('newborn')) {
    return 'newborn';
  }
  
  // Default to adult for most products
  return 'adult';
}

/**
 * Extracts color information from product name or attributes
 * @param {Object} product - WooCommerce product
 * @returns {string|null} Color or null if not determinable
 */
function determineColor(product) {
  // Check variation attributes first for color
  if (product.variation_attributes) {
    const colorAttr = product.variation_attributes.find(attr => 
      attr.name.toLowerCase() === 'color' || 
      attr.name.toLowerCase() === 'colour'
    );
    if (colorAttr && colorAttr.option && colorAttr.option.trim() !== '') {
      return colorAttr.option;
    }
  }
  
  // Common colors to look for
  const commonColors = [
    'red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'black', 
    'white', 'gray', 'grey', 'brown', 'teal', 'turquoise', 'silver', 'gold',
    'multicolor', 'rainbow', 'tie-dye', 'neon', 'pastel', 'metallic'
  ];
  
  // Check product name for color mentions
  const productNameLower = product.name.toLowerCase();
  for (const color of commonColors) {
    if (productNameLower.includes(color)) {
      return color;
    }
  }
  
  // Check product attributes for color
  if (product.attributes && product.attributes.length > 0) {
    const colorAttribute = product.attributes.find(attr => 
      attr.name.toLowerCase() === 'color' || 
      attr.name.toLowerCase() === 'colour'
    );
    
    if (colorAttribute && colorAttribute.options && colorAttribute.options.length > 0 && 
        colorAttribute.options[0] && colorAttribute.options[0].trim() !== '') {
      return colorAttribute.options[0];
    }
  }
  
  // Check description for color mentions
  const description = (product.short_description || product.description || '').toLowerCase();
  for (const color of commonColors) {
    if (description.includes(color)) {
      return color;
    }
  }
  
  // If we can't determine a specific color, use a default
  return 'multi';
}

/**
 * Extracts size information from product attributes
 * @param {Object} product - WooCommerce product
 * @returns {string|null} Size or null if not determinable
 */
function determineSize(product) {
  // Check variation attributes first for size
  if (product.variation_attributes) {
    const sizeAttr = product.variation_attributes.find(attr => 
      attr.name.toLowerCase() === 'size'
    );
    if (sizeAttr && sizeAttr.option && sizeAttr.option.trim() !== '') {
      return sizeAttr.option;
    }
  }
  
  // Check product attributes for size
  if (product.attributes && product.attributes.length > 0) {
    const sizeAttribute = product.attributes.find(attr => 
      attr.name.toLowerCase() === 'size'
    );
    
    if (sizeAttribute && sizeAttribute.options && sizeAttribute.options.length > 0 && 
        sizeAttribute.options[0] && sizeAttribute.options[0].trim() !== '') {
      return sizeAttribute.options[0];
    }
  }
  
  // Check for size in variations
  if (product.variations && product.variations.length > 0) {
    for (const variation of product.variations) {
      if (variation.attributes && variation.attributes.length > 0) {
        const sizeAttr = variation.attributes.find(attr => 
          attr.name.toLowerCase() === 'size'
        );
        
        if (sizeAttr && sizeAttr.option && sizeAttr.option.trim() !== '') {
          return sizeAttr.option;
        }
      }
    }
  }
  
  return null;
}

/**
 * Determines the product type from categories
 * @param {Object} product - WooCommerce product
 * @returns {string} Product type
 */
function determineProductType(product) {
  // Check if product has categories
  if (product.categories && product.categories.length > 0) {
    // Look for specific categories first
    for (const category of product.categories) {
      const categoryName = category.name.toLowerCase();
      
      if (categoryName.includes('sunglasses') || categoryName.includes('glasses')) {
        return 'Sunglasses';
      } else if (categoryName.includes('costume')) {
        return 'Costume';
      } else if (categoryName.includes('jumpsuit') || categoryName.includes('bodysuit')) {
        return 'Jumpsuit';
      } else if (categoryName.includes('dress')) {
        return 'Dress';
      } else if (categoryName.includes('boots')) {
        return 'Boots';
      } else if (categoryName.includes('shoes')) {
        return 'Shoes';
      } else if (categoryName.includes('blanket')) {
        return 'Blanket';
      } else if (categoryName.includes('tapestry')) {
        return 'Tapestry';
      } else if (categoryName.includes('hat')) {
        return 'Hat';
      }
    }
    
    // If no specific category was found, use the first category
    return product.categories[0].name;
  }
  
  // Check product name for common category keywords
  const productName = product.name.toLowerCase();
  if (productName.includes('sunglasses') || productName.includes('glasses')) {
    return 'Sunglasses';
  } else if (productName.includes('boots') || productName.includes('shoes')) {
    return 'Footwear';
  } else if (productName.includes('jumpsuit') || productName.includes('bodysuit')) {
    return 'Jumpsuit';
  } else if (productName.includes('costume')) {
    return 'Costume';
  } else if (productName.includes('dress')) {
    return 'Dress';
  } else if (productName.includes('hoodie')) {
    return 'Apparel > Hoodies';
  } else if (productName.includes('blanket')) {
    return 'Blanket';
  } else if (productName.includes('tapestry')) {
    return 'Tapestry';
  } else if (productName.includes('hat') || productName.includes('cap')) {
    return 'Hat';
  } else if (productName.includes('festival')) {
    return 'Festival Wear';
  } else if (productName.includes('rave')) {
    return 'Rave Wear';
  }
  
  // Default to generic category
  return 'Festival & Rave Accessories';
}

/**
 * Maps WooCommerce categories to Google product categories
 * @param {string} productType - WooCommerce product type/category
 * @returns {string} Google product category
 */
function mapToGoogleCategory(productType) {
  // Use the category mapping function from our mapping file
  return getGoogleCategory(productType);
}

/**
 * Escapes special characters for XML
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeXml(text) {
  if (!text) return '';
  
  return text
    .toString()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

module.exports = {
  createXmlFeed
};
