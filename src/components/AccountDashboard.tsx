'use client';

import React, { useState, useEffect } from 'react';

interface Customer {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  billing: Address;
  shipping: Address;
}

interface Address {
  first_name: string;
  last_name: string;
  company: string;
  address_1: string;
  address_2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  email?: string;
  phone?: string;
}

interface Order {
  id: number;
  number: string;
  status: string;
  date_created: string;
  total: string;
  line_items: LineItem[];
}

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

// AddressForm component
interface AddressFormProps {
  title: string;
  initialAddress: Address;
  onSubmit: (address: Address) => void;
}

function AddressForm({ title, initialAddress, onSubmit }: AddressFormProps) {
  const [address, setAddress] = useState<Address>(initialAddress || {
    first_name: '',
    last_name: '',
    company: '',
    address_1: '',
    address_2: '',
    city: '',
    state: '',
    postcode: '',
    country: '',
    email: '',
    phone: ''
  });
  
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Call the parent component's onSubmit function
    onSubmit(address);
    
    // Reset saving state after a short delay
    setTimeout(() => {
      setIsSaving(false);
    }, 1000);
  };

  // List of countries - this is a simplified list, you might want to use a more complete one
  const countries = [
    { code: 'US', name: 'United States' },
    { code: 'CA', name: 'Canada' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'AU', name: 'Australia' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' },
    { code: 'IT', name: 'Italy' },
    { code: 'ES', name: 'Spain' },
    { code: 'JP', name: 'Japan' },
    { code: 'CN', name: 'China' }
  ];

  // List of US states - again, this is simplified
  const usStates = [
    { code: 'AL', name: 'Alabama' },
    { code: 'AK', name: 'Alaska' },
    { code: 'AZ', name: 'Arizona' },
    { code: 'AR', name: 'Arkansas' },
    { code: 'CA', name: 'California' },
    { code: 'CO', name: 'Colorado' },
    { code: 'CT', name: 'Connecticut' },
    { code: 'DE', name: 'Delaware' },
    { code: 'FL', name: 'Florida' },
    { code: 'GA', name: 'Georgia' },
    { code: 'HI', name: 'Hawaii' },
    { code: 'ID', name: 'Idaho' },
    { code: 'IL', name: 'Illinois' },
    { code: 'IN', name: 'Indiana' },
    { code: 'IA', name: 'Iowa' },
    { code: 'KS', name: 'Kansas' },
    { code: 'KY', name: 'Kentucky' },
    { code: 'LA', name: 'Louisiana' },
    { code: 'ME', name: 'Maine' },
    { code: 'MD', name: 'Maryland' },
    { code: 'MA', name: 'Massachusetts' },
    { code: 'MI', name: 'Michigan' },
    { code: 'MN', name: 'Minnesota' },
    { code: 'MS', name: 'Mississippi' },
    { code: 'MO', name: 'Missouri' },
    { code: 'MT', name: 'Montana' },
    { code: 'NE', name: 'Nebraska' },
    { code: 'NV', name: 'Nevada' },
    { code: 'NH', name: 'New Hampshire' },
    { code: 'NJ', name: 'New Jersey' },
    { code: 'NM', name: 'New Mexico' },
    { code: 'NY', name: 'New York' },
    { code: 'NC', name: 'North Carolina' },
    { code: 'ND', name: 'North Dakota' },
    { code: 'OH', name: 'Ohio' },
    { code: 'OK', name: 'Oklahoma' },
    { code: 'OR', name: 'Oregon' },
    { code: 'PA', name: 'Pennsylvania' },
    { code: 'RI', name: 'Rhode Island' },
    { code: 'SC', name: 'South Carolina' },
    { code: 'SD', name: 'South Dakota' },
    { code: 'TN', name: 'Tennessee' },
    { code: 'TX', name: 'Texas' },
    { code: 'UT', name: 'Utah' },
    { code: 'VT', name: 'Vermont' },
    { code: 'VA', name: 'Virginia' },
    { code: 'WA', name: 'Washington' },
    { code: 'WV', name: 'West Virginia' },
    { code: 'WI', name: 'Wisconsin' },
    { code: 'WY', name: 'Wyoming' }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor={`${title}-first-name`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              First Name
            </label>
            <input
              type="text"
              id={`${title}-first-name`}
              name="first_name"
              value={address.first_name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>
          <div>
            <label htmlFor={`${title}-last-name`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Last Name
            </label>
            <input
              type="text"
              id={`${title}-last-name`}
              name="last_name"
              value={address.last_name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>
        </div>
        
        <div>
          <label htmlFor={`${title}-company`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Company (Optional)
          </label>
          <input
            type="text"
            id={`${title}-company`}
            name="company"
            value={address.company}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        
        <div>
          <label htmlFor={`${title}-address-1`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Street Address
          </label>
          <input
            type="text"
            id={`${title}-address-1`}
            name="address_1"
            value={address.address_1}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            required
          />
        </div>
        
        <div>
          <label htmlFor={`${title}-address-2`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Apartment, Suite, etc. (Optional)
          </label>
          <input
            type="text"
            id={`${title}-address-2`}
            name="address_2"
            onChange={handleChange}
            value={address.address_2}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        
        <div>
          <label htmlFor={`${title}-city`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            City
          </label>
          <input
            type="text"
            id={`${title}-city`}
            name="city"
            value={address.city}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            required
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor={`${title}-country`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Country
            </label>
            <select
              id={`${title}-country`}
              name="country"
              value={address.country}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            >
              <option value="">Select Country</option>
              {countries.map(country => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor={`${title}-state`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              State/Province
            </label>
            {address.country === 'US' ? (
              <select
                id={`${title}-state`}
                name="state"
                value={address.state}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              >
                <option value="">Select State</option>
                {usStates.map(state => (
                  <option key={state.code} value={state.code}>
                    {state.name}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                id={`${title}-state`}
                name="state"
                value={address.state}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            )}
          </div>
        </div>
        
        <div>
          <label htmlFor={`${title}-postcode`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Postal Code
          </label>
          <input
            type="text"
            id={`${title}-postcode`}
            name="postcode"
            value={address.postcode}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            required
          />
        </div>
        
        <div>
          <label htmlFor={`${title}-phone`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Phone
          </label>
          <input
            type="tel"
            id={`${title}-phone`}
            name="phone"
            value={address.phone || ''}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            required
          />
        </div>
        
        {title === 'Billing Address' && (
          <div>
            <label htmlFor={`${title}-email`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id={`${title}-email`}
              name="email"
              value={address.email || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>
        )}
        
        <div>
          <button
            type="submit"
            disabled={isSaving}
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : 'Save Address'}
          </button>
        </div>
      </form>
    </div>
  );
}

// OrdersList component
interface OrdersListProps {
  orders: Order[];
}

function OrdersList({ orders }: OrdersListProps) {
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

export default function AccountDashboard() {
  const [activeTab, setActiveTab] = useState<'addresses' | 'orders'>('addresses');
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useShippingForBilling, setUseShippingForBilling] = useState(false);

  // Fetch customer data and orders when component mounts
  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        setLoading(true);
        
        // Get customer data
        const customerResponse = await fetch('/api/customer/me');
        
        if (!customerResponse.ok) {
          // If it's a 401 unauthorized, handle silently - user is not logged in
          if (customerResponse.status === 401) {
            setLoading(false);
            return; // Exit early, no need to fetch orders
          }
          throw new Error('Failed to fetch customer data');
        }
        
        const customerData: Customer = await customerResponse.json();
        setCustomer(customerData);
        
        // Get customer orders - use the username to identify the customer
        // This ensures we're getting orders for the correct customer
        console.log('Fetching orders for customer ID:', customerData.id);
        const ordersResponse = await fetch(`/api/orders?customer=${customerData.id}`);
        
        if (!ordersResponse.ok) {
          throw new Error('Failed to fetch orders');
        }
        
        const ordersData: Order[] = await ordersResponse.json();
        console.log('Orders data:', ordersData);
        setOrders(ordersData);
        
        // Check if billing and shipping are the same
        if (customerData.billing && customerData.shipping) {
          const sameAddress = 
            customerData.billing.address_1 === customerData.shipping.address_1 &&
            customerData.billing.city === customerData.shipping.city &&
            customerData.billing.state === customerData.shipping.state &&
            customerData.billing.postcode === customerData.shipping.postcode &&
            customerData.billing.country === customerData.shipping.country;
          
          setUseShippingForBilling(sameAddress);
        }
      } catch (err) {
        console.error('Error fetching customer data:', err);
        setError('Failed to load your account information. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerData();
  }, []);

  // Handle address form submission
  const handleAddressSubmit = async (billingAddress: Address, shippingAddress: Address) => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/customer/update-address', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          billing: billingAddress,
          shipping: shippingAddress
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update addresses');
      }
      
      const updatedCustomer: Customer = await response.json();
      setCustomer(updatedCustomer);
      alert('Your addresses have been updated successfully!');
    } catch (err) {
      console.error('Error updating addresses:', err);
      setError('Failed to update your addresses. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      {/* Dashboard Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          className={`px-6 py-3 font-medium text-sm ${
            activeTab === 'addresses'
              ? 'text-purple-600 border-b-2 border-purple-600 dark:text-purple-400 dark:border-purple-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('addresses')}
        >
          Addresses
        </button>
        <button
          className={`px-6 py-3 font-medium text-sm ${
            activeTab === 'orders'
              ? 'text-purple-600 border-b-2 border-purple-600 dark:text-purple-400 dark:border-purple-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('orders')}
        >
          Orders
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'addresses' && customer && (
          <div>
            <h2 className="text-xl font-semibold mb-6">Your Addresses</h2>
            
            {/* Use same address for billing and shipping checkbox */}
            <div className="mb-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={useShippingForBilling}
                  onChange={(e) => setUseShippingForBilling(e.target.checked)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-gray-700 dark:text-gray-300">
                  My billing and shipping addresses are the same
                </span>
              </label>
            </div>
            
            <div className={`grid ${useShippingForBilling ? 'grid-cols-1' : 'md:grid-cols-2'} gap-8`}>
              {/* Shipping Address Form */}
              <AddressForm
                title="Shipping Address"
                initialAddress={customer.shipping}
                onSubmit={(shippingAddress: Address) => {
                  const billingAddress = useShippingForBilling ? shippingAddress : customer.billing;
                  handleAddressSubmit(billingAddress, shippingAddress);
                }}
              />
              
              {/* Billing Address Form - only show if not using shipping for billing */}
              {!useShippingForBilling && (
                <AddressForm
                  title="Billing Address"
                  initialAddress={customer.billing}
                  onSubmit={(billingAddress: Address) => {
                    handleAddressSubmit(billingAddress, customer.shipping);
                  }}
                />
              )}
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <OrdersList orders={orders} />
        )}
      </div>
    </div>
  );
}
