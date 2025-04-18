'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface VariantImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
}

const VariantImage: React.FC<VariantImageProps> = ({ 
  src, 
  alt, 
  className = '',
  fallbackSrc = '/images/placeholder-product.jpg'
}) => {
  const [error, setError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);
  
  // Update the source when the src prop changes
  useEffect(() => {
    setCurrentSrc(src);
    setError(false);
  }, [src]);
  
  // Process the image URL before passing to the Next.js Image component
  const getProcessedUrl = (): string => {
    if (!currentSrc || error) {
      return fallbackSrc;
    }
    
    try {
      // Check if this is a WordPress URL with an embedded AliExpress URL
      if (currentSrc.includes('ae01.alicdn.com')) {
        // Extract the AliExpress URL
        const aliExpressMatch = currentSrc.match(/https?:\/\/(?:i[0-2]\.wp\.com\/)?[^\/]+\/wp-content\/uploads\/(https?%3A\/\/ae01\.alicdn\.com\/[^?]+)/);
        
        if (aliExpressMatch && aliExpressMatch[1]) {
          // Decode the URL to get the direct AliExpress URL
          return decodeURIComponent(aliExpressMatch[1]);
        }
        
        // If we found alicdn.com but couldn't extract it with the pattern above,
        // try a more direct approach for URLs that might already be partially processed
        const directAliMatch = currentSrc.match(/(https?:\/\/ae01\.alicdn\.com\/[^?]+)/);
        if (directAliMatch && directAliMatch[1]) {
          return directAliMatch[1];
        }
      }
      
      // For regular WordPress images, just return without the CDN prefix and query params
      if (currentSrc.includes('wp.com')) {
        // Remove WordPress CDN prefixes
        let processedUrl = currentSrc.replace(/^https?:\/\/i[0-2]\.wp\.com\//, '');
        
        // Ensure URL starts with https:// if it doesn't already
        if (!processedUrl.startsWith('http')) {
          processedUrl = 'https://' + processedUrl;
        }
        
        // Remove query params
        return processedUrl.split('?')[0];
      }
      
      // For any other URL, just return as is but without query params
      return currentSrc.split('?')[0];
      
    } catch (e) {
      console.error('Error processing image URL:', e);
      return fallbackSrc;
    }
  };
  
  return (
    <div className={`relative w-full h-full transition-opacity duration-300 ${className}`}>
      <Image
        src={getProcessedUrl()}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-contain"
        onError={() => setError(true)}
        priority
      />
    </div>
  );
};

export default VariantImage;
