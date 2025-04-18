'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface CategoryCardProps {
  id: number;
  name: string;
  slug: string;
  count: number;
  image?: {
    src: string;
    alt?: string;
  };
  className?: string;
  displayStyle?: 'compact' | 'standard' | 'featured';
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  name,
  slug,
  count,
  image,
  className = '',
  displayStyle = 'standard'
}) => {
  // Default placeholder image when no image is provided
  const placeholderImg = '/images/placeholder-category.jpg';

  // Process the image URL to remove WordPress CDN prefix and query params
  let processedImageUrl = image?.src || placeholderImg;
  
  // Specifically remove i0.wp.com/ from the image URL if present
  if (image?.src) {
    try {
      // Remove i0.wp.com/ prefix
      processedImageUrl = image.src.replace(/^https?:\/\/i0\.wp\.com\//, '');
      
      // Also handle other WordPress CDN prefixes
      processedImageUrl = processedImageUrl.replace(/^https?:\/\/i[1-2]\.wp\.com\//, '');
      
      // Ensure URL starts with https:// if it doesn't already
      if (!processedImageUrl.startsWith('http')) {
        processedImageUrl = 'https://' + processedImageUrl;
      }
      
      // Remove query string
      processedImageUrl = processedImageUrl.split('?')[0];
    } catch (e) {
      console.error("Error processing image URL:", image.src, e);
      processedImageUrl = image.src; // Use original as last resort
    }
  }

  // Card styles based on display style
  const cardStyles = {
    compact: {
      card: 'w-full max-w-[200px] h-[150px] rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow',
      imageContainer: 'h-[100px] relative',
      contentContainer: 'p-2 text-center',
      title: 'text-sm font-medium truncate',
      count: 'text-xs text-gray-500',
    },
    standard: {
      card: 'w-full max-w-[300px] h-[250px] rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow',
      imageContainer: 'h-[150px] relative',
      contentContainer: 'p-4',
      title: 'text-lg font-semibold truncate',
      count: 'text-sm text-gray-600 mt-1',
    },
    featured: {
      card: 'w-full max-w-[350px] h-[300px] rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow',
      imageContainer: 'h-[200px] relative',
      contentContainer: 'p-5',
      title: 'text-xl font-bold truncate',
      count: 'text-base text-gray-700 mt-2',
    }
  };
  
  const styles = cardStyles[displayStyle];

  return (
    <Link 
      href={`/product-category/${slug}`}
      className={`block ${styles.card} ${className}`}
    >
      <div className={styles.imageContainer}>
        <Image
          src={processedImageUrl} 
          alt={image?.alt || `${name} category`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          style={{ objectFit: 'cover' }}
          priority={displayStyle === 'featured'}
        />
      </div>
      <div className={styles.contentContainer}>
        <h3 className={styles.title}>{name}</h3>
        <p className={styles.count}>{count} product{count !== 1 ? 's' : ''}</p>
      </div>
    </Link>
  );
};

export default CategoryCard;
