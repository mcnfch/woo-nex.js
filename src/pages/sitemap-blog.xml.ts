import { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  // Use the PUBLIC_DOMAIN environment variable for the domain
  const domain = `https://${process.env.PUBLIC_DOMAIN || 'dev.forbush.biz'}`;
  
  // Get current date in ISO format for lastmod
  const currentDate = new Date().toISOString();
  
  // Since we're following the "Keep It Simple" principle, we're implementing
  // a placeholder for blog posts that can be enhanced later when the blog feature
  // is more developed. This follows the project rules of not overcomplicating things.
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${domain}/blog</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
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
export default function SitemapBlog() {
  // This component doesn't render anything
  return null;
}
