'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Product } from '../lib/woocommerce';

interface ProductSorterProps {
  products: Product[];
  onSortChange: (sortedProducts: Product[]) => void;
}

type SortOption = {
  id: string;
  label: string;
  sortFn: (a: Product, b: Product) => number;
};

const ProductSorter: React.FC<ProductSorterProps> = ({ products, onSortChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<SortOption | null>(null);
  const [filterText, setFilterText] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  // Define sorting options wrapped in useMemo to prevent dependencies issues
  const sortOptions: SortOption[] = useMemo(() => [
    {
      id: 'featured',
      label: 'Featured',
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      sortFn: (a, b) => 0 // No sorting, keep original order
    },
    {
      id: 'az',
      label: 'Alphabetically, A-Z',
      sortFn: (a, b) => a.name.localeCompare(b.name)
    },
    {
      id: 'za',
      label: 'Alphabetically, Z-A',
      sortFn: (a, b) => b.name.localeCompare(a.name)
    },
    {
      id: 'price_low_high',
      label: 'Price, low to high',
      sortFn: (a, b) => parseFloat(a.price) - parseFloat(b.price)
    },
    {
      id: 'price_high_low',
      label: 'Price, high to low',
      sortFn: (a, b) => parseFloat(b.price) - parseFloat(a.price)
    },
    {
      id: 'date_old_new',
      label: 'Date, old to new',
      sortFn: (a, b) => new Date(a.date_created).getTime() - new Date(b.date_created).getTime()
    },
    {
      id: 'date_new_old',
      label: 'Date, new to old',
      sortFn: (a, b) => new Date(b.date_created).getTime() - new Date(a.date_created).getTime()
    }
  ], []);

  // Filter options based on search text
  const filteredOptions = filterText
    ? sortOptions.filter(option =>
        option.label.toLowerCase().includes(filterText.toLowerCase())
      )
    : sortOptions;

  // Apply sorting when option changes
  useEffect(() => {
    if (selectedOption) {
      const sortedProducts = [...products].sort(selectedOption.sortFn);
      onSortChange(sortedProducts);
    }
  }, [selectedOption, products, onSortChange]);

  // Set featured as default sort option - Fixed to run only once using a ref
  useEffect(() => {
    if (!initializedRef.current && sortOptions.length > 0) {
      setSelectedOption(sortOptions[0]);
      initializedRef.current = true;
    }
  }, [sortOptions]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleSelectOption = (option: SortOption) => {
    setSelectedOption(option);
    setIsOpen(false);
    setFilterText('');
  };

  return (
    <div className="relative w-64 mb-6" ref={dropdownRef}>
      <div className="flex items-center mb-2">
        <label className="text-lg font-medium text-gray-700 dark:text-white">Sort by</label>
      </div>
      <button
        className="flex items-center justify-between w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        onClick={toggleDropdown}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span>{selectedOption?.label || 'Select an option'}</span>
        <svg
          className={`w-5 h-5 ml-2 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 rounded-md shadow-lg max-h-60 overflow-auto">
          <div className="sticky top-0 z-10 bg-black p-2">
            <input
              type="text"
              className="w-full px-3 py-2 text-sm placeholder-gray-500 dark:placeholder-gray-400 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Type to filter"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <ul className="py-1" role="listbox">
            {filteredOptions.map((option) => (
              <li
                key={option.id}
                className={`px-4 py-2.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer ${
                  selectedOption?.id === option.id ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200' : ''
                }`}
                role="option"
                aria-selected={selectedOption?.id === option.id}
                onClick={() => handleSelectOption(option)}
              >
                {option.label}
              </li>
            ))}
            {filteredOptions.length === 0 && (
              <li className="px-4 py-2.5 text-sm text-gray-500 dark:text-gray-400">
                No matching options
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ProductSorter;
