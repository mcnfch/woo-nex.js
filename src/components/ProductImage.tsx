'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
}

const ProductImage: React.FC<ProductImageProps> = ({ src, alt, className = '' }) => {
  const [error, setError] = useState(false);
  
  // Fallback image
  const placeholderImg = '/images/placeholder-product.jpg';
  
  // Process the image URL before passing to the Next.js Image component
  const getProcessedUrl = (): string => {
    if (!src || error) {
      return placeholderImg;
    }
    
    try {
      // Check if this is a WordPress URL with an embedded AliExpress URL
      if (src.includes('ae01.alicdn.com')) {
        // Extract the AliExpress URL
        const aliExpressMatch = src.match(/https?:\/\/(?:i[0-2]\.wp\.com\/)?[^\/]+\/wp-content\/uploads\/(https?%3A\/\/ae01\.alicdn\.com\/[^?]+)/);
        
        if (aliExpressMatch && aliExpressMatch[1]) {
          // Decode the URL to get the direct AliExpress URL
          return decodeURIComponent(aliExpressMatch[1]);
        }
        
        // If we found alicdn.com but couldn't extract it with the pattern above,
        // try a more direct approach for URLs that might already be partially processed
        const directAliMatch = src.match(/(https?:\/\/ae01\.alicdn\.com\/[^?]+)/);
        if (directAliMatch && directAliMatch[1]) {
          return directAliMatch[1];
        }
      }
      
      // For regular WordPress images, just return without the CDN prefix and query params
      if (src.includes('wp.com')) {
        // Remove WordPress CDN prefixes
        let processedUrl = src.replace(/^https?:\/\/i[0-2]\.wp\.com\//, '');
        
        // Ensure URL starts with https:// if it doesn't already
        if (!processedUrl.startsWith('http')) {
          processedUrl = 'https://' + processedUrl;
        }
        
        // Remove query params
        return processedUrl.split('?')[0];
      }
      
      // For any other URL, just return as is but without query params
      return src.split('?')[0];
      
    } catch (e) {
      console.error("Error processing image URL:", src, e);
      return src; // Return original URL as fallback
    }
  };

  // Get the processed URL only once
  const processedUrl = getProcessedUrl();
  
  return (
    <div className={`relative ${className}`} style={{ width: '100%', height: '100%' }}>
      <Image
        src={processedUrl}
        alt={alt}
        fill
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        className="object-cover"
        onError={() => setError(true)}
      />
    </div>
  );
};

export default ProductImage;
