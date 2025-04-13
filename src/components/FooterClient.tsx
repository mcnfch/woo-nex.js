'use client';

import Link from 'next/link';
import { Category } from '../lib/woocommerce';

interface FooterClientProps {
  categories: Category[];
  topLevelCategories: Category[];
}

const FooterClient = ({ topLevelCategories }: FooterClientProps) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer 
      className="footer-static" 
      style={{
        background: '#171717',
        color: '#ffffff',
        padding: '60px 0 30px',
        marginTop: '40px',
        colorScheme: 'normal' // Prevent color scheme preferences from affecting this element
      } as React.CSSProperties}
    >
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 20px'
      }}>
        {/* Main Footer Content */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '40px',
          marginBottom: '40px'
        }}>
          {/* Company Info */}
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', color: '#ffffff' }}>
              Groovy Gallery Designs
            </h3>
            <p style={{ fontSize: '14px', lineHeight: '1.6', marginBottom: '20px', color: '#ffffff' }}>
              Your one-stop shop for unique, high-quality designs that express your individuality and style.
            </p>
            <div style={{ display: 'flex', gap: '15px' }}>
              {/* Social Media Icons */}
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" style={{ color: '#ffffff' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" style={{ color: '#ffffff' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" style={{ color: '#ffffff' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                </svg>
              </a>
            </div>
          </div>

          {/* Shop Categories */}
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', color: '#ffffff' }}>
              Shop Categories
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {topLevelCategories.slice(0, 6).map(category => (
                <li key={category.id} style={{ marginBottom: '10px' }}>
                  <Link 
                    href={`/product-category/${category.slug}`}
                    style={{ 
                      color: '#ffffff', 
                      textDecoration: 'none',
                      fontSize: '14px',
                      transition: 'color 0.2s'
                    }}
                    onMouseOver={(e) => {
                      (e.target as HTMLElement).style.color = '#cccccc';
                    }}
                    onMouseOut={(e) => {
                      (e.target as HTMLElement).style.color = '#ffffff';
                    }}
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
              <li style={{ marginBottom: '10px' }}>
                <Link 
                  href="/custom-designs"
                  style={{ 
                    color: '#ffffff', 
                    textDecoration: 'none',
                    fontSize: '14px',
                    transition: 'color 0.2s'
                  }}
                  onMouseOver={(e) => {
                    (e.target as HTMLElement).style.color = '#cccccc';
                  }}
                  onMouseOut={(e) => {
                    (e.target as HTMLElement).style.color = '#ffffff';
                  }}
                >
                  Custom Designs
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', color: '#ffffff' }}>
              Customer Service
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: '10px' }}>
                <Link 
                  href="/contact"
                  style={{ 
                    color: '#ffffff', 
                    textDecoration: 'none',
                    fontSize: '14px',
                    transition: 'color 0.2s'
                  }}
                  onMouseOver={(e) => {
                    (e.target as HTMLElement).style.color = '#cccccc';
                  }}
                  onMouseOut={(e) => {
                    (e.target as HTMLElement).style.color = '#ffffff';
                  }}
                >
                  Contact Us
                </Link>
              </li>
              <li style={{ marginBottom: '10px' }}>
                <Link 
                  href="/faq"
                  style={{ 
                    color: '#ffffff', 
                    textDecoration: 'none',
                    fontSize: '14px',
                    transition: 'color 0.2s'
                  }}
                  onMouseOver={(e) => {
                    (e.target as HTMLElement).style.color = '#cccccc';
                  }}
                  onMouseOut={(e) => {
                    (e.target as HTMLElement).style.color = '#ffffff';
                  }}
                >
                  FAQ
                </Link>
              </li>
              <li style={{ marginBottom: '10px' }}>
                <Link 
                  href="/shipping"
                  style={{ 
                    color: '#ffffff', 
                    textDecoration: 'none',
                    fontSize: '14px',
                    transition: 'color 0.2s'
                  }}
                  onMouseOver={(e) => {
                    (e.target as HTMLElement).style.color = '#cccccc';
                  }}
                  onMouseOut={(e) => {
                    (e.target as HTMLElement).style.color = '#ffffff';
                  }}
                >
                  Shipping & Returns
                </Link>
              </li>
              <li style={{ marginBottom: '10px' }}>
                <Link 
                  href="/privacy-policy"
                  style={{ 
                    color: '#ffffff', 
                    textDecoration: 'none',
                    fontSize: '14px',
                    transition: 'color 0.2s'
                  }}
                  onMouseOver={(e) => {
                    (e.target as HTMLElement).style.color = '#cccccc';
                  }}
                  onMouseOut={(e) => {
                    (e.target as HTMLElement).style.color = '#ffffff';
                  }}
                >
                  Privacy Policy
                </Link>
              </li>
              <li style={{ marginBottom: '10px' }}>
                <Link 
                  href="/terms"
                  style={{ 
                    color: '#ffffff', 
                    textDecoration: 'none',
                    fontSize: '14px',
                    transition: 'color 0.2s'
                  }}
                  onMouseOver={(e) => {
                    (e.target as HTMLElement).style.color = '#cccccc';
                  }}
                  onMouseOut={(e) => {
                    (e.target as HTMLElement).style.color = '#ffffff';
                  }}
                >
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', color: '#ffffff' }}>
              Stay Updated
            </h3>
            <p style={{ fontSize: '14px', lineHeight: '1.6', marginBottom: '15px', color: '#ffffff' }}>
              Subscribe to our newsletter for exclusive deals and updates.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input 
                type="email" 
                placeholder="Your email address"
                style={{
                  padding: '10px 15px',
                  fontSize: '14px',
                  border: '1px solid #333',
                  borderRadius: '4px',
                  background: '#333',
                  color: '#fff'
                }}
              />
              <button
                style={{
                  padding: '10px 15px',
                  fontSize: '14px',
                  backgroundColor: '#ffffff',
                  color: '#000000',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => {
                  (e.target as HTMLElement).style.backgroundColor = '#cccccc';
                }}
                onMouseOut={(e) => {
                  (e.target as HTMLElement).style.backgroundColor = '#ffffff';
                }}
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div style={{ marginBottom: '30px' }}>
          <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '15px', color: '#ffffff' }}>
            Payment Methods
          </h4>
          <div style={{ display: 'flex', gap: '15px' }}>
            <div style={{ 
              background: '#333', 
              padding: '5px 10px', 
              borderRadius: '4px',
              fontSize: '12px',
              color: '#ffffff'
            }}>
              Visa
            </div>
            <div style={{ 
              background: '#333', 
              padding: '5px 10px', 
              borderRadius: '4px',
              fontSize: '12px',
              color: '#ffffff'
            }}>
              Mastercard
            </div>
            <div style={{ 
              background: '#333', 
              padding: '5px 10px', 
              borderRadius: '4px',
              fontSize: '12px',
              color: '#ffffff'
            }}>
              PayPal
            </div>
            <div style={{ 
              background: '#333', 
              padding: '5px 10px', 
              borderRadius: '4px',
              fontSize: '12px',
              color: '#ffffff'
            }}>
              Apple Pay
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: '#333', margin: '20px 0' }}></div>

        {/* Copyright */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
          fontSize: '14px',
          color: '#ffffff'
        }}>
          <div style={{ color: '#ffffff' }}>
            &copy; {currentYear} Groovy Gallery Designs. All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <Link 
              href="/sitemap"
              style={{ 
                color: '#999', 
                textDecoration: 'none'
              }}
              onMouseOver={(e) => {
                (e.target as HTMLElement).style.color = '#ffffff';
              }}
              onMouseOut={(e) => {
                (e.target as HTMLElement).style.color = '#999';
              }}
            >
              Sitemap
            </Link>
            <Link 
              href="/accessibility"
              style={{ 
                color: '#999', 
                textDecoration: 'none'
              }}
              onMouseOver={(e) => {
                (e.target as HTMLElement).style.color = '#ffffff';
              }}
              onMouseOut={(e) => {
                (e.target as HTMLElement).style.color = '#999';
              }}
            >
              Accessibility
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterClient;
