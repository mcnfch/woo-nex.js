# WooNext - Headless WooCommerce with Next.js

A modern, high-performance e-commerce storefront built with Next.js and headless WooCommerce. This project provides a complete solution for running an online store with fast page loads, responsive design, and an excellent user experience.

## Features

- **Headless Architecture**: Decoupled frontend and backend for better performance and flexibility
- **Next.js App Router**: Leveraging the latest Next.js features with TypeScript
- **WooCommerce Integration**: Full product catalog, categories, and ordering capabilities
- **Redis-Powered Search**: Fast, efficient product search with word-level indexing
- **Shopping Experience**:
  - Modern slide-out shopping bag
  - Persistent cart across sessions
  - Responsive product gallery with image zoom
  - Variant selection and quantity management
- **Stripe Payment Integration**: Secure checkout with Stripe
- **User Account Management**:
  - Login/register functionality
  - Order history
  - Address management
- **Custom Design System**:
  - Upload designs directly to WordPress media library
  - Two custom design workflows: "Upload Your Design" and "Work with Our Designers"
  - Secure file handling with size validation
- **Content Management**:
  - Blog integration
  - SEO-friendly content
- **Performance Optimized**:
  - Fast page loads
  - Image optimization
  - Efficient data fetching

## Getting Started

### Prerequisites

- Node.js 18.0 or later
- Redis server running locally or remotely
- WooCommerce store with REST API access

### Environment Setup

Create a `.env.local` file in the root directory with the following variables:

```
# WooCommerce API
NEXT_PUBLIC_WOOCOMMERCE_URL=https://your-woocommerce-site.com
NEXT_PUBLIC_WOOCOMMERCE_KEY=your_consumer_key
NEXT_PUBLIC_WOOCOMMERCE_SECRET=your_consumer_secret

# Redis Configuration (default values shown)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Stripe (for payment processing)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Session
SESSION_SECRET=your_session_secret
```

### Installation

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:1224](http://localhost:1224) with your browser to see the result.

### Production Deployment

```bash
# Build the application
npm run build

# Start the production server
npm start
```

## Redis Search System

The project includes a Redis-based search system that provides fast product search capabilities:

- Full product data stored as JSON
- Word-level indexing for product names
- Category-based filtering
- Update script designed to be run by a CRON job

To load products into Redis, run:

```bash
node src/scripts/load-products-to-redis.js
```

## Technical Architecture

- **TypeScript**: Type-safe development environment
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Redis**: Session management and search functionality
- **Stripe**: Payment processing integration
- **WooCommerce REST API**: Product and order management
- **WordPress REST API**: Media uploads and JWT authentication

## Server Configuration

### File Upload Configuration

The application supports large file uploads (up to 64MB) for the custom design system. This requires proper server configuration:

#### Nginx Configuration

Add the following to your Nginx configuration for both frontend and backend servers:

```nginx
client_max_body_size 64M;
```

For the WordPress backend, also add this directive to the location blocks:

```nginx
location ~ ^/wp-json/ {
    client_max_body_size 64M;
    # other directives...
}

location ~ \.php$ {
    client_max_body_size 64M;
    # other directives...
}
```

#### PHP Configuration

For the WordPress backend, update PHP settings in `.user.ini` or `php.ini`:

```ini
upload_max_filesize = 64M
post_max_size = 64M
```

#### WordPress Configuration

Add to `wp-config.php`:

```php
define('WP_MEMORY_LIMIT', '256M');
define('WP_MAX_MEMORY_LIMIT', '512M');
@ini_set('upload_max_filesize', '64M');
@ini_set('post_max_size', '64M');
@ini_set('max_execution_time', '300');
```

## License

This project is licensed under the [MIT License](LICENSE).
