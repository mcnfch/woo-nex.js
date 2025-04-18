import { GetServerSideProps } from 'next';
import { getCategories, getProducts } from '../lib/woocommerce';

// Main sitemap index handler
export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  // Use the PUBLIC_DOMAIN environment variable for the domain
  const domain = `https://${process.env.PUBLIC_DOMAIN || 'dev.forbush.biz'}`;
  
  // Generate the sitemap index XML
  const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${domain}/sitemap-main.xml</loc>
  </sitemap>
  <sitemap>
    <loc>${domain}/sitemap-products.xml</loc>
  </sitemap>
  <sitemap>
    <loc>${domain}/sitemap-categories.xml</loc>
  </sitemap>
  <sitemap>
    <loc>${domain}/sitemap-blog.xml</loc>
  </sitemap>
</sitemapindex>`;
  
  // Set the appropriate headers
  res.setHeader('Content-Type', 'text/xml');
  res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=60');
  
  // Send the XML to the browser
  res.write(sitemapIndex);
  res.end();
  
  return {
    props: {},
  };
};

// Default export to prevent next.js errors
export default function SitemapIndex() {
  // This component doesn't render anything
  return null;
}
