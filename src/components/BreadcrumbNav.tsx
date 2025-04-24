import React from 'react';
import Link from 'next/link';
import { Product } from '../lib/woocommerce';

interface BreadcrumbNavProps {
  product: Product;
}

const BreadcrumbNav: React.FC<BreadcrumbNavProps> = ({ product }) => {
  // Get the first category for breadcrumb navigation
  const mainCategory = product.categories && product.categories.length > 0 
    ? product.categories[0] 
    : null;

  return (
    <nav className="flex mb-5 mt-[15px]" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3 text-xs md:text-base">
        <li className="inline-flex items-center">
          <Link 
            href="/" 
            className="text-gray-700 hover:text-purple-600 dark:text-white dark:hover:text-purple-300"
          >
            Home
          </Link>
        </li>
        
        {mainCategory && (
          <li>
            <div className="flex items-center">
              <span className="mx-1 md:mx-2 text-gray-400 dark:text-white">/</span>
              <Link 
                href={`/product-category/${mainCategory.slug}`}
                className="text-gray-700 hover:text-purple-600 dark:text-white dark:hover:text-purple-300"
              >
                {mainCategory.name}
              </Link>
            </div>
          </li>
        )}
        
        <li>
          <div className="flex items-center">
            <span className="mx-1 md:mx-2 text-gray-400 dark:text-white">/</span>
            <span className="text-gray-500 dark:text-white">{product.name}</span>
          </div>
        </li>
      </ol>
    </nav>
  );
};

export default BreadcrumbNav;
