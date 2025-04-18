'use client';

import React, { useState } from 'react';

interface LineItem {
  id: number;
  name: string;
  quantity: number;
  price: string;
  total: string;
  image?: {
    src: string;
  };
}

interface Order {
  id: number;
  number: string;
  status: string;
  date_created: string;
  total: string;
  line_items: LineItem[];
}

interface OrdersListProps {
  orders: Order[];
}

export default function OrdersList({ orders }: OrdersListProps) {
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

  // Toggle order details
  const toggleOrderDetails = (orderId: number) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'on-hold':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-purple-100 text-purple-800';
      case 'failed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (orders.length === 0) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold mb-2">Your Orders</h2>
        <p className="text-gray-600 dark:text-gray-400">You haven&apos;t placed any orders yet.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Your Orders</h2>
      <div className="space-y-4">
        {orders.map(order => (
          <div 
            key={order.id} 
            className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
          >
            {/* Order Header */}
            <div 
              className="bg-gray-50 dark:bg-gray-800 p-4 flex flex-wrap justify-between items-center cursor-pointer"
              onClick={() => toggleOrderDetails(order.id)}
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Order</span>
                  <span className="ml-1 font-medium">#{order.number}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Placed on</span>
                  <span className="ml-1 font-medium">{formatDate(order.date_created)}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Total</span>
                  <span className="ml-1 font-medium">${order.total}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3 mt-2 sm:mt-0">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className={`h-5 w-5 text-gray-500 transition-transform ${expandedOrder === order.id ? 'transform rotate-180' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            
            {/* Order Details */}
            {expandedOrder === order.id && (
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="font-medium mb-3">Order Items</h4>
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {order.line_items.map(item => (
                    <div key={item.id} className="py-3 flex items-center">
                      {item.image && (
                        <div className="w-16 h-16 flex-shrink-0 mr-4 bg-gray-100 dark:bg-gray-700 rounded overflow-hidden">
                          <img 
                            src={item.image.src} 
                            alt={item.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <h5 className="font-medium">{item.name}</h5>
                        <div className="flex justify-between mt-1">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {item.quantity} × ${item.price}
                          </span>
                          <span className="font-medium">${item.total}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Order Actions */}
                <div className="mt-4 flex justify-end">
                  <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                    View Order Details
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
