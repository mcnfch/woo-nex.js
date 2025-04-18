'use client';

import React, { useState, useEffect } from 'react';
import AccountForms from './AccountForms';
import AccountDashboard from './AccountDashboard';

export default function AccountPageClient() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch('/api/customer/me');
        
        if (response.ok) {
          setIsLoggedIn(true);
        } else {
          // If we get a 401, user is not logged in
          setIsLoggedIn(false);
        }
      } catch (error) {
        // Only log actual network errors, not HTTP status errors
        if (!(error instanceof TypeError)) {
          console.error('Error checking auth status:', error);
        }
        setIsLoggedIn(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 mt-24">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-24">
      <h1 className="text-3xl font-bold text-center mb-8">My Account</h1>
      
      {isLoggedIn ? <AccountDashboard /> : <AccountForms onLoginSuccess={() => setIsLoggedIn(true)} />}
    </div>
  );
}
