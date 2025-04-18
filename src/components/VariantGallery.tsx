'use client';

import React, { useState, useEffect } from 'react';
import VariantImage from './VariantImage';
import { Product } from '../lib/woocommerce';
import { findMatchingVariantImage } from '../lib/productUtils';

interface VariantGalleryProps {
  product: Product;
  selectedAttributes: Record<string, string>;
}

const VariantGallery: React.FC<VariantGalleryProps> = ({ 
  product,
  selectedAttributes
}) => {
  const [activeImage, setActiveImage] = useState<number>(0);
  const [variantImageSrc, setVariantImageSrc] = useState<string | undefined>(undefined);
  
  // If no images are provided, use a placeholder
  const displayImages = product.images && product.images.length > 0 
    ? product.images 
    : [{ id: 0, src: '/images/placeholder-product.jpg', alt: 'Product image placeholder' }];

  // Update the variant image when selected attributes change
  useEffect(() => {
    // If no attributes are selected, reset to default state
    if (Object.keys(selectedAttributes).length === 0) {
      setVariantImageSrc(undefined);
      setActiveImage(0);
      return;
    }
    
    const matchingImage = findMatchingVariantImage(product, selectedAttributes);
    setVariantImageSrc(matchingImage);
    
    // If we found a matching variant image, set it as active
    if (matchingImage) {
      setActiveImage(-1); // Special value to indicate we're showing a variant image
    } else {
      // If no variant image, reset to the first product image
      setActiveImage(0);
    }
  }, [selectedAttributes, product]);

  return (
    <div className="product-gallery">
      {/* Desktop Gallery with Thumbnails */}
      <div className="hidden md:flex gap-4">
        {/* Thumbnails */}
        <div className="flex flex-col gap-2 w-20">
          {displayImages.map((image, index) => (
            <button
              key={`thumb-${image.id}-${index}`}
              onClick={() => {
                setActiveImage(index);
                setVariantImageSrc(undefined); // Clear variant image when clicking a thumbnail
              }}
              className={`relative aspect-square w-full border-2 rounded-md overflow-hidden 
                ${(activeImage === index && !variantImageSrc)
                  ? 'border-purple-600 dark:border-purple-400' 
                  : 'border-gray-200 dark:border-gray-700'}`}
              aria-label={`View ${image.alt}`}
            >
              <VariantImage
                src={image.src}
                alt={image.alt}
                className="object-cover"
              />
            </button>
          ))}
        </div>
        
        {/* Main Image */}
        <div className="flex-1 relative aspect-square">
          {variantImageSrc ? (
            <VariantImage
              src={variantImageSrc}
              alt={`${product.name} variant`}
              className="object-contain animate-fadeIn"
              fallbackSrc={displayImages[0].src}
            />
          ) : (
            <VariantImage
              src={displayImages[activeImage].src}
              alt={displayImages[activeImage].alt}
              className="object-contain animate-fadeIn"
            />
          )}
        </div>
      </div>
      
      {/* Mobile Gallery */}
      <div className="md:hidden">
        <div className="relative aspect-square w-full mb-4">
          {variantImageSrc ? (
            <VariantImage
              src={variantImageSrc}
              alt={`${product.name} variant`}
              className="object-contain animate-fadeIn"
              fallbackSrc={displayImages[0].src}
            />
          ) : (
            <VariantImage
              src={displayImages[activeImage].src}
              alt={displayImages[activeImage].alt}
              className="object-contain animate-fadeIn"
            />
          )}
        </div>
        
        {/* Mobile Thumbnails */}
        {displayImages.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {displayImages.map((image, index) => (
              <button
                key={`mobile-thumb-${image.id}-${index}`}
                onClick={() => {
                  setActiveImage(index);
                  setVariantImageSrc(undefined); // Clear variant image when clicking a thumbnail
                }}
                className={`relative flex-shrink-0 h-16 w-16 border-2 rounded-md overflow-hidden 
                  ${(activeImage === index && !variantImageSrc)
                    ? 'border-purple-600 dark:border-purple-400' 
                    : 'border-gray-200 dark:border-gray-700'}`}
                aria-label={`View ${image.alt}`}
              >
                <VariantImage
                  src={image.src}
                  alt={image.alt}
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VariantGallery;
