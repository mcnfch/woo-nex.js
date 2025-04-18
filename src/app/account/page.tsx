import React from 'react';
import { Metadata } from 'next';
import AccountPageClient from '../../components/AccountPage';

export const metadata: Metadata = {
  title: 'My Account | Groovy Gallery Designs',
  description: 'Manage your account, view orders, and update your information',
};

export default function AccountPage() {
  return <AccountPageClient />;
}
