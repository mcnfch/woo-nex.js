'use client'

import { useState, useRef, useTransition, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation'; 
import Link from 'next/link';
import { searchProducts } from '../app/actions/search';
import type { Product } from '../types/woocommerce';

// Separate component that safely uses searchParams
function SearchParamsHandler({
  onUpdateQuery
}: {
  onUpdateQuery: (query: string) => void;
}) {
  // Import and use searchParams in a separate component that can be wrapped in Suspense
  const { useSearchParams } = require('next/navigation');
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const query = searchParams?.get('q') || '';
    if (query) {
      onUpdateQuery(query);
    }
  }, [searchParams, onUpdateQuery]);
  
  return null;
}

interface SearchInputProps {
  initialQuery: string;
  initialResults: Product[];
}

export default function SearchInput({ initialQuery, initialResults }: SearchInputProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  
  // Local state for immediate UI feedback
  const [query, setQuery] = useState(initialQuery || '');
  const [results, setResults] = useState<Product[]>(initialResults || []);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(6);
  
  // Refs for search handling
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchResultsRef = useRef<HTMLDivElement>(null);
  
  // Function to update query from searchParams (used by SearchParamsHandler)
  const handleUpdateQueryFromParams = (newQuery: string) => {
    setQuery(newQuery);
    if (newQuery.length >= 2) {
      searchProducts(newQuery).then(searchResults => {
        setResults(searchResults);
      });
    }
  };
  
  // Handle search input change with debounce
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    
    // Clear any existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    if (!newQuery || newQuery.length < 2) {
      setResults([]);
      // Update URL to remove search param
      startTransition(() => {
        router.replace(window.location.pathname, { scroll: false });
      });
      return;
    }
    
    // Set a timeout to avoid making too many requests while typing
    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        // Call server action directly
        const searchResults = await searchProducts(newQuery);
        setResults(searchResults);
        
        // Update URL with search param
        startTransition(() => {
          router.replace(`${window.location.pathname}?q=${encodeURIComponent(newQuery)}`, { scroll: false });
        });
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsSearching(false);
      }
    }, 300); // 300ms debounce
  };
  
  // Handle scroll event for endless scrolling
  const handleSearchResultsScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    // When user scrolls to bottom, increase the display limit
    if (scrollHeight - scrollTop <= clientHeight * 1.2) {
      setDisplayLimit(prev => prev + 6);
    }
  };
  
  // Toggle search open/closed
  const toggleSearch = () => {
    setIsOpen(!isOpen);
  };
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);
  
  return (
    <>
      {/* Wrap the searchParams usage in Suspense */}
      <Suspense fallback={null}>
        <SearchParamsHandler onUpdateQuery={handleUpdateQueryFromParams} />
      </Suspense>
      
      {/* Search Icon Button */}
      <button
        onClick={toggleSearch}
        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="Search"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      </button>
      
      {/* Search Input Field */}
      {isOpen && (
        <div className="absolute top-full right-0 w-full md:w-96 bg-black dark:bg-gray-800 mt-1 p-3 rounded-md shadow-lg animate-slideDown z-50">
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              className="w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-4 pr-10 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
              autoFocus
              value={query}
              onChange={handleSearchChange}
            />
            <button 
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              onClick={() => {
                setIsOpen(false);
                setQuery('');
                setResults([]);
                setDisplayLimit(6);
              }}
              aria-label="Close search"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          
          {/* Search Results */}
          {query.length > 1 && (
            <div 
              ref={searchResultsRef}
              className="mt-2 w-full bg-white dark:bg-gray-800 rounded-md shadow-lg max-h-96 overflow-y-auto"
              onScroll={handleSearchResultsScroll}
            >
              {isSearching ? (
                <div className="flex items-center justify-center p-4">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
                  <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">Searching...</span>
                </div>
              ) : results.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  No products found for "{query}"
                </div>
              ) : (
                <div>
                  {results.slice(0, displayLimit).map((product) => (
                    <Link 
                      key={product.id}
                      href={`/product-details/${product.slug}`}
                      onClick={() => {
                        setIsOpen(false);
                        setQuery('');
                        setResults([]);
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
                  {results.length > displayLimit && (
                    <div className="p-3 text-center text-sm text-gray-500 dark:text-gray-400">
                      Scroll for more results...
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}
