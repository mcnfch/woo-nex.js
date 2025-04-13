'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface ShopByCategoryCardProps {
  title: string;
  description: string;
  imageUrl: string;
  slug: string;
  className?: string;
}

const ShopByCategoryCard: React.FC<ShopByCategoryCardProps> = ({
  title,
  description,
  imageUrl,
  slug,
  className = ''
}) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 ${className}`}>
      <div className="relative h-48 sm:h-56 md:h-64 w-full">
        <Image 
          src={imageUrl} 
          alt={`${title} category`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          style={{ objectFit: 'cover' }}
        />
      </div>
      
      <div className="p-4 sm:p-5">
        <h3 className="text-lg sm:text-xl font-bold mb-2 dark:text-white">{title}</h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">{description}</p>
        
        <Link 
          href={`/product-category/${slug}`}
          className="inline-flex items-center text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 transition-colors font-medium"
        >
          Shop Now 
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-4 w-4 ml-2" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M14 5l7 7m0 0l-7 7m7-7H3" 
            />
          </svg>
        </Link>
      </div>
    </div>
  );
};

export default ShopByCategoryCard;
