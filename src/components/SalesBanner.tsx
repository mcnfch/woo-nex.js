'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// Cookie helper functions to keep things simple
function setCookie(name: string, value: string, days: number) {
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value};${expires};path=/`;
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.startsWith(`${name}=`)) {
      return cookie.substring(name.length + 1);
    }
  }
  return null;
}

export default function SalesBanner() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if the user has seen the banner in the last day
    const bannerSeen = getCookie('sale_banner_seen');
    
    // If no cookie exists, show the banner
    if (!bannerSeen) {
      // Set timeout to show the banner after a slight delay for better UX
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const closeBanner = () => {
    setIsOpen(false);
    // Set cookie to expire in 1 day
    setCookie('sale_banner_seen', 'true', 1);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full p-2">
        {/* Close button */}
        <button 
          onClick={closeBanner}
          className="absolute -top-3 -right-3 bg-gray-800 dark:bg-gray-200 rounded-full p-1 text-white dark:text-gray-800 z-10"
          aria-label="Close sale banner"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        {/* Banner image */}
        <div className="relative">
          <Image
            src="/images/sale-banner/spring25.png"
            alt="Limited Time Sale"
            width={500}
            height={400}
            style={{ objectFit: "contain" }} 
            priority
          />
        </div>
        
        {/* Call to action button */}
        <div className="mt-4 text-center">
          <Link 
            href="/"
            className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-full transition-colors"
            onClick={closeBanner}
          >
            Shop Now
          </Link>
          
          <button 
            onClick={closeBanner}
            className="block mx-auto mt-2 text-sm text-gray-600 dark:text-gray-400 hover:underline"
          >
            
          </button>
        </div>
      </div>
    </div>
  );
}
