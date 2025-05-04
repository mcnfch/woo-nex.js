import { NextApiRequest, NextApiResponse } from 'next';
import { fetchAllProducts } from '../../../lib/woocommerce';
import fs from 'fs';
import path from 'path';

// Import the Google feed utility using require since it's a CommonJS module
const { createXmlFeed } = require('../../../utils/google-feed');

/**
 * API route to serve the Google Merchant Center XML feed
 * This can be accessed at /api/googlefeed
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Check if the request method is GET
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Path to the static XML file
    const googleFeedDir = path.join(process.cwd(), 'public', 'googlefeed');
    const xmlFilePath = path.join(googleFeedDir, 'google-feed.xml');
    
    // For development, always regenerate the file to ensure we have the latest changes
    const isDev = process.env.NODE_ENV === 'development';
    
    // Check if the XML file exists and is not older than 12 hours (unless in dev mode)
    let xmlContent;
    let shouldGenerateNewFile = isDev;
    
    if (!isDev && fs.existsSync(xmlFilePath)) {
      const stats = fs.statSync(xmlFilePath);
      const fileModifiedTime = new Date(stats.mtime).getTime();
      const currentTime = new Date().getTime();
      const twelveHoursInMs = 12 * 60 * 60 * 1000;
      
      // If file is less than 12 hours old, use it
      if (currentTime - fileModifiedTime < twelveHoursInMs) {
        xmlContent = fs.readFileSync(xmlFilePath, 'utf-8');
        shouldGenerateNewFile = false;
      }
    }
    
    // If we need to generate a new file or the file doesn't exist
    if (shouldGenerateNewFile) {
      // Fetch products from WooCommerce
      const products = await fetchAllProducts();
      
      // Generate XML feed
      xmlContent = createXmlFeed(products);
      
      // Ensure the directory exists
      if (!fs.existsSync(googleFeedDir)) {
        fs.mkdirSync(googleFeedDir, { recursive: true });
      }
      
      // Write to file for caching
      fs.writeFileSync(xmlFilePath, xmlContent);
    }
    
    // Set the content type to XML
    res.setHeader('Content-Type', 'application/xml');
    res.status(200).send(xmlContent);
  } catch (error) {
    console.error('Error generating Google Merchant Center feed:', error);
    res.status(500).json({ error: 'Failed to generate Google Merchant Center feed' });
  }
}
