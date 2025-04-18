'use client';

import React from 'react';
import Link from 'next/link';
import ProductImage from './ProductImage';
import { Product } from '../lib/woocommerce';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  // Get image URL, handling potential issues
  const imageUrl = product.images && product.images.length > 0 && product.images[0].src
    ? product.images[0].src
    : '/images/placeholder-product.jpg';

  return (
    <Link 
      href={`/product-details/${product.slug}`}
      className="block border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow dark:border-gray-700 cursor-pointer"
    >
      <div className="h-64 relative">
        <ProductImage
          src={imageUrl}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
      <div className="p-3">
        <h3 className="text-sm font-medium mb-1 truncate dark:text-white">{product.name}</h3>
        <div className="flex justify-between items-center">
          <div>
            {product.on_sale && product.regular_price ? (
              <div className="flex items-center gap-1">
                <span className="text-gray-400 line-through text-xs dark:text-gray-300">{product.regular_price}</span>
                <span className="font-semibold text-purple-600 text-sm dark:text-purple-300">${product.sale_price}</span>
              </div>
            ) : (
              <span className="font-semibold text-sm dark:text-white">${product.price}</span>
            )}
          </div>
          <span className="text-xs text-purple-600 hover:text-purple-800 font-medium dark:text-purple-300 dark:hover:text-purple-100">
            View
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
