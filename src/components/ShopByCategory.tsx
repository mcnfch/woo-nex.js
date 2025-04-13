import React from 'react';
import ShopByCategoryCard from './ShopByCategoryCard';
import CustomDesignCard from './CustomDesignCard';
import { getCategories, processCategories, FEATURED_CATEGORY_SLUGS, Category } from '../lib/woocommerce';

interface ShopByCategoryProps {
  title?: string;
  featuredCategories?: string[]; // Array of category slugs to feature
  columns?: 2 | 3;
  className?: string;
  categories?: Category[]; // Pre-fetched categories from server
}

async function ShopByCategory({
  title = 'Shop by Category',
  featuredCategories = FEATURED_CATEGORY_SLUGS,
  className = '',
  categories: prefetchedCategories
}: ShopByCategoryProps) {
  // Fetch categories if not provided
  const categories = prefetchedCategories || await getCategories();
  
  // Process categories for display
  const processedCategories = processCategories(categories, featuredCategories);

  return (
    <section className={`py-12 bg-gray-100 dark:bg-black ${className}`}>
      <div className="container mx-auto px-4">
        {title && (
          <h2 className="text-2xl font-bold mb-8 text-gray-800 dark:text-white">{title}</h2>
        )}
        
        <div className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Display the processed categories */}
          {processedCategories.map((category) => (
            <ShopByCategoryCard
              key={category.id}
              title={category.name}
              description={category.description}
              imageUrl={category.image?.src || ''}
              slug={category.slug}
            />
          ))}

          {/* Always add Custom Designs card as the last item */}
          <CustomDesignCard 
            title="Custom Designs"
            description="Create your own unique piece with our custom design service"
            imageUrl="https://ggbe.groovygallerydesigns.com/wp-content/uploads/2024/12/muckingfuch_Rainbow_Mandelbrot_fractal.png"
            linkUrl="/custom-design"
          />
        </div>
        
        {processedCategories.length === 0 && (
          <div className="col-span-full text-center text-gray-800 dark:text-white py-8">
            No categories found.
          </div>
        )}
      </div>
    </section>
  );
}

export default ShopByCategory;
