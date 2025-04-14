'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Category, Product } from '../lib/woocommerce';
import ProductCard from './ProductCard';
import ProductSorter from './ProductSorter';

interface CategoryPageClientProps {
  category: Category;
  products: Product[];
}

const CategoryPageClient: React.FC<CategoryPageClientProps> = ({ category, products: initialProducts }) => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const initializedRef = useRef(false);

  // Initialize products once on mount
  useEffect(() => {
    if (!initializedRef.current) {
      setProducts(initialProducts);
      initializedRef.current = true;
    }
  }, [initialProducts]);

  // Handle sort change by updating the products state - memoized to avoid recreating on every render
  const handleSortChange = useCallback((sortedProducts: Product[]) => {
    setProducts(sortedProducts);
  }, []);

  return (
    <>
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
        <h2 className="text-xl font-semibold dark:text-white mb-4 md:mb-0">Products in {category.name}</h2>
        <ProductSorter products={initialProducts} onSortChange={handleSortChange} />
      </div>
      
      {products.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {products.map((product: Product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="bg-gray-100 p-12 rounded-lg text-center dark:bg-gray-800">
          <p className="text-gray-500 dark:text-gray-300">
            No products found in this category.
          </p>
        </div>
      )}
    </>
  );
};

export default CategoryPageClient;
