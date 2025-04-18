import { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  // Use the PUBLIC_DOMAIN environment variable for the domain
  const domain = `https://${process.env.PUBLIC_DOMAIN || 'dev.forbush.biz'}`;
  
  // Create robots.txt content
  const robotsTxt = `# https://${process.env.PUBLIC_DOMAIN}
User-agent: *
Allow: /

# Sitemaps
Sitemap: ${domain}/sitemap.xml
`;

  // Set the content type header
  res.setHeader('Content-Type', 'text/plain');
  
  // Set cache control for better performance
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
  
  // Send the text to the browser
  res.write(robotsTxt);
  res.end();

  return {
    props: {},
  };
};

// Default export to prevent next.js errors
export default function Robots() {
  // This component doesn't render anything
  return null;
}
