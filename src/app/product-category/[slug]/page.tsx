import React from 'react';
import { getCategories, getProducts, Category, Product } from '../../../lib/woocommerce';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import CategoryGrid from '../../../components/CategoryGrid';
import CategoryCard from '../../../components/CategoryCard';
import ProductImage from '../../../components/ProductImage';

// Updated to use proper Next.js 15 page props types
interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Generate static params for all categories at build time
export async function generateStaticParams() {
  const categories = await getCategories();
  
  return categories.map((category: Category) => ({
    slug: category.slug,
  }));
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  // Await params before destructuring in Next.js 15
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  
  // Fetch all categories in a single API call
  const allCategories = await getCategories();
  
  // Find the current category
  const category = allCategories.find((cat: Category) => cat.slug === slug);
  
  // If category not found, show 404
  if (!category) {
    notFound();
  }
  
  // Get subcategories from the already fetched categories
  const subcategories = allCategories.filter((cat: Category) => cat.parent === category.id);
  
  // Get parent category if this is a subcategory
  const parentCategory = category.parent !== 0 
    ? allCategories.find((cat: Category) => cat.id === category.parent) 
    : null;
    
  // Fetch products for this category
  const products = await getProducts(category.id);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <nav className="flex mb-5" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link href="/" className="text-gray-700 hover:text-purple-600 dark:text-white dark:hover:text-purple-300">
                Home
              </Link>
            </li>
            {parentCategory && (
              <li>
                <div className="flex items-center">
                  <span className="mx-2 text-gray-400 dark:text-white">/</span>
                  <Link 
                    href={`/product-category/${parentCategory.slug}`}
                    className="text-gray-700 hover:text-purple-600 dark:text-white dark:hover:text-purple-300"
                  >
                    {parentCategory.name}
                  </Link>
                </div>
              </li>
            )}
            <li>
              <div className="flex items-center">
                <span className="mx-2 text-gray-400 dark:text-white">/</span>
                <span className="text-gray-500 dark:text-white">{category.name}</span>
              </div>
            </li>
          </ol>
        </nav>
        
        <h1 className="text-3xl font-bold mb-2 dark:text-white">{category.name}</h1>
        
        {category.description && (
          <div 
            className="text-gray-600 mb-6 dark:text-white"
            dangerouslySetInnerHTML={{ __html: category.description }}
          />
        )}
      </div>
      
      {/* Products Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 dark:text-white">Products in {category.name}</h2>
        
        {products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {products.map((product: Product) => {
              // Get image URL, handling potential issues
              const imageUrl = product.images && product.images.length > 0 && product.images[0].src
                ? product.images[0].src
                : '/images/placeholder-product.jpg';
                
              return (
                <div key={product.id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow dark:border-gray-700">
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
                            <span className="text-gray-400 line-through text-xs dark:text-gray-300">${product.regular_price}</span>
                            <span className="font-semibold text-purple-600 text-sm dark:text-purple-300">${product.sale_price}</span>
                          </div>
                        ) : (
                          <span className="font-semibold text-sm dark:text-white">${product.price}</span>
                        )}
                      </div>
                      <Link 
                        href={`/product/${product.slug}`} 
                        className="text-xs text-purple-600 hover:text-purple-800 font-medium dark:text-purple-300 dark:hover:text-purple-100"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-gray-100 p-12 rounded-lg text-center dark:bg-gray-800">
            <p className="text-gray-500 dark:text-gray-300">
              No products found in this category.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
