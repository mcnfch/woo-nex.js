# Product Page Design & Implementation

## Overview
This document outlines the design and implementation details for the product detail pages in our WooCommerce Next.js shop. The design follows responsive principles to provide optimal user experience across both desktop and mobile devices.

## URL Structure
The product detail pages will follow this URL pattern:
```
/product-details/[slug]
```

**Note:** All existing links in category pages must be updated to point to this new URL structure instead of the previous `/product/[slug]` pattern.

## Design Analysis

### Desktop Version
![Desktop Product Page](https://example.com/desktop-product-page.jpg)

#### Layout Components:
- **Navigation:** Breadcrumb trail showing category hierarchy (Home / Women's / Product Name)
- **Product Gallery:** 
  - Left sidebar with thumbnail navigation (6 thumbnails visible)
  - Large main image display
  - Swipe/arrow navigation for additional images
- **Product Information:**
  - SKU number (e.g., AB057-RRW/RFE-M)
  - Product title (large, prominent)
  - Pricing information:
    - Sale price ($47.96 USD)
    - Original price ($58.95 USD) with strikethrough
  - Size selection:
    - Size label and size chart link
    - Option buttons (S, M, L) with active state for selected size
  - Quantity selector:
    - Decrement button (-)
    - Input field showing current quantity
    - Increment button (+)
  - Action buttons:
    - Primary "ADD TO CART" button (full width)
    - Wishlist/heart icon button
  - Collapsible information sections:
    - DETAILS section
    - 30-DAY RETURNS: STORE CREDIT section
  - Social sharing button (top right)

### Mobile Version
![Mobile Product Page](https://example.com/mobile-product-page.jpg)

#### Layout Components:
- **Navigation:** Same breadcrumb structure but optimized for mobile width
- **Product Gallery:** 
  - Horizontal swipeable gallery
  - No separate thumbnails section
  - Multiple images shown side-by-side with partial views
- **Product Information:**
  - Same information as desktop but reorganized vertically
  - Product title
  - Pricing information 
  - Size selection with full-width buttons
  - Quantity selector
  - Full-width "ADD TO CART" button
  - Circular wishlist button
  - Collapsible DETAILS section

## Implementation Details

### Component Structure
The product page will use the following components:

1. `ProductDetailsPage.tsx` - Server Component (main page)
2. `ProductGallery.tsx` - Client Component (handles image display and navigation)
3. `ProductInfo.tsx` - Client Component (displays product details and handles user interactions)
4. `SizeSelector.tsx` - Client Component (size selection UI)
5. `QuantitySelector.tsx` - Client Component (quantity adjustment)
6. `AddToCartButton.tsx` - Client Component (add to cart functionality)
7. `ProductTabs.tsx` - Client Component (collapsible details sections)

### Data Fetching
We'll implement data fetching using the following strategy:

```typescript
// In /app/product-details/[slug]/page.tsx
export async function generateStaticParams() {
  // Fetch all product slugs for static generation
  const products = await getProducts();
  
  return products.map((product) => ({
    slug: product.slug,
  }));
}

export default async function ProductDetailsPage({ params }) {
  const { slug } = params;
  
  // Fetch product details
  const product = await getProductBySlug(slug);
  
  if (!product) {
    notFound();
  }
  
  return (
    <div className="container mx-auto px-4 md:py-8 pt-20 pb-8 md:pt-8">
      <BreadcrumbNav product={product} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <ProductGallery images={product.images} />
        <ProductInfo product={product} />
      </div>
      
      {/* Additional product information sections */}
      <ProductTabs product={product} />
    </div>
  );
}
```

### Responsive Design Implementation
We'll use Tailwind CSS for responsive layouts with these considerations:

- CSS Grid for main layout structure
- Flexbox for alignment within components
- Mobile-first design approach with breakpoints for larger screens
- Custom styling for buttons and interactive elements

### Add to Cart Functionality
The Add to Cart functionality will use a client-side approach with WooCommerce REST API:

```typescript
'use client';

export function AddToCartButton({ product, quantity, selectedSize }) {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleAddToCart = async () => {
    setIsLoading(true);
    
    try {
      // Add to cart using WooCommerce API
      await addToCart({
        product_id: product.id,
        quantity,
        variation_id: selectedSize ? getVariationId(product, selectedSize) : 0,
      });
      
      // Show success notification
      toast.success('Product added to cart!');
      
    } catch (error) {
      toast.error('Failed to add product to cart');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <button
      onClick={handleAddToCart}
      disabled={isLoading}
      className="w-full bg-black text-white py-3 px-4 rounded hover:bg-gray-800 transition-colors"
    >
      {isLoading ? 'ADDING...' : 'ADD TO CART'}
    </button>
  );
}
```

### Updates Required for Existing Code

1. Update all product links in category pages:

```typescript
// Change this in ProductCard.tsx
<Link 
  href={`/product/${product.slug}`}
  // ...
>
```

To:

```typescript
<Link 
  href={`/product-details/${product.slug}`}
  // ...
>
```

2. Create the new product details page structure under `/app/product-details/[slug]/page.tsx`

3. Implement responsive styling based on the desktop and mobile designs

## Accessibility Considerations
- All interactive elements will have appropriate ARIA labels
- Color contrast will meet WCAG standards 
- Keyboard navigation support for all interactive elements
- Focus states for all interactive components

## Testing Plan
1. Test responsive behavior across various screen sizes
2. Verify all interactive elements work correctly
3. Ensure proper loading states during API calls
4. Test add to cart functionality with different product variations
5. Validate correct behavior with different product types (simple, variable, grouped)

## Timeline
- Design implementation: 2 days
- Core functionality: 3 days
- Testing and refinement: 2 days
- Total: 7 days
