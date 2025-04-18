'use client';

import React, { useState } from 'react';
import { Product, ProductVariation } from '../lib/woocommerce';
import ProductAttributes from './ProductAttributes';
import { useShoppingBag } from '../context/ShoppingBagContext';

interface ProductInfoProps {
  product: Product;
}

const ProductInfo: React.FC<ProductInfoProps> = ({ product }) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedVariation, setSelectedVariation] = useState<ProductVariation | null>(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  
  // Get the current price based on selected variation or main product
  const currentPrice = selectedVariation?.price || product.price;
  const currentRegularPrice = selectedVariation?.regular_price || product.regular_price;
  const isOnSale = currentPrice !== currentRegularPrice;
  
  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };
  
  const incrementQuantity = () => {
    setQuantity(quantity + 1);
  };
  
  const handleVariationSelect = (variation: ProductVariation | null) => {
    setSelectedVariation(variation);
    
    // Update selected attributes when a variation is selected
    if (variation && variation.attributes) {
      const newAttributes: Record<string, string> = {};
      variation.attributes.forEach(attr => {
        newAttributes[attr.name.toLowerCase()] = attr.option;
      });
      setSelectedAttributes(newAttributes);
      
      // Dispatch custom event for VariantGalleryWrapper
      const event = new CustomEvent('variant-attribute-change', {
        detail: newAttributes
      });
      window.dispatchEvent(event);
    }
  };
  
  // Check if all required attribute selections have been made
  const allAttributesSelected = () => {
    if (product.type !== 'variable' || !product.attributes) {
      return true; // Simple products don't need attribute selection
    }
    
    // Get all variation attributes (including single options)
    const variationAttributes = product.attributes.filter(attr => 
      attr.variation
    );
    
    if (variationAttributes.length === 0) {
      return true; // No variant attributes to select
    }
    
    // Check if all variation attributes have been selected
    return variationAttributes.every(attr => 
      selectedAttributes[attr.name.toLowerCase()] !== undefined
    );
  };
  
  const { addItem } = useShoppingBag();

  const handleAddToCart = () => {
    if (!allAttributesSelected()) {
      alert('Please select all product options before adding to bag');
      return;
    }
    setIsAddingToCart(true);
    const productToAdd = {
      id: selectedVariation?.id || product.id,
      name: product.name,
      price: currentPrice,
      quantity: quantity,
      image: selectedVariation?.image?.src || product.images?.[0]?.src || '',
      size: selectedVariation?.attributes?.find(a => a.name.toLowerCase() === 'size')?.option,
      variation_id: selectedVariation?.id,
      attributes: selectedVariation ? 
        selectedVariation.attributes.map(a => `${a.name}: ${a.option}`).join(', ') : 
        ''
    };
    addItem(productToAdd);
    setIsAddingToCart(false);
  };

  return (
    <div className="product-info p-4">
      {/* Product Title */}
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        {product.name}
      </h1>
      
      {/* Price */}
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            ${currentPrice}
          </span>
          {isOnSale && (
            <span className="text-lg text-gray-500 line-through">
              {currentRegularPrice}
            </span>
          )}
        </div>
      </div>

      {/* Product Attributes/Variations */}
      {product.type === 'variable' && product.attributes && product.attributes.length > 0 && (
        <div className="mb-6">
          <ProductAttributes 
            product={product} 
            onVariationSelect={handleVariationSelect} 
          />
        </div>
      )}
      
      {/* Quantity Selector */}
      <div className="flex items-center gap-4 mb-6">
        <span className="text-gray-700 dark:text-gray-300">Quantity:</span>
        <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded-full">
          <button
            onClick={decrementQuantity}
            className="px-3 py-1 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            aria-label="Decrease quantity"
          >
            -
          </button>
          <span className="px-3 py-1 text-gray-900 dark:text-white">
            {quantity}
          </span>
          <button
            onClick={incrementQuantity}
            className="px-3 py-1 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>
      
      {/* Add to Cart Button */}
      <button
        onClick={handleAddToCart}
        disabled={isAddingToCart}
        className="w-full bg-purple-600 text-white py-3 px-6 rounded-full font-medium
          hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed
          dark:bg-purple-500 dark:hover:bg-purple-600 dark:focus:ring-purple-400"
      >
        {isAddingToCart ? 'Adding...' : 'Add to Bag'}
      </button>
      
      {/* SKU */}
      {(selectedVariation?.sku || product.sku) && (
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          SKU: {selectedVariation?.sku || product.sku}
        </p>
      )}
    </div>
  );
};

export default ProductInfo;
