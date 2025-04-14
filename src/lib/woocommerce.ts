// WooCommerce API utility functions

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  parent: number;
  count: number;
  menu_order: number;
  display: string;
  image?: {
    id?: number;
    src?: string;
    alt?: string;
  };
}

// Sample descriptions for each category type
export const CATEGORY_DESCRIPTIONS = {
  'new-arrivals': 'New Festival Fashion Arrivals | Latest Rave Wear Be the first to shop our newest festival fashion arrivals. Discover the latest trends in rave wear, accessories, and festival essentials.',
  'accessories': 'Festival Accessories | Essential Rave Gear Complete your festival look with our range of accessories. From practical bags to stylish accessories, find everything you need to enhance your festival experience.',
  'women': 'Women\'s Festival Fashion | Rave Wear &amp; Accessories Explore our women\'s festival fashion collection. From stunning rave wear to essential accessories, find everything you need for your next festival adventure.',
  'men': 'Men\'s Festival Fashion | Rave Wear &amp; Essentials Discover our men\'s festival fashion collection. From comfortable rave wear to practical accessories, gear up for your next festival experience.',
  'groovy-gear': 'Groovy Gear | Festival Comfort Essentials Stay comfortable at your next festival with our Groovy Gear collection. From cozy blankets to practical accessories, we\'ve got your festival comfort covered.',
  'custom-designs': 'Create your own unique piece with our custom design service'
};

// Default placeholder images for each category
export const DEFAULT_IMAGES = {
  'new-arrivals': 'https://ggbe.groovygallerydesigns.com/wp-content/uploads/2024/12/1723752480-1-1WAIpNwMu4__71002.1728046691.1280.1280.jpg',
  'accessories': 'https://ggbe.groovygallerydesigns.com/wp-content/uploads/2024/12/1048_source_1723725947__60340.1728046622.1280.1280.jpg',
  'women': 'https://ggbe.groovygallerydesigns.com/wp-content/uploads/2025/01/DFDG-Background-Removed.png',
  'men': 'https://ggbe.groovygallerydesigns.com/wp-content/uploads/2024/12/162108-4bfea204-3779-4346-9ceb-28e889972aed__02886.1728810902.1280.1280.jpg',
  'groovy-gear': 'https://ggbe.groovygallerydesigns.com/wp-content/uploads/2024/12/1723955632-1-jmW6702KIr__91088.1728046870.1280.1280.jpg',
  'custom-designs': 'https://ggbe.groovygallerydesigns.com/wp-content/uploads/2024/12/muckingfuch_Rainbow_Mandelbrot_fractal.png'
};

// Featured category slugs in the order we want to display them
export const FEATURED_CATEGORY_SLUGS = ['new-arrivals', 'accessories', 'women', 'men', 'groovy-gear'];

/**
 * Fetch categories from WooCommerce API
 * @param parent Optional parent ID to filter categories
 * @returns Array of categories
 */
export async function getCategories(parent?: number): Promise<Category[]> {
  try {
    // WooCommerce API credentials from environment variables
    const consumerKey = process.env.NEXT_PUBLIC_WOOCOMMERCE_KEY;
    const consumerSecret = process.env.NEXT_PUBLIC_WOOCOMMERCE_SECRET;
    const woocommerceUrl = process.env.NEXT_PUBLIC_WOOCOMMERCE_URL;

    if (!consumerKey || !consumerSecret || !woocommerceUrl) {
      throw new Error('WooCommerce API credentials not found in environment variables');
    }

    // Create authentication string for Basic Auth
    const authString = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

    // Build the API URL with parameters
    let apiUrl = `${woocommerceUrl}/wp-json/wc/v3/products/categories?per_page=100`;
    
    // Add parent parameter if provided
    if (parent !== undefined) {
      apiUrl += `&parent=${parent}`;
    }

    // Make the request to WooCommerce API
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/json',
      },
      next: { 
        revalidate: 3600 // Revalidate every hour
      }
    });

    if (!response.ok) {
      throw new Error(`WooCommerce API responded with status: ${response.status}`);
    }

    const categories = await response.json();

    // Filter out uncategorized category
    return categories.filter((cat: Category) => cat.slug !== 'uncategorized');
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

/**
 * Process categories for display
 * @param categories Raw categories from API
 * @param featuredSlugs Optional array of category slugs to feature
 * @returns Processed categories with fallback data
 */
export function processCategories(categories: Category[], featuredSlugs: string[] = FEATURED_CATEGORY_SLUGS): Category[] {
  // If we have specific featured categories, display those in the specified order
  if (featuredSlugs.length > 0) {
    return featuredSlugs.map(slug => {
      // Find the category in our fetched data
      const category = categories.find(cat => cat.slug === slug);
      
      // If not found, create a fallback category with default data
      if (!category) {
        return {
          id: Math.random(),
          name: slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          slug,
          description: CATEGORY_DESCRIPTIONS[slug as keyof typeof CATEGORY_DESCRIPTIONS] || '',
          count: 0,
          parent: 0,
          menu_order: 0,
          display: 'default',
          image: { 
            src: DEFAULT_IMAGES[slug as keyof typeof DEFAULT_IMAGES] || '',
            alt: `${slug} category image`
          }
        };
      }
      
      return {
        ...category,
        description: category.description || CATEGORY_DESCRIPTIONS[slug as keyof typeof CATEGORY_DESCRIPTIONS] || '',
        image: {
          ...category.image,
          src: category.image?.src || DEFAULT_IMAGES[slug as keyof typeof DEFAULT_IMAGES] || ''
        }
      };
    });
  }
  
  // Otherwise, show top-level categories sorted by menu_order
  return categories
    .filter(cat => cat.parent === 0 && cat.count > 0)
    .sort((a, b) => {
      // Sort by menu_order first, then by name
      if (a.menu_order === b.menu_order) {
        return a.name.localeCompare(b.name);
      }
      return a.menu_order - b.menu_order;
    })
    .slice(0, 5)
    .map(category => ({
      ...category,
      description: category.description || 
        CATEGORY_DESCRIPTIONS[category.slug as keyof typeof CATEGORY_DESCRIPTIONS] || 
        `Explore our collection of ${category.name.toLowerCase()} for your festival needs.`,
      image: {
        ...category.image,
        src: category.image?.src || 
          DEFAULT_IMAGES[category.slug as keyof typeof DEFAULT_IMAGES] || 
          '/images/placeholder.jpg'
      }
    }));
}

/**
 * Product variation interface
 */
export interface ProductVariation {
  id: number;
  sku: string;
  price: string;
  regular_price: string;
  sale_price: string;
  stock_quantity: number;
  stock_status: string;
  attributes: {
    name: string;
    option: string;
  }[];
  image: {
    id: number;
    src: string;
    alt: string;
  };
}

/**
 * Product interface
 */
export interface Product {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  date_created: string;
  type: string;
  status: string;
  featured: boolean;
  description: string;
  short_description: string;
  price: string;
  regular_price: string;
  sale_price: string;
  on_sale: boolean;
  sku?: string;
  categories: {
    id: number;
    name: string;
    slug: string;
  }[];
  tags: {
    id: number;
    name: string;
    slug: string;
  }[];
  images: {
    id: number;
    src: string;
    alt: string;
  }[];
  attributes?: {
    id: number;
    name: string;
    position: number;
    visible: boolean;
    variation: boolean;
    options: string[];
  }[];
  variations?: ProductVariation[];
  meta_data?: {
    key: string;
    value: any;
  }[];
}

/**
 * Fetch all products from WooCommerce API across multiple pages
 * @param categoryId Optional category ID to filter products
 * @param perPage Number of products to fetch per page
 * @returns Array of all products
 */
export async function getProducts(categoryId?: number, perPage: number = 20): Promise<Product[]> {
  try {
    // WooCommerce API credentials from environment variables
    const consumerKey = process.env.NEXT_PUBLIC_WOOCOMMERCE_KEY;
    const consumerSecret = process.env.NEXT_PUBLIC_WOOCOMMERCE_SECRET;
    const woocommerceUrl = process.env.NEXT_PUBLIC_WOOCOMMERCE_URL;

    if (!consumerKey || !consumerSecret || !woocommerceUrl) {
      throw new Error('WooCommerce API credentials not found in environment variables');
    }

    // Create authentication string for Basic Auth
    const authString = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

    // Function to fetch a single page of products
    const fetchProductPage = async (page: number): Promise<{products: Product[], totalPages: number}> => {
      // Build the API URL with parameters
      let apiUrl = `${woocommerceUrl}/wp-json/wc/v3/products?per_page=${perPage}&page=${page}`;
      
      // Add category filter if provided
      if (categoryId) {
        apiUrl += `&category=${categoryId}`;
      }

      // Make the request to WooCommerce API
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Basic ${authString}`,
          'Content-Type': 'application/json',
        },
        next: { 
          revalidate: 3600 // Revalidate every hour
        }
      });

      if (!response.ok) {
        throw new Error(`WooCommerce API responded with status: ${response.status}`);
      }

      // Get total pages from headers
      const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '1', 10);
      
      // Return products and total pages
      return {
        products: await response.json(),
        totalPages
      };
    };

    // Fetch first page to get total pages
    const firstPageResult = await fetchProductPage(1);
    let allProducts = [...firstPageResult.products];
    
    // Fetch remaining pages if there are more than one
    if (firstPageResult.totalPages > 1) {
      const remainingPagePromises = [];
      
      // Create promises for pages 2 to totalPages
      for (let page = 2; page <= firstPageResult.totalPages; page++) {
        remainingPagePromises.push(fetchProductPage(page));
      }
      
      // Wait for all remaining pages to be fetched
      const remainingPagesResults = await Promise.all(remainingPagePromises);
      
      // Add products from remaining pages to allProducts
      for (const result of remainingPagesResults) {
        allProducts = [...allProducts, ...result.products];
      }
    }
    
    return allProducts;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

/**
 * Fetch a specific product by slug
 * @param slug The product slug to fetch
 * @returns The product or null if not found
 */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    // WooCommerce API credentials from environment variables
    const consumerKey = process.env.NEXT_PUBLIC_WOOCOMMERCE_KEY;
    const consumerSecret = process.env.NEXT_PUBLIC_WOOCOMMERCE_SECRET;
    const baseUrl = process.env.NEXT_PUBLIC_WOOCOMMERCE_URL;
    
    if (!consumerKey || !consumerSecret || !baseUrl) {
      console.error('WooCommerce API credentials or base URL are not set');
      return null;
    }

    // First try to find by slug
    let apiUrl = `${baseUrl}/wp-json/wc/v3/products?consumer_key=${consumerKey}&consumer_secret=${consumerSecret}&slug=${slug}`;
    let response = await fetch(apiUrl, { cache: 'no-store' });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch product, status: ${response.status}`);
    }
    
    let products = await response.json();
    
    // If no product found by slug, return null
    if (!products || products.length === 0) {
      return null;
    }
    
    const product = products[0];
    
    // If product is variable, fetch its variations
    if (product.type === 'variable') {
      const variationsUrl = `${baseUrl}/wp-json/wc/v3/products/${product.id}/variations?consumer_key=${consumerKey}&consumer_secret=${consumerSecret}&per_page=100`;
      const variationsResponse = await fetch(variationsUrl, { cache: 'no-store' });
      
      if (variationsResponse.ok) {
        const variations = await variationsResponse.json();
        product.variations = variations;
      } else {
        console.error('Failed to fetch variations:', variationsResponse.status);
      }
    }
    
    return product;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}
