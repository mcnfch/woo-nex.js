import React from 'react';
import Link from 'next/link';
import { useShoppingBag } from '../context/ShoppingBagContext';
import { FaShoppingBag } from 'react-icons/fa';

export default function SimpleHeader() {
  const { openBag, cartItems } = useShoppingBag();
  
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  
  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-purple-700 font-bold text-xl">
                WooNext
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <button 
              onClick={openBag} 
              className="relative p-2 text-gray-600 hover:text-purple-700"
              aria-label="Shopping Bag"
            >
              <FaShoppingBag className="h-6 w-6" />
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-purple-600 rounded-full">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
