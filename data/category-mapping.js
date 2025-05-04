/**
 * Category mapping for Google Merchant Center
 * Maps our store categories to Google taxonomy categories
 */

const categoryMapping = {
  // Sunglasses
  "Festival Rave Sunglasses": "169 - Apparel & Accessories > Clothing Accessories > Sunglasses",
  "Sunglasses": "169 - Apparel & Accessories > Clothing Accessories > Sunglasses",
  
  // Costumes
  "Costume": "5353 - Apparel & Accessories > Clothing > Costumes & Accessories > Costumes",
  "Rave Costume": "5353 - Apparel & Accessories > Clothing > Costumes & Accessories > Costumes",
  "Festival Costume": "5353 - Apparel & Accessories > Clothing > Costumes & Accessories > Costumes",
  
  // Jumpsuits and Bodysuits
  "Jumpsuit": "5249 - Apparel & Accessories > Clothing > One-Pieces > Jumpsuits & Rompers",
  "Bodysuit": "5249 - Apparel & Accessories > Clothing > One-Pieces > Jumpsuits & Rompers",
  "Rave Jumpsuit": "5249 - Apparel & Accessories > Clothing > One-Pieces > Jumpsuits & Rompers",
  "Festival Jumpsuit": "5249 - Apparel & Accessories > Clothing > One-Pieces > Jumpsuits & Rompers",
  
  // Dresses
  "Dress": "1831 - Apparel & Accessories > Clothing > Dresses",
  "Festival Dress": "1831 - Apparel & Accessories > Clothing > Dresses",
  "Rave Dress": "1831 - Apparel & Accessories > Clothing > Dresses",
  
  // Boots and Shoes
  "Boots": "179 - Apparel & Accessories > Shoes > Boots",
  "Festival Boots": "179 - Apparel & Accessories > Shoes > Boots",
  "Rave Boots": "179 - Apparel & Accessories > Shoes > Boots",
  "Shoes": "178 - Apparel & Accessories > Shoes > Shoes",
  "Festival Shoes": "178 - Apparel & Accessories > Shoes > Shoes",
  "Rave Shoes": "178 - Apparel & Accessories > Shoes > Shoes",
  
  // Blankets
  "Blanket": "678 - Home & Garden > Bedding > Blankets",
  "Rave Blanket": "678 - Home & Garden > Bedding > Blankets",
  "Festival Blanket": "678 - Home & Garden > Bedding > Blankets",
  "Hoodie Blanket": "678 - Home & Garden > Bedding > Blankets",
  
  // Tapestries
  "Tapestry": "657 - Home & Garden > Decor > Tapestries",
  "Rave Tapestry": "657 - Home & Garden > Decor > Tapestries",
  "Festival Tapestry": "657 - Home & Garden > Decor > Tapestries",
  
  // Hats
  "Hat": "172 - Apparel & Accessories > Clothing Accessories > Hats",
  "Bucket Hat": "172 - Apparel & Accessories > Clothing Accessories > Hats",
  "Festival Hat": "172 - Apparel & Accessories > Clothing Accessories > Hats",
  "Rave Hat": "172 - Apparel & Accessories > Clothing Accessories > Hats",
  
  // Shirts and Tops
  "Shirt": "5183 - Apparel & Accessories > Clothing > Shirts & Tops",
  "T-Shirt": "5714 - Apparel & Accessories > Clothing > Shirts & Tops > T-Shirts",
  "Festival Shirt": "5183 - Apparel & Accessories > Clothing > Shirts & Tops",
  "Rave Shirt": "5183 - Apparel & Accessories > Clothing > Shirts & Tops",
  
  // Default fallback categories
  "Festival Accessories": "167 - Apparel & Accessories > Clothing Accessories",
  "Rave Accessories": "167 - Apparel & Accessories > Clothing Accessories",
  "Festival Wear": "1604 - Apparel & Accessories > Clothing",
  "Rave Wear": "1604 - Apparel & Accessories > Clothing",
  "Festival": "1604 - Apparel & Accessories > Clothing",
  "Rave": "1604 - Apparel & Accessories > Clothing",
  "default": "166 - Apparel & Accessories"
};

/**
 * Get Google product category based on our store category
 * @param {string} storeCategory - Our store category name
 * @returns {string} Google product category
 */
function getGoogleCategory(storeCategory) {
  if (!storeCategory) {
    return categoryMapping.default;
  }
  
  // Normalize the category name
  const normalizedCategory = storeCategory.trim().toLowerCase();
  
  // Check for exact matches first
  for (const [key, value] of Object.entries(categoryMapping)) {
    if (key.toLowerCase() === normalizedCategory) {
      return value;
    }
  }
  
  // Check for partial matches
  for (const [key, value] of Object.entries(categoryMapping)) {
    if (normalizedCategory.includes(key.toLowerCase())) {
      return value;
    }
  }
  
  // Check for keywords in the category name or product type
  if (normalizedCategory.includes('sunglasses') || normalizedCategory.includes('glasses')) {
    return "169 - Apparel & Accessories > Clothing Accessories > Sunglasses";
  } else if (normalizedCategory.includes('costume')) {
    return categoryMapping['Costume'];
  } else if (normalizedCategory.includes('jumpsuit') || normalizedCategory.includes('bodysuit')) {
    return categoryMapping['Jumpsuit'];
  } else if (normalizedCategory.includes('dress')) {
    return categoryMapping['Dress'];
  } else if (normalizedCategory.includes('boots')) {
    return categoryMapping['Boots'];
  } else if (normalizedCategory.includes('shoes')) {
    return categoryMapping['Shoes'];
  } else if (normalizedCategory.includes('blanket')) {
    return categoryMapping['Blanket'];
  } else if (normalizedCategory.includes('tapestry')) {
    return categoryMapping['Tapestry'];
  } else if (normalizedCategory.includes('hat')) {
    return categoryMapping['Hat'];
  } else if (normalizedCategory.includes('shirt')) {
    return categoryMapping['Shirt'];
  } else if (normalizedCategory.includes('festival')) {
    return categoryMapping['Festival Wear'];
  } else if (normalizedCategory.includes('rave')) {
    return categoryMapping['Rave Wear'];
  }
  
  // Default fallback
  return categoryMapping.default;
}

module.exports = {
  categoryMapping,
  getGoogleCategory
};
