'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface CustomDesignCardProps {
  imageUrl: string;
  title?: string;
  description?: string;
  linkUrl?: string;
  className?: string;
}

const CustomDesignCard: React.FC<CustomDesignCardProps> = ({
  imageUrl,
  title = 'Custom Designs',
  description = 'Create your own unique piece with our custom design service',
  linkUrl = '/custom-designs',
  className = ''
}) => {
  return (
    <Link 
      href={linkUrl}
      className={`block bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md transition-transform duration-300 hover:shadow-lg hover:-translate-y-1 ${className}`}
    >
      <div className="relative h-60 w-full">
        <Image
          src={imageUrl}
          alt="Custom designs"
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          style={{ objectFit: 'cover' }}
          priority
        />
      </div>
      
      <div className="p-5">
        <h3 className="text-xl font-bold mb-2 dark:text-white">{title}</h3>
        <p className="text-gray-700 dark:text-gray-300 mb-4 text-sm line-clamp-3">{description}</p>
        
        <button 
          className="inline-flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
        >
          Start Creating 
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-4 w-4 ml-1" 
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
        </button>
      </div>
    </Link>
  );
};

export default CustomDesignCard;
