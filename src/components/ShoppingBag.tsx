'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useShoppingBag } from '../context/ShoppingBagContext';
import CheckoutButton from './CheckoutButton';

const ShoppingBag = () => {
  const { isOpen, closeBag, cartItems, removeItem, updateQuantity, loading, error } = useShoppingBag();
  const [isSuccess, setIsSuccess] = useState(false);

  // Prevent body scrolling when bag is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  // Show success message when items are in the cart
  useEffect(() => {
    if (isOpen && cartItems.length > 0) {
      setIsSuccess(true);
    }
  }, [isOpen, cartItems.length]);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={closeBag}
        />
      )}
      
      {/* Shopping Bag Slide-out */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white dark:bg-gray-900 z-50 transform transition-transform duration-300 ease-in-out shadow-xl ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">SHOPPING BAG</h2>
            <button 
              onClick={closeBag}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              aria-label="Close shopping bag"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          
          {/* Success Message - Only show when items are in the cart */}
          {cartItems.length > 0 && isSuccess && (
            <div className="p-2 text-gray-800 text-xs" style={{ backgroundColor: '#ffb6c1' }}>
              Great choice! You are one step closer to enjoying your gear!
            </div>
          )}
          
          {/* Error Message */}
          {error && (
            <div className="bg-red-100 dark:bg-red-900 p-3 text-red-800 dark:text-red-200 text-sm">
              {error}
            </div>
          )}
          
          {/* Cart Items */}
          <div className="flex-grow overflow-y-auto p-4">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
              </div>
            ) : cartItems.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400">Your shopping bag is empty</p>
                <button
                  type="button"
                  onClick={closeBag}
                  className="mt-4 inline-block text-purple-600 dark:text-purple-400 hover:underline"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <ul className="space-y-4">
                {cartItems.map((item, idx) => (
                  <li key={item.id + '-' + idx} className="flex space-x-4 border-b border-gray-200 dark:border-gray-700 pb-4">
                    <div className="w-20 h-24 relative flex-shrink-0 bg-gray-100 dark:bg-gray-800">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-bold text-gray-900 dark:text-white">{item.name}</h3>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        <p>Size: {item.size || 'N/A'}</p>
                        <p>Items: {item.variation_id ? 'Variation' : 'Standard'}</p>
                      </div>
                      <div className="flex items-center mt-2">
                        <button 
                          className="w-6 h-6 flex items-center justify-center border border-gray-900 dark:border-gray-600 text-black dark:text-white bg-white dark:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"
                          onClick={() => item.quantity > 1 && updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity === 1}
                          aria-label="Decrease quantity"
                        >
                          <span className="font-bold">−</span>
                        </button>
                        <span className="mx-2 w-6 text-center text-black dark:text-white bg-white dark:bg-gray-800">{item.quantity}</span>
                        <button 
                          className="w-6 h-6 flex items-center justify-center border border-gray-900 dark:border-gray-600 text-black dark:text-white bg-white dark:bg-gray-800"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          aria-label="Increase quantity"
                        >
                          <span className="font-bold">+</span>
                        </button>
                        <button 
                          className="ml-4 flex items-center justify-center p-1 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-500"
                          onClick={() => removeItem(item.id)}
                          aria-label="Remove item"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0 1 16.138 21H7.862a2 2 0 0 1-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3m-7 0h10" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-gray-900 dark:text-white">${item.price}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          {/* Footer with totals and checkout button */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800">
            <div className="flex justify-between mb-4">
              <span className="font-bold text-gray-900 dark:text-white">SUBTOTAL</span>
              <span className="font-bold text-gray-900 dark:text-white">${cartItems.reduce((acc, item) => acc + parseFloat(item.price) * item.quantity, 0).toFixed(2)} USD</span>
            </div>
            <CheckoutButton className="bg-purple-600 hover:bg-purple-700" />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
              Shipping, taxes, and discount codes are calculated at checkout
            </p>
            <div className="flex justify-center space-x-2 mt-4 bg-white rounded-lg p-3 shadow border border-gray-200 dark:bg-gray-900 dark:border-gray-700">
              <ul className="supporting-menu__payment payment-icon inline-list flex space-x-2">
                <li>
                  <svg className="payment-icon" version="1.1" xmlns="http://www.w3.org/2000/svg" role="img" x="0" y="0" width="38" height="24" viewBox="0 0 165.521 105.965" xmlSpace="preserve" aria-labelledby="pi-apple_pay"><title id="pi-apple_pay">Apple Pay</title><path fill="#000" d="M150.698 0H14.823c-.566 0-1.133 0-1.698.003-.477.004-.953.009-1.43.022-1.039.028-2.087.09-3.113.274a10.51 10.51 0 0 0-2.958.975 9.932 9.932 0 0 0-4.35 4.35 10.463 10.463 0 0 0-.975 2.96C.113 9.611.052 10.658.024 11.696a70.22 70.22 0 0 0-.022 1.43C0 13.69 0 14.256 0 14.823v76.318c0 .567 0 1.132.002 1.699.003.476.009.953.022 1.43.028 1.036.09 2.084.275 3.11a10.46 10.46 0 0 0 .974 2.96 9.897 9.897 0 0 0 1.83 2.52 9.874 9.874 0 0 0 2.52 1.83c.947.483 1.917.79 2.96.977 1.025.183 2.073.245 3.112.273.477.011.953.017 1.43.02.565.004 1.132.004 1.698.004h135.875c.565 0 1.132 0 1.697-.004.476-.002.952-.009 1.431-.02 1.037-.028 2.085-.09 3.113-.273a10.478 10.478 0 0 0 2.958-.977 9.955 9.955 0 0 0 4.35-4.35c.483-.947.789-1.917.974-2.96.186-1.026.246-2.074.274-3.11.013-.477.02-.954.022-1.43.004-.567.004-1.132.004-1.699V14.824c0-.567 0-1.133-.004-1.699a63.067 63.067 0 0 0-.022-1.429c-.028-1.038-.088-2.085-.274-3.112a10.4 10.4 0 0 0-.974-2.96 9.94 9.94 0 0 0-4.352-4.35A10.52 10.52 0 0 0 156.939.3c-1.028-.185-2.076-.246-3.113-.274a71.417 71.417 0 0 0-1.431-.022C151.83 0 151.263 0 150.698 0z"></path><path fill="#FFF" d="M150.698 3.532l1.672.003c.452.003.905.008 1.36.02.793.022 1.719.065 2.583.22.75.135 1.38.34 1.984.648a6.392 6.392 0 0 1 2.804 2.807c.306.6.51 1.226.645 1.983.154.854.197 1.783.218 2.58.013.45.019.9.02 1.36.005.557.005 1.113.005 1.671v76.318c0 .558 0 1.114-.004 1.682-.002.45-.008.9-.02 1.35-.022.796-.065 1.725-.221 2.589a6.855 6.855 0 0 1-.645 1.975 6.397 6.397 0 0 1-2.808 2.807c-.6.306-1.228.511-1.971.645-.881.157-1.847.2-2.574.22-.457.01-0.912.017-1.379.019-.555.004-1.113.004-1.669.004H14.801c-.55 0-1.1 0-1.66-.004a74.993 74.993 0 0 1-1.35-.018c-.744-.02-1.71-.064-2.584-.22a6.938 6.938 0 0 1-1.986-.65 6.337 6.337 0 0 1-1.622-1.18 6.355 6.355 0 0 1-1.178-1.623 6.935 6.935 0 0 1-.646-1.985c-.156-.863-.2-1.788-.22-2.578a66.088 66.088 0 0 1-.02-1.355l-.003-1.327V14.474l.002-1.325a66.7 66.7 0 0 1 .02-1.357c.022-.792.065-1.717.222-2.587a6.924 6.924 0 0 1 .646-1.981c.304-.598.7-1.144 1.18-1.623a6.386 6.386 0 0 1 1.624-1.18 6.96 6.96 0 0 1 1.98-.646c.865-.155 1.792-.198 2.586-.22.452-.012.905-.017 1.354-.02l1.677-.003h135.875"></path><g><g><path fill="#000" d="M43.508 35.77c1.404-1.755 2.356-4.112 2.105-6.52-2.054.102-4.56 1.355-6.012 3.112-1.303 1.504-2.456 3.959-2.156 6.266 2.306.2 4.61-1.152 6.063-2.858"></path><path fill="#000" d="M45.587 39.079c-3.35-.2-6.196 1.9-7.795 1.9-1.6 0-4.049-1.8-6.698-1.751-3.447.05-6.645 2-8.395 5.1-3.598 6.2-.95 15.4 2.55 20.45 1.699 2.5 3.747 5.25 6.445 5.151 2.55-.1 3.549-1.65 6.647-1.65 3.097 0 3.997 1.65 6.696 1.6 2.798-.05 4.548-2.5 6.247-5 1.95-2.85 2.747-5.6 2.797-5.75-.05-.05-5.396-2.101-5.446-8.251-.05-5.15 4.198-7.6 4.398-7.751-2.399-3.548-6.147-3.948-7.447-4.048"></path></g><g><path fill="#000" d="M78.973 32.11c7.278 0 12.347 5.017 12.347 12.321 0 7.33-5.173 12.373-12.529 12.373h-8.058V69.62h-5.822V32.11h14.062zm-8.24 19.807h6.68c5.07 0 7.954-2.729 7.954-7.46 0-4.73-2.885-7.434-7.928-7.434h-6.706v14.894z"></path><path d="M92.764 61.847c0-4.809 3.665-7.564 10.423-7.98l7.252-.442v-2.08c0-3.04-2.001-4.704-5.562-4.704-2.938 0-5.07 1.507-5.51 3.82h-5.252c.157-4.86 4.731-8.395 10.918-8.395 6.654 0 10.995 3.483 10.995 8.89v18.663h-5.38v-4.497h-.13c-1.534 2.937-4.914 4.782-8.579 4.782-5.406 0-9.175-3.222-9.175-8.057zm17.675-2.417v-2.106l-6.472.416c-3.64.234-5.536 1.585-5.536 3.95 0 2.288 1.975 3.77 5.068 3.77 3.95 0 6.94-2.522 6.94-6.03z"></path><path d="M120.975 79.652v-4.496c.364.051 1.247.103 1.715.103 2.573 0 4.029-1.09 4.913-3.899l.52-1.663-9.852-27.293h6.082l6.863 22.146h.13l6.862-22.146h5.927l-10.216 28.67c-2.34 6.577-5.017 8.735-10.683 8.735-.442 0-1.872-.052-2.261-.157z"></path></g></g></svg>
                </li>
                <li>
                <svg className="payment-icon border border-black" xmlns="http://www.w3.org/2000/svg" role="img" viewBox="0 0 38 24" width="38" height="24" aria-labelledby="pi-google_pay"><title id="pi-google_pay">Google Pay</title><path opacity=".07" d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3z"></path><path fill="#FFF" d="M35 1c1.1 0 2 .9 2 2v18c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V3c0-1.1.9-2 2-2h32"></path><path d="M18.093 11.976v3.2h-1.018v-7.9h2.691a2.447 2.447 0 0 1 1.747.692 2.28 2.28 0 0 1 .11 3.224l-.11.116c-.47.447-1.098.69-1.747.674l-1.673-.006zm0-3.732v2.788h1.698c.377.012.741-.135 1.005-.404a1.391 1.391 0 0 0-1.005-2.354l-1.698-.03zm6.484 1.348c.65-.03 1.286.188 1.778.613.445.43.682 1.03.65 1.649v3.334h-.969v-.766h-.049a1.93 1.93 0 0 1-1.673.931 2.17 2.17 0 0 1-1.496-.533 1.667 1.667 0 0 1-.613-1.324 1.606 1.606 0 0 1 .613-1.336 2.746 2.746 0 0 1 1.698-.515c.517-.02 1.03.093 1.49.331v-.208a1.134 1.134 0 0 0-.417-.901 1.416 1.416 0 0 0-.98-.368 1.545 1.545 0 0 0-1.319.717l-.895-.564a2.488 2.488 0 0 1 2.182-1.06zM23.29 13.52a.79.79 0 0 0 .337.662c.223.176.5.269.785.263.429-.001.84-.17 1.146-.472.305-.286.478-.685.478-1.103a2.047 2.047 0 0 0-1.324-.374 1.716 1.716 0 0 0-1.03.294.883.883 0 0 0-.392.73zm9.286-3.75l-3.39 7.79h-1.048l1.281-2.728-2.224-5.062h1.103l1.612 3.885 1.569-3.885h1.097z" fill="#5F6368"></path><path d="M13.986 11.284c0-.308-.024-.616-.073-.92h-4.29v1.747h2.451a2.096 2.096 0 0 1-.9 1.373v1.134h1.464a4.433 4.433 0 0 0 1.348-3.334z" fill="#4285F4"></path><path d="M9.629 15.721a4.352 4.352 0 0 0 3.01-1.097l-1.466-1.14a2.752 2.752 0 0 1-4.094-1.44H5.577v1.17a4.53 4.53 0 0 0 4.052 2.507z" fill="#34A853"></path><path d="M7.079 12.05a2.709 2.709 0 0 1 0-1.735v-1.17H5.577a4.505 4.505 0 0 0 0 4.075l1.502-1.17z" fill="#FBBC04"></path><path d="M9.629 8.44a2.452 2.452 0 0 1 1.74.68l1.3-1.293a4.37 4.37 0 0 0-3.065-1.183 4.53 4.53 0 0 0-4.027 2.5l1.502 1.171a2.715 2.715 0 0 1 2.55-1.875z" fill="#EA4335"></path></svg>
                </li>
                <li>
                  <svg className="payment-icon border border-black" width="38" height="24" viewBox="0 -0.522 3.325 3.325" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g transform="scale(1.6) translate(-0.60, -0.41)">
                      <path x="0.5" y="0.5" width="69" height="47" rx="5.5" fill="white" stroke="#D9D9D9" d="M0.285 0.024h2.755a0.261 0.261 0 0 1 0.261 0.261v1.71a0.261 0.261 0 0 1 -0.261 0.261H0.285a0.261 0.261 0 0 1 -0.261 -0.261V0.285A0.261 0.261 0 0 1 0.285 0.024z" strokeWidth="0.047499999999999994"/>
                      <path fillRule="evenodd" clipRule="evenodd" d="m1.786 0.774 -0.169 0.036V0.674l0.169 -0.035zm0.351 0.076a0.19 0.19 0 0 0 -0.131 0.052L1.997 0.861h-0.149v0.782l0.168 -0.035v-0.19a0.19 0.19 0 0 0 0.119 0.043c0.12 0 0.23 -0.097 0.23 -0.309 0 -0.195 -0.112 -0.301 -0.23 -0.301M2.095 1.314a0.095 0.095 0 0 1 -0.079 -0.032V1.034a0.095 0.095 0 0 1 0.081 -0.033c0.062 0 0.103 0.068 0.103 0.157S2.158 1.314 2.096 1.314M2.897 1.157c0 -0.173 -0.084 -0.307 -0.242 -0.307 -0.16 0 -0.257 0.136 -0.257 0.306 0 0.203 0.114 0.304 0.279 0.304a0.364 0.364 0 0 0 0.187 -0.044V1.281a0.364 0.364 0 0 1 -0.165 0.036c-0.065 0 -0.123 -0.022 -0.13 -0.101h0.329V1.194L2.901 1.156m-0.332 -0.063c0 -0.076 0.046 -0.108 0.089 -0.108 0.041 0 0.085 0.032 0.085 0.108zM1.621 0.86h0.169v0.587h-0.169zm-0.192 0L1.441 0.909C1.48 0.836 1.56 0.852 1.58 0.86v0.155C1.56 1.007 1.491 0.997 1.452 1.05v0.397H1.284v-0.586zM1.104 0.714 0.939 0.749v0.538c0 0.1 0.074 0.173 0.174 0.173Q1.197 1.458 1.23 1.438V1.301C1.208 1.311 1.102 1.341 1.102 1.241V1.002h0.128v-0.142H1.102zM0.706 0.994Q0.652 0.993 0.649 1.031c0 0.028 0.036 0.041 0.082 0.057 0.074 0.025 0.174 0.059 0.174 0.182 0 0.12 -0.097 0.19 -0.236 0.19A0.475 0.475 0 0 1 0.486 1.422V1.262a0.475 0.475 0 0 0 0.184 0.054C0.708 1.316 0.735 1.306 0.735 1.275S0.695 1.229 0.646 1.211C0.568 1.184 0.475 1.151 0.475 1.039c0 -0.119 0.09 -0.19 0.228 -0.19q0.084 0 0.166 0.03v0.158A0.38 0.38 0 0 0 0.703 0.994" fill="#6461FC"/>
                    </g>
                  </svg>
                </li>
                <li>
                <Image 
                  src="/images/card-icons/amazon-pay-icon.png"
                  alt="Amazon Pay"
                  width={38}
                  height={24}
                  className="payment-icon border border-black"
                  style={{ background: 'white' }}
                />
                </li>
                <li>
                  <svg className="payment-icon border border-black" viewBox="0 0 38 24" xmlns="http://www.w3.org/2000/svg" role="img" width="38" height="24" aria-labelledby="pi-master"><title id="pi-master">Mastercard</title><path opacity=".07" d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3z"></path><path fill="#fff" d="M35 1c1.1 0 2 .9 2 2v18c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V3c0-1.1.9-2 2-2h32"></path><circle fill="#EB001B" cx="15" cy="12" r="7"></circle><circle fill="#F79E1B" cx="23" cy="12" r="7"></circle><path fill="#FF5F00" d="M22 12c0-2.4-1.2-4.5-3-5.7-1.8 1.3-3 3.4-3 5.7s1.2 4.5 3 5.7c1.8-1.2 3-3.3 3-5.7z"></path></svg>
                </li>
                <li>
                  <svg className="payment-icon border border-black" viewBox="0 0 38 24" xmlns="http://www.w3.org/2000/svg" role="img" width="38" height="24" aria-labelledby="pi-visa"><title id="pi-visa">Visa</title><path opacity=".07" d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3z"></path><path fill="#fff" d="M35 1c1.1 0 2 .9 2 2v18c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V3c0-1.1.9-2 2-2h32"></path><path d="M28.3 10.1H28c-.4 1-.7 1.5-1 3h1.9c-.3-1.5-.3-2.2-.6-3zm2.9 5.9h-1.7c-.1 0-.1 0-.2-.1l-.2-.9-.1-.2h-2.4c-.1 0-.2 0-.2.2l-.3.9c0 .1-.1.1-.1.1h-2.1l.2-.5L27 8.7c0-.5.3-.7.8-.7h1.5c.1 0 .2 0 .2.2l1.4 6.5c.1.4.2.7.2 1.1.1.1.1.1.1.2zm-13.4-.3l.4-1.8c.1 0 .2.1.2.1.7.3 1.4.5 2.1.4.2 0 .5-.1.7-.2.5-.2.5-.7.1-1.1-.2-.2-.5-.3-.8-.5-.4-.2-.8-.4-1.1-.7-1.2-1-.8-2.4-.1-3.1.6-.4.9-.8 1.7-.8 1.2 0 2.5 0 3.1.2h.1c-.1.6-.2 1.1-.4 1.7-.5-.2-1-.4-1.5-.4-.3 0-.6 0-.9.1-.2 0-.3.1-.4.2-.2.2-.2.5 0 .7l.5.4c.4.2.8.4 1.1.6.5.3 1 .8 1.1 1.4.2.9-.1 1.7-.9 2.3-.5.4-.7.6-1.4.6-1.4 0-2.5.1-3.4-.2-.1.2-.1.2-.2.1zm-3.5.3c.1-.7.1-.7.2-1 .5-2.2 1-4.5 1.4-6.7.1-.2.1-.3.3-.3H18c-.2 1.2-.4 2.1-.7 3.2-.3 1.5-.6 3-1 4.5 0 .2-.1.2-.3.2M5 8.2c0-.1.2-.2.3-.2h3.4c.5 0 .9.3 1 .8l.9 4.4c0 .1 0 .1.1.2 0-.1.1-.1.1-.1l2.1-5.1c-.1-.1 0-.2.1-.2h2.1c0 .1 0 .1-.1.2l-3.1 7.3c-.1.2-.1.3-.2.4-.1.1-.3 0-.5 0H9.7c-.1 0-.2 0-.2-.2L7.9 9.5c-.2-.2-.5-.5-.9-.6-.6-.3-1.7-.5-1.9-.5L5 8.2z" fill="#142688"></path></svg>
                </li>
                <li>
                <Image 
                  src="/images/payments/afterpay-icon.svg"
                  alt="Afterpay"
                  width={38}
                  height={24}
                  className="payment-icon"
                />
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};


export default ShoppingBag;
