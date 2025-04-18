'use client';

import React, { useState, useEffect } from 'react';
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

  // Separate attributes into visible and hidden categories
  const { visibleAttributes, hiddenAttributes } = React.useMemo(() => {
    if (!product.attributes) return { visibleAttributes: [], hiddenAttributes: [] };
    
    const visible = product.attributes.filter(attr => 
      attr.variation && // must be a variation attribute
      attr.options.length > 1 && // must have multiple options
      attr.name.toLowerCase() !== 'ships from' // exclude shipping location
    );
    
    const hidden = product.attributes.filter(attr => 
      attr.variation && // must be a variation attribute
      (attr.options.length === 1 || attr.name.toLowerCase() === 'ships from') // single option or ships from
    );
    
    return { visibleAttributes: visible, hiddenAttributes: hidden };
  }, [product.attributes]);

  // Helper function to find matching variation
  const findMatchingVariation = React.useMemo(() => {
    return (attrs: Record<string, string>): ProductVariation | null => {
      if (!product.variations || !Array.isArray(product.variations)) {
        return null;
      }

      return product.variations.find(variation => {
        if (!variation.attributes || !Array.isArray(variation.attributes)) {
          return false;
        }
        
        return variation.attributes.every((attr: any) => {
          // If attribute is not in our selection, it's not a match
          if (!attrs[attr.name.toLowerCase()]) {
            return false;
          }
          
          // If attribute value doesn't match our selection, it's not a match
          return attrs[attr.name.toLowerCase()] === attr.option;
        });
      }) || null;
    };
  }, [product.variations]);

  // Auto-select single options on component mount
  useEffect(() => {
    // Only run initialization once on mount
    const initialSelections: Record<string, string> = {};
    
    // Auto-select all hidden attributes (they only have one option)
    hiddenAttributes.forEach((attr: any) => {
      if (attr.options.length > 0) {
        initialSelections[attr.name.toLowerCase()] = attr.options[0];
      }
    });
    
    if (Object.keys(initialSelections).length > 0) {
      setSelectedAttributes(initialSelections);
      
      // Find matching variation with these initial selections
      const matchedVariation = findMatchingVariation(initialSelections);
      if (matchedVariation && onVariationSelect) {
        onVariationSelect(matchedVariation);
      }
      
      // Dispatch event for gallery
      try {
        const event = new CustomEvent('variant-attribute-change', {
          detail: initialSelections
        });
        window.dispatchEvent(event);
      } catch (error) {
        console.error('Error dispatching initial variant event:', error);
      }
    }
  // Run only once on mount - removing dependencies that cause re-renders
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update selected attributes and notify parent
  const handleSelect = (attrName: string, option: string) => {
    const newAttributes = { 
      ...selectedAttributes,
      [attrName.toLowerCase()]: option 
    };
    
    setSelectedAttributes(newAttributes);
    
    // Notify parent component of the matched variation
    if (onVariationSelect) {
      const newMatchedVariation = findMatchingVariation(newAttributes);
      onVariationSelect(newMatchedVariation);
    }
    
    // Dispatch custom event for VariantGalleryWrapper
    // This ensures direct communication between components
    try {
      const event = new CustomEvent('variant-attribute-change', {
        detail: newAttributes
      });
      window.dispatchEvent(event);
      console.log('Dispatched variant-attribute-change event:', newAttributes);
    } catch (error) {
      console.error('Error dispatching variant event:', error);
    }
  };

  // Reset selections
  const handleReset = (attrName: string) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { [attrName.toLowerCase()]: removed, ...rest } = selectedAttributes;
    setSelectedAttributes(rest);
    onVariationSelect?.(null);
    
    // Dispatch a reset event for the gallery
    try {
      const event = new CustomEvent('variant-attribute-change', {
        detail: rest // Pass the remaining attributes, if any
      });
      window.dispatchEvent(event);
      console.log('Dispatched reset event for gallery:', rest);
    } catch (error) {
      console.error('Error dispatching reset event:', error);
    }
  };

  // Don't render if no attributes at all
  if (!visibleAttributes.length && !hiddenAttributes.length) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Visible attributes that need user selection */}
      {visibleAttributes.map(attr => (
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
                onClick={() => handleSelect(attr.name, option.toString())}
                className={`px-4 py-2 text-sm border rounded-full transition-colors
                  ${selectedAttributes[attr.name.toLowerCase()] === option.toString()
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
      
      {/* Hidden attributes (single option or ships from) - hidden with CSS but still in the DOM */}
      <div className="hidden">
        {hiddenAttributes.map(attr => (
          <div key={attr.name} className="attribute-group">
            <p className="font-medium text-gray-900 dark:text-gray-100">
              {attr.name}
            </p>
            <div className="flex flex-wrap gap-2">
              {attr.options.map(option => (
                <button
                  key={option}
                  // Auto-selected by useEffect, no onClick needed
                  className={`px-4 py-2 text-sm border rounded-full
                    ${selectedAttributes[attr.name.toLowerCase()] === option.toString()
                      ? 'bg-purple-600 text-white border-purple-600'
                      : 'bg-white text-gray-900 border-gray-200'
                    }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductAttributes;
