'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Category } from '../lib/woocommerce';
import ThemeToggle from './ThemeToggle';

interface HeaderClientProps {
  categories: Category[];
  topLevelCategories: Category[];
}

const HeaderClient = ({ categories, topLevelCategories }: HeaderClientProps) => {
  const [hoveredCategory, setHoveredCategory] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedMobileCategories, setExpandedMobileCategories] = useState<number[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're on mobile based on screen width
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkIfMobile();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Close mobile menu when switching to desktop
  useEffect(() => {
    if (!isMobile) {
      setMobileMenuOpen(false);
    }
  }, [isMobile]);

  // Toggle mobile submenu
  const toggleMobileSubmenu = (categoryId: number) => {
    setExpandedMobileCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  return (
    <header className="bg-black dark:bg-gray-900 text-white dark:text-gray-200 py-4 fixed top-0 left-0 right-0 z-50 shadow-md">
      <div className="container mx-auto px-4">
        {/* Modified layout for mobile - Reorganizing the header structure */}
        <div className={`flex ${isMobile ? 'flex-col' : 'flex-row justify-between'} items-center`}>
          {/* Logo */}
          <div className={`${isMobile ? 'w-full mb-2 flex justify-between items-center' : ''}`}>
            <Link href="/" className="text-xl font-bold">
              <Image
                src="/images/ggd-logo.png"
                alt="Groovy Gallery Designs"
                width={300}
                height={60}
                priority
              />
            </Link>
            
            {/* Header Icons for Mobile - Placed next to logo */}
            {isMobile && (
              <div className="flex items-center space-x-1">
                {/* Search Icon */}
                <button 
                  className="p-1.5 hover:bg-gray-700/50 dark:hover:bg-gray-600/50 rounded-full transition-colors"
                  aria-label="Search"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </button>
                
                {/* Account Icon */}
                <Link 
                  href="/account" 
                  className="p-1.5 hover:bg-gray-700/50 dark:hover:bg-gray-600/50 rounded-full transition-colors"
                  aria-label="My Account"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </Link>
                
                {/* Cart Icon */}
                <Link 
                  href="/cart" 
                  className="p-1.5 hover:bg-gray-700/50 dark:hover:bg-gray-600/50 rounded-full transition-colors"
                  aria-label="Shopping Cart"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                  </svg>
                </Link>
                
                {/* Theme Toggle */}
                <ThemeToggle />
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between w-full md:w-auto">
            {/* Desktop Navigation */}
            {!isMobile && (
              <nav className="hidden md:block mr-6">
                <ul className="flex space-x-8">
                  {topLevelCategories.map(category => (
                    <li 
                      key={category.id} 
                      className="relative"
                      onMouseEnter={() => setHoveredCategory(category.id)}
                      onMouseLeave={() => setHoveredCategory(null)}
                    >
                      <Link 
                        href={`/product-category/${category.slug}`}
                        className={`py-2 block hover:text-gray-300 dark:hover:text-gray-400 transition-colors ${
                          hoveredCategory === category.id ? 'border-b-2 border-white dark:border-gray-200' : 'border-b-2 border-transparent'
                        }`}
                      >
                        {category.name}
                      </Link>
                      
                      {/* Dropdown for subcategories */}
                      {hoveredCategory === category.id && categories.some(cat => cat.parent === category.id) && (
                        <ul className="absolute top-full left-0 bg-black dark:bg-gray-900 shadow-lg py-2 min-w-[200px] z-50">
                          {categories
                            .filter(cat => cat.parent === category.id)
                            .sort((a, b) => a.menu_order - b.menu_order)
                            .map(subcat => (
                              <li key={subcat.id}>
                                <Link 
                                  href={`/product-category/${subcat.slug}`}
                                  className="block px-4 py-2 text-sm hover:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
                                >
                                  {subcat.name}
                                </Link>
                              </li>
                            ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              </nav>
            )}
            
            {/* Desktop Header Icons */}
            {!isMobile && (
              <div className="flex items-center space-x-3">
                {/* Search Icon */}
                <button 
                  className="p-2 hover:bg-gray-700/50 dark:hover:bg-gray-600/50 rounded-full transition-colors"
                  aria-label="Search"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </button>
                
                {/* Account Icon */}
                <Link 
                  href="/account" 
                  className="p-2 hover:bg-gray-700/50 dark:hover:bg-gray-600/50 rounded-full transition-colors"
                  aria-label="My Account"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </Link>
                
                {/* Cart Icon */}
                <Link 
                  href="/cart" 
                  className="p-2 hover:bg-gray-700/50 dark:hover:bg-gray-600/50 rounded-full transition-colors"
                  aria-label="Shopping Cart"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                  </svg>
                </Link>
                
                {/* Theme Toggle */}
                <ThemeToggle />
              </div>
            )}
            
            {/* Hamburger menu button (mobile only) - Now in its own row */}
            {isMobile && (
              <div className="flex w-full justify-end">
                <button 
                  className="text-white dark:text-gray-200 p-2"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  aria-label="Toggle menu"
                >
                  {mobileMenuOpen ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="3" y1="12" x2="21" y2="12"></line>
                      <line x1="3" y1="6" x2="21" y2="6"></line>
                      <line x1="3" y1="18" x2="21" y2="18"></line>
                    </svg>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobile && mobileMenuOpen && (
          <div className="bg-black dark:bg-gray-900 z-50 shadow-lg mt-2">
            <nav className="container mx-auto px-4 py-2">
              <ul className="space-y-2">
                {topLevelCategories.map(category => (
                  <li key={category.id}>
                    <div className="flex items-center justify-between">
                      <Link 
                        href={`/product-category/${category.slug}`}
                        className="py-2 block text-lg"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {category.name}
                      </Link>
                      
                      {/* Only show dropdown toggle if category has children */}
                      {categories.some(cat => cat.parent === category.id) && (
                        <button 
                          onClick={() => toggleMobileSubmenu(category.id)}
                          className="p-2"
                          aria-label={`Toggle ${category.name} submenu`}
                        >
                          {expandedMobileCategories.includes(category.id) ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="18 15 12 9 6 15"></polyline>
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                          )}
                        </button>
                      )}
                    </div>
                    
                    {/* Mobile submenu */}
                    {expandedMobileCategories.includes(category.id) && (
                      <ul className="pl-4 border-l border-gray-700 dark:border-gray-600 mt-1 mb-2 space-y-1">
                        {categories
                          .filter(cat => cat.parent === category.id)
                          .sort((a, b) => a.menu_order - b.menu_order)
                          .map(subcat => (
                            <li key={subcat.id}>
                              <Link 
                                href={`/product-category/${subcat.slug}`}
                                className="block py-2 text-gray-300 dark:text-gray-400 hover:text-white dark:hover:text-gray-200"
                                onClick={() => setMobileMenuOpen(false)}
                              >
                                {subcat.name}
                              </Link>
                            </li>
                          ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default HeaderClient;
