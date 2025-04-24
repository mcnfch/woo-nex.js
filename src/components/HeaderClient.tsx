'use client';

import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Category } from '../lib/woocommerce';
// Lazy load non-critical components
const ThemeToggle = lazy(() => import('./ThemeToggle'));
import { usePathname } from 'next/navigation';
const ShoppingBag = lazy(() => import('./ShoppingBag'));
import { useShoppingBag } from '../context/ShoppingBagContext';
import { searchProducts } from '../app/actions/search';

interface HeaderClientProps {
  categories: Category[];
  topLevelCategories: Category[];
}

const HeaderClient = ({ categories, topLevelCategories }: HeaderClientProps) => {
  const [hoveredCategory, setHoveredCategory] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedMobileCategories, setExpandedMobileCategories] = useState<number[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(6);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const searchResultsRef = useRef<HTMLDivElement>(null);
  const closeMenuTimer = useRef<NodeJS.Timeout | null>(null);
  const pathname = usePathname();

  // Shopping bag context
  const { cartItems, openBag } = useShoppingBag();
  // Calculate total quantity for badge
  const bagCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Check if we're on mobile based on screen width
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024);
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

  // Handle outside clicks for account menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setShowAccountMenu(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle menu hover events with delay
  const handleMenuEnter = () => {
    if (closeMenuTimer.current) {
      clearTimeout(closeMenuTimer.current);
      closeMenuTimer.current = null;
    }
    setShowAccountMenu(true);
  };

  const handleMenuLeave = () => {
    closeMenuTimer.current = setTimeout(() => {
      setShowAccountMenu(false);
    }, 300); // 300ms delay before closing
  };

  // Check if user is logged in
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Using fetch with catch for network errors, but not logging HTTP errors
        const response = await fetch('/api/customer/me');
        setIsLoggedIn(response.ok);
      } catch (error) {
        // Only log actual network errors, not HTTP status errors
        if (!(error instanceof TypeError)) {
          console.error('Error checking auth status:', error);
        }
        setIsLoggedIn(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Handle logout
  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setIsLoggedIn(false);
        setShowAccountMenu(false);
        
        // Redirect to homepage if currently on account page
        if (pathname === '/account') {
          window.location.href = '/';
        }
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Toggle mobile submenu
  const toggleMobileSubmenu = (categoryId: number) => {
    setExpandedMobileCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  // Handle search input change with improved performance
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // Clear any existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    if (!query) {
      setSearchResults([]);
      return;
    }
    
    // Only search if query is at least 2 characters - immediate UI feedback
    if (query.length < 2) {
      setIsSearching(false);
      setSearchResults([]);
      return;
    }
    
    // Set a timeout to avoid making too many requests while typing
    setIsSearching(true);
    
    // Increase debounce time to 400ms to reduce number of searches
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        // Use the server action directly instead of API fetch
        const products = await searchProducts(query);
        
        // Process results in smaller batches to avoid blocking
        // Immediately show first few results for perceived performance
        const firstBatch = products.slice(0, 3);
        setSearchResults(firstBatch);
        
        // After a slight delay, show the rest of the results
        if (products.length > 3) {
          setTimeout(() => {
            setSearchResults(products);
          }, 50);
        }
        
        setIsSearching(false);
      } catch (error) {
        console.error('Search error:', error);
        setIsSearching(false);
      }
    }, 400);
  };

  // Handle scroll event for endless scrolling
  const handleSearchResultsScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    // When user scrolls to bottom, increase the display limit
    if (scrollHeight - scrollTop <= clientHeight * 1.2) {
      setDisplayLimit(prev => prev + 6);
    }
  };

  // Clear search when component unmounts
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <header className="bg-black dark:bg-gray-900 text-white dark:text-gray-200 py-4 fixed top-0 left-0 right-0 z-50 shadow-md">
      <div className="container mx-auto px-4">
        <div className="bg-pink-200 text-black font-bold py-1 text-center text-sm mb-4 -mt-4 -mx-4 tracking-wider">
          FREE SHIPPING ON ALL ORDERS
        </div>
        {/* Modified layout for mobile - Reorganizing the header structure */}
        <div className={`flex ${isMobile ? 'flex-col' : 'flex-row justify-between'} items-center`}>
          {/* Logo */}
          <div className={`${isMobile ? 'w-full flex justify-between items-center py-2' : ''}`}>
            <Link href="/" className={`text-xl font-bold ${isMobile ? 'max-w-[150px]' : ''}`}>
              <Image
                src="/images/ggd-logo.png"
                alt="Groovy Gallery Designs"
                width={isMobile ? 150 : 300}
                height={isMobile ? 30 : 60}
                priority
                className="w-auto h-auto"
              />
            </Link>
            
            {/* Mobile header controls - right side */}
            {isMobile && (
              <div className="flex items-right justify-end space-x-0">
                {/* Header Icons for Mobile */}
                <div className="flex items-center space-x-0">
                  {/* Search Icon */}
                  <button 
                    className="hover:bg-gray-700/50 dark:hover:bg-gray-600/50 rounded-full transition-colors"
                    aria-label="Search"
                    onClick={() => setSearchOpen(!searchOpen)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                  </button>
                  
                  {/* Account Icon */}
                  <div 
                    className="relative"
                    ref={accountMenuRef}
                    onMouseEnter={handleMenuEnter}
                    onMouseLeave={handleMenuLeave}
                  >
                    <button
                      type="button"
                      className={`text-white dark:text-gray-200 p-2 ${isLoggedIn ? 'bg-purple-600 dark:bg-purple-700 rounded-full' : ''} hover:bg-gray-700/50 dark:hover:bg-gray-600/50 transition-colors`}
                      aria-label={isLoggedIn ? 'Account menu' : 'Sign in'}
                    >
                      {isLoggedIn ? (
                        // Improved icon when logged in
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                        </svg>
                      ) : (
                        // Outline icon when logged out
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                      )}
                    </button>

                    {/* Account Menu Dropdown - Now shows on hover */}
                    {showAccountMenu && (
                      <div className="absolute right-0 mt-1 w-48 bg-black dark:bg-gray-900 rounded-md shadow-lg py-1 z-10 border border-gray-200 dark:border-gray-700">
                        {isLoggedIn ? (
                          <>
                            <Link href="/account" className="block px-4 py-3 text-sm text-gray-300 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
                              My Account
                            </Link>
                            <button
                              onClick={handleLogout}
                              className="block w-full text-left px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              Logout
                            </button>
                          </>
                        ) : (
                          <>
                            <Link href="/account" className="block px-4 py-3 text-sm text-gray-300 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
                              Login
                            </Link>
                            <Link href="/account?register=true" className="block px-4 py-3 text-sm text-gray-300 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
                              Register
                            </Link>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Shopping Bag Icon */}
                  <Suspense fallback={
                    <button className="relative p-2 rounded-full transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 7V19C4 19.5304 4.21071 20.0391 4.58579 20.4142C4.96086 20.7893 5.46957 21 6 21H18C18.5304 21 19.0391 20.7893 19.4142 20.4142C19.7893 20.0391 20 19.5304 20 19V7H4Z"></path>
                        <path d="M16 10C16 11.0609 15.5786 12.0783 14.8284 12.8284C14.0783 13.5786 13.0609 14 12 14C10.9391 14 9.92172 13.5786 9.17157 12.8284C8.42143 12.0783 8 11.0609 8 10"></path>
                        <path d="M8 7V5C8 3.93913 8.42143 2.92172 9.17157 2.17157C9.92172 1.42143 10.9391 1 12 1C13.0609 1 14.0783 1.42143 14.8284 2.17157C15.5786 2.92172 16 3.93913 16 5V7"></path>
                      </svg>
                    </button>
                  }>
                    <button 
                      className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      aria-label="Shopping Bag"
                      onClick={openBag}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 7V19C4 19.5304 4.21071 20.0391 4.58579 20.4142C4.96086 20.7893 5.46957 21 6 21H18C18.5304 21 19.0391 20.7893 19.4142 20.4142C19.7893 20.0391 20 19.5304 20 19V7H4Z"></path>
                        <path d="M16 10C16 11.0609 15.5786 12.0783 14.8284 12.8284C14.0783 13.5786 13.0609 14 12 14C10.9391 14 9.92172 13.5786 9.17157 12.8284C8.42143 12.0783 8 11.0609 8 10"></path>
                        <path d="M8 7V5C8 3.93913 8.42143 2.92172 9.17157 2.17157C9.92172 1.42143 10.9391 1 12 1C13.0609 1 14.0783 1.42143 14.8284 2.17157C15.5786 2.92172 16 3.93913 16 5V7"></path>
                      </svg>
                      {bagCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[1.25rem] text-center border-2 border-white dark:border-gray-900">
                          {bagCount}
                        </span>
                      )}
                    </button>
                  </Suspense>
                  
                  {/* Theme Toggle */}
                  <Suspense fallback={<div className="w-10 h-10"></div>}>
                    <ThemeToggle />
                  </Suspense>
                </div>

                {/* Hamburger menu button - always on the right */}
                <button 
                  className="text-white dark:text-gray-200 ml-2"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  aria-label="Toggle menu"
                >
                  {mobileMenuOpen ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="3" y1="12" x2="21" y2="12"></line>
                      <line x1="3" y1="6" x2="21" y2="6"></line>
                      <line x1="3" y1="18" x2="21" y2="18"></line>
                    </svg>
                  )}
                </button>
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
                  {/* Custom Designs Link */}
                  <li className="relative">
                    <Link 
                      href="/custom-designs"
                      className={`py-2 block hover:text-gray-300 dark:hover:text-gray-400 transition-colors border-b-2 ${
                        pathname === '/custom-designs' ? 'border-white dark:border-gray-200' : 'border-transparent'
                      }`}
                    >
                      Custom Designs
                    </Link>
                  </li>
                </ul>
              </nav>
            )}
            
            {/* Desktop Header Icons */}
            {!isMobile && (
              <div className="flex items-center space-x-1">
                {/* Search Icon */}
                <button 
                  className="hover:bg-gray-700/50 dark:hover:bg-gray-600/50 rounded-full transition-colors"
                  aria-label="Search"
                  onClick={() => setSearchOpen(!searchOpen)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </button>
                
                {/* Account Icon */}
                <div 
                  className="relative"
                  ref={accountMenuRef}
                  onMouseEnter={handleMenuEnter}
                  onMouseLeave={handleMenuLeave}
                >
                  <button
                    type="button"
                    className={`text-white dark:text-gray-200 p-2 ${isLoggedIn ? 'bg-purple-600 dark:bg-purple-700 rounded-full' : ''} hover:bg-gray-700/50 dark:hover:bg-gray-600/50 transition-colors`}
                    aria-label={isLoggedIn ? 'Account menu' : 'Sign in'}
                  >
                    {isLoggedIn ? (
                      // Improved icon when logged in
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                      </svg>
                    ) : (
                      // Outline icon when logged out
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                    )}
                  </button>

                  {/* Account Menu Dropdown - Now shows on hover */}
                  {showAccountMenu && (
                    <div className="absolute right-0 mt-1 w-48 bg-black dark:bg-gray-900 rounded-md shadow-lg py-1 z-10 border border-gray-200 dark:border-gray-700">
                      {isLoggedIn ? (
                        <>
                          <Link href="/account" className="block px-4 py-3 text-sm text-gray-300 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
                            My Account
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="block w-full text-left px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            Logout
                          </button>
                        </>
                      ) : (
                        <>
                          <Link href="/account" className="block px-4 py-3 text-sm text-gray-300 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
                            Login
                          </Link>
                          <Link href="/account?register=true" className="block px-4 py-3 text-sm text-gray-300 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
                            Register
                          </Link>
                        </>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Shopping Bag Icon */}
                <Suspense fallback={
                  <button className="relative p-2 rounded-full transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 7V19C4 19.5304 4.21071 20.0391 4.58579 20.4142C4.96086 20.7893 5.46957 21 6 21H18C18.5304 21 19.0391 20.7893 19.4142 20.4142C19.7893 20.0391 20 19.5304 20 19V7H4Z"></path>
                      <path d="M16 10C16 11.0609 15.5786 12.0783 14.8284 12.8284C14.0783 13.5786 13.0609 14 12 14C10.9391 14 9.92172 13.5786 9.17157 12.8284C8.42143 12.0783 8 11.0609 8 10"></path>
                      <path d="M8 7V5C8 3.93913 8.42143 2.92172 9.17157 2.17157C9.92172 1.42143 10.9391 1 12 1C13.0609 1 14.0783 1.42143 14.8284 2.17157C15.5786 2.92172 16 3.93913 16 5V7"></path>
                    </svg>
                  </button>
                }>
                  <button 
                    className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    aria-label="Shopping Bag"
                    onClick={openBag}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 7V19C4 19.5304 4.21071 20.0391 4.58579 20.4142C4.96086 20.7893 5.46957 21 6 21H18C18.5304 21 19.0391 20.7893 19.4142 20.4142C19.7893 20.0391 20 19.5304 20 19V7H4Z"></path>
                      <path d="M16 10C16 11.0609 15.5786 12.0783 14.8284 12.8284C14.0783 13.5786 13.0609 14 12 14C10.9391 14 9.92172 13.5786 9.17157 12.8284C8.42143 12.0783 8 11.0609 8 10"></path>
                      <path d="M8 7V5C8 3.93913 8.42143 2.92172 9.17157 2.17157C9.92172 1.42143 10.9391 1 12 1C13.0609 1 14.0783 1.42143 14.8284 2.17157C15.5786 2.92172 16 3.93913 16 5V7"></path>
                    </svg>
                    {bagCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[1.25rem] text-center border-2 border-white dark:border-gray-900">
                        {bagCount}
                      </span>
                    )}
                  </button>
                </Suspense>
                
                {/* Theme Toggle */}
                <Suspense fallback={<div className="w-10 h-10"></div>}>
                  <ThemeToggle />
                </Suspense>
              </div>
            )}
          </div>
        </div>

        {/* Search Field - Pops down when search icon is clicked */}
        {searchOpen && (
          <div className="w-full bg-black dark:bg-gray-800 py-3 px-4 animate-slideDown">
            <div className="relative max-w-3xl mx-auto">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-4 pr-10 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
                autoFocus
                value={searchQuery}
                onChange={handleSearchChange}
              />
              <button 
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                onClick={() => setSearchOpen(false)}
                aria-label="Close search"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
              
              {/* Search Results Dropdown */}
              {searchQuery.length > 0 && (
                <div 
                  ref={searchResultsRef}
                  className="absolute z-50 mt-2 w-full bg-white dark:bg-gray-800 rounded-md shadow-lg max-h-96 overflow-y-auto"
                  onScroll={handleSearchResultsScroll}
                >
                  {isSearching ? (
                    <div className="flex items-center justify-center p-4">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
                      <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">Searching...</span>
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                      No products found for "{searchQuery}"
                    </div>
                  ) : (
                    <div>
                      {searchResults.slice(0, displayLimit).map((product) => (
                        <Link 
                          key={product.id}
                          href={`/product-details/${product.slug}`}
                          onClick={() => {
                            setSearchOpen(false);
                            setSearchQuery('');
                            setSearchResults([]);
                            setDisplayLimit(6);
                          }}
                        >
                          <div className="flex items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                            {product.images && product.images[0] && (
                              <div className="flex-shrink-0 h-12 w-12 mr-3">
                                <img 
                                  src={product.images[0].src} 
                                  alt={product.name}
                                  className="h-full w-full object-cover rounded-md"
                                />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {product.name}
                              </p>
                              <p className="text-sm text-purple-600 dark:text-purple-400">
                                ${product.price}
                              </p>
                            </div>
                          </div>
                        </Link>
                      ))}
                      {searchResults.length > displayLimit && (
                        <div className="p-3 text-center text-sm text-gray-500 dark:text-gray-400">
                          Scroll for more results...
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mobile Menu */}
        {isMobile && mobileMenuOpen && (
          <div className="w-full bg-black dark:bg-gray-900 py-4 mt-4">
            {/* Mobile Search */}
            {searchOpen && (
              <div className="px-4 mb-4">
                <div className="relative">
                  <input
                    type="text"
                    name="q"
                    placeholder="Search products..."
                    className="w-full bg-gray-800 dark:bg-gray-800 text-white dark:text-gray-200 rounded-md p-2 pl-10"
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                  <svg
                    className="absolute left-3 top-3 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </div>
                
                {/* Mobile Search Results */}
                {searchQuery.length > 0 && (
                  <div 
                    className="mt-2 bg-gray-700 dark:bg-gray-700 rounded-md shadow-lg max-h-96 overflow-y-auto"
                    onScroll={handleSearchResultsScroll}
                  >
                    {isSearching ? (
                      <div className="flex items-center justify-center p-4">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
                        <span className="ml-2 text-sm text-gray-300">Searching...</span>
                      </div>
                    ) : searchResults.length === 0 ? (
                      <div className="p-4 text-center text-sm text-gray-300">
                        No products found for "{searchQuery}"
                      </div>
                    ) : (
                      <div>
                        {searchResults.slice(0, displayLimit).map((product) => (
                          <Link 
                            key={product.id}
                            href={`/product-details/${product.slug}`}
                            onClick={() => {
                              setSearchOpen(false);
                              setMobileMenuOpen(false);
                              setSearchQuery('');
                              setSearchResults([]);
                              setDisplayLimit(6);
                            }}
                          >
                            <div className="flex items-center p-3 hover:bg-gray-600 cursor-pointer">
                              {product.images && product.images[0] && (
                                <div className="flex-shrink-0 h-12 w-12 mr-3">
                                  <img 
                                    src={product.images[0].src} 
                                    alt={product.name}
                                    className="h-full w-full object-cover rounded-md"
                                  />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">
                                  {product.name}
                                </p>
                                <p className="text-sm text-purple-400">
                                  ${product.price}
                                </p>
                              </div>
                            </div>
                          </Link>
                        ))}
                        {searchResults.length > displayLimit && (
                          <div className="p-3 text-center text-sm text-gray-400">
                            Scroll for more results...
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {/* Mobile Navigation */}
            <nav>
              <ul className="space-y-1">
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
                
                {/* Custom Designs Link */}
                <li>
                  <Link 
                    href="/custom-designs"
                    className="py-2 block text-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Custom Designs
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        )}

        {/* Shopping Bag Slide-out */}
        <Suspense fallback={<div className="w-10 h-10"></div>}>
          <ShoppingBag />
        </Suspense>
      </div>
    </header>
  );
};

export default HeaderClient;
