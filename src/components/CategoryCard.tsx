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
  if (image?.src && image.src.match(/^https:\/\/i[0-2]\.wp\.com\//)) {
    try {
      // More robust: Remove the CDN part and any query string
      const coreUrl = image.src.replace(/^https:\/\/i[0-2]\.wp\.com\//, 'https://');
      processedImageUrl = coreUrl.split('?')[0]; // Remove query string
    } catch (e) {
      console.error("Error processing WP CDN image URL:", image.src, e);
      // Fallback to original src if processing fails, potentially keeping query params if splitting fails
      try {
         processedImageUrl = image.src.split('?')[0];
      } catch { 
         processedImageUrl = image.src; // Use original as last resort
      }
    }
  } else if (image?.src) {
     // If not a wp.com URL, still attempt to remove potential query params
     try {
        processedImageUrl = image.src.split('?')[0];
     } catch {
        processedImageUrl = image.src;
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
