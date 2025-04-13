'use client';

import React from 'react';
import CategoryCard from './CategoryCard';

interface Category {
  id: number;
  name: string;
  slug: string;
  parent: number;
  count: number;
  menu_order: number;
  display?: string;
  image?: {
    id?: number;
    src?: string;
    alt?: string;
  };
}

interface CategoryGridProps {
  categories: Category[];
  title?: string;
  displayCount?: number;
  columns?: 2 | 3 | 4;
  displayStyle?: 'compact' | 'standard' | 'featured';
  className?: string;
}

const CategoryGrid: React.FC<CategoryGridProps> = ({
  categories,
  title,
  displayCount = categories.length,
  columns = 3,
  displayStyle = 'standard',
  className = '',
}) => {
  // Take only the number of categories specified by displayCount
  const displayCategories = categories.slice(0, displayCount);
  
  // Grid column classes based on the columns prop
  const gridColumns = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  };

  return (
    <div className={`container mx-auto p-4 ${className}`}>
      {title && (
        <h2 className="text-2xl font-bold mb-6 text-center">{title}</h2>
      )}
      
      <div className={`grid ${gridColumns[columns]} gap-6`}>
        {displayCategories.map((category) => (
          <div key={category.id} className="flex justify-center">
            <CategoryCard
              id={category.id}
              name={category.name}
              slug={category.slug}
              count={category.count}
              image={category.image ? {
                src: category.image.src || '',
                alt: category.image.alt || `${category.name} category`
              } : undefined}
              displayStyle={displayStyle}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryGrid;
