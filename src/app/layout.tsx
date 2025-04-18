import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ShoppingBagProvider } from '../context/ShoppingBagContext';
import { ThemeProvider } from '../components/theme-provider';
import SalesBanner from '../components/SalesBanner';
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
  title: "Create Next App",
  description: "Generated by create next app",
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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white dark:bg-gray-900 text-black dark:text-white`}
      >
        <ThemeProvider>
          <ShoppingBagProvider>
            <Header categories={categories} />
            <main className="pt-20 md:pt-20">
              {children}
            </main>
            <Footer categories={categories} />
            {/* Sales Banner - will only show based on cookie status */}
            <SalesBanner />
          </ShoppingBagProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
