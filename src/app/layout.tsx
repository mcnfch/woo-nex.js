import { Geist, Geist_Mono } from "next/font/google";
import { Metadata } from "next";
import { Suspense } from 'react';
import { headers } from 'next/headers';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ShoppingBagProvider } from '../context/ShoppingBagContext';
import { ThemeProvider } from '../components/theme-provider';
import SalesBanner from '../components/SalesBanner';
import Script from 'next/script';
import "./globals.css";
import { getCategories } from "../lib/woocommerce";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Groovy Gallery Designs",
  description: "Groovy Gallery Designs - Your Source for Unique Festival and Rave Fashion and Festival Camping Gear", 
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch categories at the root layout level
  const categories = await getCategories();
  
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google Tag Manager - using external script approach */}
        <Script
          id="gtm-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              // Set default consent to denied
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              
              gtag('consent', 'default', {
                'ad_storage': 'denied',
                'analytics_storage': 'denied'
              });
            `
          }}
        />
        
        {/* Load Google Tag Manager - using external script approach */}
        <Script
          id="gtm-load"
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtm.js?id=${process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID}`}
        />
        
        {/* Google Analytics 4 */}
        <Script
          id="ga4-script"
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID}`}
          strategy="afterInteractive"
        />
        <Script
          id="ga4-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID}');
            `
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white dark:bg-gray-900 text-black dark:text-white`}
      >
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe 
            src={`https://www.googletagmanager.com/ns.html?id=${process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID}`}
            height="0" 
            width="0" 
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        
        <ThemeProvider>
          <ShoppingBagProvider>
            <Header categories={categories} />
            <main className="pt-20 md:pt-20 mt-[15px]">
              {children}
            </main>
            <Footer categories={categories} />
            
            {/* Load SalesBanner with Suspense to avoid blocking */}
            <Suspense fallback={null}>
              <SalesBanner />
            </Suspense>
            
            {/* Defer non-critical scripts */}
            <Script 
              src="/scripts/analytics.js" 
              strategy="lazyOnload"
              id="analytics-script"
            />
            
            {/* Consent Banner */}
          </ShoppingBagProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
