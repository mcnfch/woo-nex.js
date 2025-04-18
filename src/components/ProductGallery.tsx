'use client';

import React, { useState } from 'react';
import ProductImage from './ProductImage';

interface ProductImage {
  id: number;
  src: string;
  alt: string;
}

interface ProductGalleryProps {
  images: ProductImage[];
}

const ProductGallery: React.FC<ProductGalleryProps> = ({ images }) => {
  const [activeImage, setActiveImage] = useState<number>(0);
  
  // If no images are provided, use a placeholder
  const displayImages = images && images.length > 0 
    ? images 
    : [{ id: 0, src: '/images/placeholder-product.jpg', alt: 'Product image placeholder' }];

  return (
    <div className="product-gallery">
      {/* Desktop Gallery with Thumbnails */}
      <div className="hidden md:flex gap-4">
        {/* Thumbnails */}
        <div className="flex flex-col gap-2 w-20 h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
          {displayImages.map((image, index) => (
            <button
              key={`thumb-${image.id}-${index}`}
              onClick={() => setActiveImage(index)}
              className={`relative aspect-square w-full border-2 rounded-md overflow-hidden flex-shrink-0
                ${activeImage === index 
                  ? 'border-purple-600 dark:border-purple-400' 
                  : 'border-gray-200 dark:border-gray-700'}`}
              aria-label={`View ${image.alt}`}
            >
              <ProductImage
                src={image.src}
                alt={image.alt}
                className="object-cover"
              />
            </button>
          ))}
        </div>
        
        {/* Main Image */}
        <div className="flex-1 relative aspect-square h-[500px]">
          <ProductImage
            src={displayImages[activeImage].src}
            alt={displayImages[activeImage].alt}
            className="object-contain"
          />
        </div>
      </div>

      {/* Mobile Gallery */}
      <div className="md:hidden">
        <div className="relative aspect-square mb-4">
          <ProductImage
            src={displayImages[activeImage].src}
            alt={displayImages[activeImage].alt}
            className="object-contain"
          />
        </div>
        
        {/* Mobile Thumbnails */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {displayImages.map((image, index) => (
            <button
              key={`mobile-thumb-${image.id}-${index}`}
              onClick={() => setActiveImage(index)}
              className={`relative flex-shrink-0 w-16 aspect-square border-2 rounded-md overflow-hidden
                ${activeImage === index 
                  ? 'border-purple-600 dark:border-purple-400' 
                  : 'border-gray-200 dark:border-gray-700'}`}
              aria-label={`View ${image.alt}`}
            >
              <ProductImage
                src={image.src}
                alt={image.alt}
                className="object-cover"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductGallery;
