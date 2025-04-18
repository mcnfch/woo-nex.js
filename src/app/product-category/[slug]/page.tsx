import React from 'react';
import { getCategories, getProducts, Category } from '../../../lib/woocommerce';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { generateCategorySchema } from '../../../lib/schema';
import JsonLdSchema from '../../../components/JsonLdSchema';
// Removing unused imports
// import Image from 'next/image';
// import CategoryGrid from '../../../components/CategoryGrid';
// import CategoryCard from '../../../components/CategoryCard';
import CategoryPageClient from '../../../components/CategoryPageClient';

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
  // const subcategories = allCategories.filter((cat: Category) => cat.parent === category.id);
  
  // Get parent category if this is a subcategory
  const parentCategory = category.parent !== 0 
    ? allCategories.find((cat: Category) => cat.id === category.parent) 
    : null;
    
  // Fetch products for this category
  const products = await getProducts(category.id);
  
  // Generate category schema
  const categorySchema = generateCategorySchema(category, products);
  
  return (
    <div className="container mx-auto px-4 md:py-8 pt-20 pb-8 md:pt-8">
      <JsonLdSchema data={categorySchema} />
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
        <CategoryPageClient category={category} products={products} />
      </div>
    </div>
  );
}
