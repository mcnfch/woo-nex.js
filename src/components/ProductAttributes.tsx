'use client';

import React, { useState, useMemo } from 'react';
import { Product, ProductVariation } from '../lib/woocommerce';

interface ProductAttributesProps {
  product: Product;
  onVariationSelect?: (variation: ProductVariation | null) => void;
}

export const ProductAttributes: React.FC<ProductAttributesProps> = ({ 
  product,
  onVariationSelect
}) => {
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});

  // Filter valid attributes (multiple options, not shipping)
  const validAttributes = useMemo(() => {
    if (!product.attributes) return [];
    
    return product.attributes.filter(attr => 
      attr.variation && // must be a variation attribute
      attr.options.length > 1 && // must have multiple options
      attr.name.toLowerCase() !== 'ships from' // exclude shipping location
    );
  }, [product.attributes]);

  // Find matching variation based on selected attributes
  const matchedVariation = useMemo(() => {
    if (!product.variations || !Array.isArray(product.variations) || 
        Object.keys(selectedAttributes).length === 0) {
      return null;
    }

    return product.variations.find(variation => {
      if (!variation.attributes || !Array.isArray(variation.attributes)) {
        return false;
      }
      
      return variation.attributes.every(attr => {
        const attrName = attr.name.toLowerCase();
        return selectedAttributes[attrName] === attr.option;
      });
    });
  }, [selectedAttributes, product.variations]);

  // Update selected attributes and notify parent
  const handleSelect = (attrName: string, option: string) => {
    const newAttributes = { 
      ...selectedAttributes,
      [attrName.toLowerCase()]: option 
    };
    setSelectedAttributes(newAttributes);
    
    // Find and notify parent of matched variation
    if (product.variations && Array.isArray(product.variations)) {
      const variation = product.variations.find(v => {
        if (!v.attributes || !Array.isArray(v.attributes)) return false;
        return v.attributes.every(attr => 
          newAttributes[attr.name.toLowerCase()] === attr.option
        );
      });
      onVariationSelect?.(variation || null);
    } else {
      onVariationSelect?.(null);
    }
  };

  // Reset selections
  const handleReset = (attrName: string) => {
    const { [attrName.toLowerCase()]: _, ...rest } = selectedAttributes;
    setSelectedAttributes(rest);
    onVariationSelect?.(null);
  };

  if (!validAttributes.length) {
    return null; // Don't render anything if no valid attributes
  }

  return (
    <div className="space-y-4">
      {validAttributes.map(attr => (
        <div key={attr.name} className="attribute-group">
          <div className="flex justify-between items-center mb-2">
            <p className="font-medium text-gray-900 dark:text-gray-100">
              {attr.name}
            </p>
            {selectedAttributes[attr.name.toLowerCase()] && (
              <button
                onClick={() => handleReset(attr.name)}
                className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300"
              >
                Reset
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {attr.options.map(option => (
              <button
                key={option}
                onClick={() => handleSelect(attr.name, option)}
                className={`px-4 py-2 text-sm border rounded-full transition-colors
                  ${selectedAttributes[attr.name.toLowerCase()] === option
                    ? 'bg-purple-600 text-white border-purple-600 dark:bg-purple-500 dark:border-purple-500'
                    : 'bg-white text-gray-900 border-gray-200 hover:border-purple-400 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 dark:hover:border-purple-400'
                  }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductAttributes;
