import React from 'react';
import { getCategories, Category } from '../lib/woocommerce';
import FooterClient from './FooterClient';

interface FooterProps {
  categories?: Category[];
}

async function Footer({ categories: prefetchedCategories }: FooterProps = {}) {
  // Fetch categories if not provided
  const categories = prefetchedCategories || await getCategories();
  
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

  return <FooterClient categories={categories} topLevelCategories={topLevelCategories} />;
}

export default Footer;
