import { GetServerSideProps } from 'next';
import { getProducts } from '../lib/woocommerce';

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  // Use the PUBLIC_DOMAIN environment variable for the domain
  const domain = `https://${process.env.PUBLIC_DOMAIN || 'dev.forbush.biz'}`;
  
  // Get products data
  let products: any[] = [];
  
  try {
    // Fetch product data using the centralized method
    products = await getProducts() || [];
  } catch (error) {
    console.error('Error fetching products for sitemap:', error);
    // Continue with empty array if fetch fails
  }
  
  // Generate the sitemap XML with products
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${products.map(product => {
    // Use the product's date_modified for lastmod if available
    const lastmod = product.date_modified 
      ? new Date(product.date_modified).toISOString()
      : new Date().toISOString();
      
    return `
  <url>
    <loc>${domain}/product-details/${product.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
  }).join('')}
</urlset>`;
  
  // Set the appropriate headers
  res.setHeader('Content-Type', 'text/xml');
  res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=60');
  
  // Send the XML to the browser
  res.write(sitemap);
  res.end();
  
  return {
    props: {},
  };
};

// Default export to prevent next.js errors
export default function SitemapProducts() {
  // This component doesn't render anything
  return null;
}
