'use client';

import React, { useState } from 'react';
import { Product, ProductVariation } from '../lib/woocommerce';
import ProductAttributes from './ProductAttributes';

interface ProductInfoProps {
  product: Product;
}

const ProductInfo: React.FC<ProductInfoProps> = ({ product }) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedVariation, setSelectedVariation] = useState<ProductVariation | null>(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  
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
  
  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    
    try {
      // Simulate API call for adding to cart
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const itemName = product.name + (selectedVariation ? 
        ` (${selectedVariation.attributes.map(a => a.option).join(', ')})` : 
        '');
      
      // Show success message
      alert(`Added ${quantity} x ${itemName} to cart!`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add product to cart');
    } finally {
      setIsAddingToCart(false);
    }
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
              ${currentRegularPrice}
            </span>
          )}
        </div>
      </div>

      {/* Product Attributes */}
      <div className="mb-6">
        <ProductAttributes 
          product={product}
          onVariationSelect={setSelectedVariation}
        />
      </div>
      
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
        {isAddingToCart ? 'Adding...' : 'Add to Cart'}
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
