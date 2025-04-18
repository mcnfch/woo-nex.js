'use client';

import React, { useState } from 'react';
import { Product } from '../lib/woocommerce';
import VariantGallery from './VariantGallery';

interface VariantGalleryWrapperProps {
  product: Product;
}

/**
 * This wrapper component is necessary because we need to:
 * 1. Use client-side state for selected attributes
 * 2. Connect the ProductInfo component's variant selection to the VariantGallery
 */
const VariantGalleryWrapper: React.FC<VariantGalleryWrapperProps> = ({ product }) => {
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});

  // This component will be updated by ProductInfo through a custom event
  React.useEffect(() => {
    // Listen for attribute selection events from ProductInfo
    const handleAttributeChange = (event: CustomEvent) => {
      if (event.detail && typeof event.detail === 'object') {
        setSelectedAttributes(event.detail);
      }
    };

    // Add event listener
    window.addEventListener('variant-attribute-change', handleAttributeChange as EventListener);

    // Clean up
    return () => {
      window.removeEventListener('variant-attribute-change', handleAttributeChange as EventListener);
    };
  }, []);

  return (
    <VariantGallery 
      product={product}
      selectedAttributes={selectedAttributes}
    />
  );
};

export default VariantGalleryWrapper;
