'use client';

import React, { useState, useEffect } from 'react';
import { getCategories, Category } from '../lib/woocommerce';
import HeaderClient from './HeaderClient';

interface HeaderProps {
  categories?: Category[];
}

function Header({ categories: prefetchedCategories }: HeaderProps = {}) {
  const [categories, setCategories] = useState<Category[]>(prefetchedCategories || []);
  const [loading, setLoading] = useState(!prefetchedCategories);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Don't fetch if categories were provided as props
    if (prefetchedCategories) return;
    
    // Fetch categories
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const fetchedCategories = await getCategories();
        setCategories(fetchedCategories);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch categories'));
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [prefetchedCategories]);

  // Get top-level categories and sort by menu_order
  const topLevelCategories = categories
    .filter(cat => cat.parent === 0 && cat.count > 0 && cat.slug !== 'uncategorized')
    .sort((a, b) => {
      // Sort by menu_order first, then by name
      if (a.menu_order === b.menu_order) {
        return a.name.localeCompare(b.name);
      }
      return a.menu_order - b.menu_order;
    });

  if (loading) {
    return <div className="animate-pulse h-16 bg-gray-100 dark:bg-gray-800"></div>;
  }

  if (error) {
    console.error('Header error:', error);
    // Return a minimal header with no categories
    return <HeaderClient categories={[]} topLevelCategories={[]} />;
  }

  return <HeaderClient categories={categories} topLevelCategories={topLevelCategories} />;
}

export default Header;
