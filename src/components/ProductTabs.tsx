'use client';

import React, { useState } from 'react';
import { Product } from '../lib/woocommerce';

interface ProductTabsProps {
  product: Product;
}

const ProductTabs: React.FC<ProductTabsProps> = ({ product }) => {
  const [activeTab, setActiveTab] = useState<string | null>('details');
  
  const toggleTab = (tabId: string) => {
    setActiveTab(prev => prev === tabId ? null : tabId);
  };
  
  return (
    <div className="product-tabs mb-12">
      {/* Details Tab */}
      <div className="border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => toggleTab('details')}
          className="w-full flex justify-between items-center py-4 text-left"
          aria-expanded={activeTab === 'details'}
        >
          <h3 className="text-lg font-medium dark:text-white">DETAILS</h3>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transition-transform ${activeTab === 'details' ? 'transform rotate-180' : ''}`}
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
        
        {activeTab === 'details' && (
          <div className="py-4 prose prose-sm max-w-none dark:prose-invert" 
            dangerouslySetInnerHTML={{ __html: product.description || 'No details available.' }} 
          />
        )}
      </div>
      
      {/* Returns Tab */}
      <div className="border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => toggleTab('returns')}
          className="w-full flex justify-between items-center py-4 text-left"
          aria-expanded={activeTab === 'returns'}
        >
          <h3 className="text-lg font-medium dark:text-white">30-DAY RETURNS: STORE CREDIT</h3>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transition-transform ${activeTab === 'returns' ? 'transform rotate-180' : ''}`}
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
        
        {activeTab === 'returns' && (
          <div className="py-4 prose prose-sm max-w-none dark:prose-invert">
            <p>We offer a 30-day return policy for most items. Returns are eligible for store credit only.</p>
            <p>To be eligible for a return, your item must be unused and in the same condition that you received it. It must also be in the original packaging.</p>
            <p>To initiate a return, please contact our customer service team with your order number and reason for return.</p>
            <p>Please note:</p>
            <ul>
              <li>Sale items are final sale and cannot be returned unless defective</li>
              <li>Custom and personalized items cannot be returned</li>
              <li>Shipping costs are non-refundable</li>
            </ul>
          </div>
        )}
      </div>
      
      {/* Shipping Tab */}
      <div className="border-t border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => toggleTab('shipping')}
          className="w-full flex justify-between items-center py-4 text-left"
          aria-expanded={activeTab === 'shipping'}
        >
          <h3 className="text-lg font-medium dark:text-white">SHIPPING</h3>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transition-transform ${activeTab === 'shipping' ? 'transform rotate-180' : ''}`}
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
        
        {activeTab === 'shipping' && (
          <div className="py-4 prose prose-sm max-w-none dark:prose-invert">
            <p>Free domestic shipping. Allow 14 Business days for delivery</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductTabs;
