import React from 'react';
import { notFound } from 'next/navigation';
import { getProducts, getProductBySlug, getRelatedProducts } from '../../../lib/woocommerce';
import { hasVariantImages } from '../../../lib/productUtils';
import { generateProductSchema } from '../../../lib/schema';
import BreadcrumbNav from '../../../components/BreadcrumbNav';
import ProductGallery from '../../../components/ProductGallery';
import ProductInfo from '../../../components/ProductInfo';
import ProductTabs from '../../../components/ProductTabs';
import RelatedProducts from '../../../components/RelatedProducts';
import VariantGalleryWrapper from '../../../components/VariantGalleryWrapper';

// Define the params type for the page component
interface ProductDetailsParams {
  params: Promise<{
    slug: string;
  }>;
}

// Generate static params for all products at build time
export async function generateStaticParams() {
  try {
    // Fetch all products
    const products = await getProducts();
    
    return products.map((product) => ({
      slug: product.slug,
    }));
  } catch (error) {
    console.error('Error generating static params for products:', error);
    return [];
  }
}

export default async function ProductDetailsPage({ params }: ProductDetailsParams) {
  // Await params before accessing properties in Next.js 15
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  
  try {
    // Fetch product details
    const product = await getProductBySlug(slug);
    
    if (!product) {
      notFound();
    }
    
    // Fetch related products
    const relatedProducts = product.related_ids ? 
      await getRelatedProducts(product.related_ids) : 
      [];
    
    // Check if the product is variable AND has variant images
    const isVariableProduct = product.type === 'variable';
    const productHasVariantImages = isVariableProduct && hasVariantImages(product);
    
    // Generate product schema
    const productSchema = generateProductSchema(product);
    
    // Generate schema for related products
    const relatedProductsSchema = relatedProducts.map(relatedProduct => 
      generateProductSchema(relatedProduct)
    );
    
    // Combine all schemas into one array
    const allSchemas = [productSchema, ...relatedProductsSchema];
    
    return (
      <div className="container mx-auto px-4 md:py-8 pt-20 pb-8 md:pt-8">
        {/* Main product schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(allSchemas),
          }}
        />
        <BreadcrumbNav product={product} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {productHasVariantImages ? (
            <VariantGalleryWrapper product={product} />
          ) : (
            <ProductGallery images={product.images} />
          )}
          <ProductInfo product={product} />
        </div>
        
        {/* Additional product information sections */}
        <ProductTabs product={product} />
        
        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <RelatedProducts products={relatedProducts} />
        )}
      </div>
    );
  } catch (error) {
    console.error('Error loading product:', error);
    notFound();
  }
}
