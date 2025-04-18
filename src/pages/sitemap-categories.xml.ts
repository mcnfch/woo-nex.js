import { GetServerSideProps } from 'next';
import { getCategories } from '../lib/woocommerce';

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  // Use the PUBLIC_DOMAIN environment variable for the domain
  const domain = `https://${process.env.PUBLIC_DOMAIN || 'dev.forbush.biz'}`;
  
  // Get categories data
  let categories: any[] = [];
  
  try {
    // Use centralized method to fetch categories as per project rules
    categories = await getCategories() || [];
  } catch (error) {
    console.error('Error fetching categories for sitemap:', error);
    // Continue with empty array if fetch fails
  }
  
  // Current date for lastmod
  const currentDate = new Date().toISOString();
  
  // Generate the sitemap XML with categories
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${categories.map(category => `
  <url>
    <loc>${domain}/product-category/${category.slug}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('')}
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
export default function SitemapCategories() {
  // This component doesn't render anything
  return null;
}
