import { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  // Use the PUBLIC_DOMAIN environment variable for the domain
  const domain = `https://${process.env.PUBLIC_DOMAIN || 'dev.forbush.biz'}`;
  
  // Get current date in ISO format for lastmod
  const currentDate = new Date().toISOString();
  
  // Generate the sitemap XML with static pages
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Home page -->
  <url>
    <loc>${domain}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- Static pages -->
  <url>
    <loc>${domain}/custom-designs</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
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
export default function SitemapMain() {
  // This component doesn't render anything
  return null;
}
