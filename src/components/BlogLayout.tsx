import React, { ReactNode } from 'react';
import Header from './Header';
import FooterClient from './FooterClient';

interface BlogLayoutProps {
  children: ReactNode;
}

export default function BlogLayout({ children }: BlogLayoutProps) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <FooterClient 
        categories={[]} 
        topLevelCategories={[]} 
      />
    </>
  );
}
