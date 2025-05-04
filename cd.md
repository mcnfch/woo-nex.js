# Custom Design System Implementation Documentation

This document provides a comprehensive explanation of the custom design system implemented for Groovy Gallery Designs.

## Table of Contents
1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Frontend Implementation](#frontend-implementation)
   - [Custom Design Forms](#custom-design-forms)
   - [Success Page](#success-page)
4. [Backend Implementation](#backend-implementation)
   - [API Endpoint](#api-endpoint)
   - [WooCommerce Integration](#woocommerce-integration)
5. [Data Flow](#data-flow)
6. [Code Implementation Details](#code-implementation-details)

## Overview

The custom design system allows customers to request custom designs through three different methods:
1. **Modify Existing Design**: Request changes to an existing product design
2. **Upload Own Design**: Upload a design to be printed on products
3. **Custom Design Request**: Request a completely new design

Each request type is submitted through a dedicated form, processed by an API endpoint, and then converted into a WooCommerce order with specific metadata.

## System Architecture

The system consists of:
- Frontend React components for the custom design forms
- Next.js API route for processing submissions
- WooCommerce REST API integration for order creation
- Success page to confirm submission

## Frontend Implementation

### Custom Design Forms

Located in `/src/app/custom-designs/page.js`, the frontend provides three distinct forms, each tailored for a specific type of custom design request.

#### Form Components

All three forms share common contact fields and have their own specialized fields:

```javascript
// Common contact fields used across all forms
const ContactFields = () => (
  <div className="space-y-4">
    <div>
      <label className="block text-black font-medium mb-2">Your Name*</label>
      <input
        type="text"
        name="customerName"
        required
        className="w-full px-4 py-2 border border-gray-300 rounded-md text-black"
        placeholder="Full Name"
      />
    </div>
    <div>
      <label className="block text-black font-medium mb-2">Email*</label>
      <input
        type="email"
        name="customerEmail"
        required
        className="w-full px-4 py-2 border border-gray-300 rounded-md text-black"
        placeholder="email@example.com"
      />
    </div>
    <div>
      <label className="block text-black font-medium mb-2">Phone Number</label>
      <input
        type="tel"
        name="customerPhone"
        className="w-full px-4 py-2 border border-gray-300 rounded-md text-black"
        placeholder="(555) 555-5555"
      />
    </div>
  </div>
);
```

#### Form Submission Handler

The form submission is handled by a unified function that identifies the form type and builds the appropriate FormData:

```javascript
const handleSubmit = async (e, formType) => {
  e.preventDefault();
  setIsSubmitting(true);
  setSubmitError(null);

  try {
    const form = e.target;
    const formData = new FormData();
    formData.append('formType', formType);

    // Add contact information for all forms
    formData.append('customerName', form.querySelector('input[name="customerName"]').value);
    formData.append('customerEmail', form.querySelector('input[name="customerEmail"]').value);
    formData.append('customerPhone', form.querySelector('input[name="customerPhone"]').value);

    // Collect form data based on type
    switch (formType) {
      case 'modify':
        formData.append('designUrl', form.querySelector('input[type="url"]').value);
        formData.append('targetProduct', form.querySelector('input[name="targetProduct"]').value);
        formData.append('notes', form.querySelector('textarea').value || '');
        break;

      case 'upload':
        formData.append('designName', form.querySelector('input[name="designName"]').value);
        formData.append('productType', form.querySelector('input[name="productType"]').value);
        const uploadFile = form.querySelector('input[type="file"]').files[0];
        if (uploadFile) {
          formData.append('file', uploadFile);
        }
        break;

      case 'custom':
        formData.append('vision', form.querySelector('textarea[name="vision"]').value);
        formData.append('productType', form.querySelector('input[name="productType"]').value);
        formData.append('notes', form.querySelector('textarea[name="notes"]').value || '');
        const referenceFiles = form.querySelector('input[type="file"]').files;
        for (let i = 0; i < referenceFiles.length; i++) {
          formData.append('referenceFiles', referenceFiles[i]);
        }
        break;
    }

    // Send to our API
    const response = await fetch('/api/custom-design', {
      method: 'POST',
      body: formData, // Send as FormData instead of JSON
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.error || 'Failed to submit design request');
    }

    const result = await response.json();

    // Redirect to success page with order ID
    router.push(`/custom-designs/success?orderId=${result.orderId}`);

  } catch (error) {
    console.error('Error submitting form:', error);
    setSubmitError(error.message || 'Failed to submit design request');
  } finally {
    setIsSubmitting(false);
  }
};
```

### Success Page

Located in `/src/app/custom-designs/success/success-content.js`, this component displays confirmation after a successful submission:

```javascript
export default function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg text-center">
      <div className="mb-8">
        <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Thank You for Your Custom Design Request!</h2>
        <p className="text-lg text-gray-700 mb-4">
          Your order number is: <span className="font-semibold">#{orderId}</span>
        </p>
        <p className="text-gray-600 mb-6">
          Someone from our design team will contact you within 24 to 48 hours to discuss your design request and next steps.
        </p>
        <!-- Rest of the success page content -->
      </div>
    </div>
  );
}
```

## Backend Implementation

### API Endpoint

Located in `/src/app/api/custom-design/route.js`, this Next.js API route processes the form submissions and creates WooCommerce orders:

```javascript
import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api";

// Initialize the WooCommerce API client
const WooCommerce = WooCommerceRestApi.default;
const api = new WooCommerce({
  url: 'https://ggbe.groovygallerydesigns.com',  // Always use the backend URL for WooCommerce API
  consumerKey: process.env.NEXT_PUBLIC_WOOCOMMERCE_KEY,
  consumerSecret: process.env.NEXT_PUBLIC_WOOCOMMERCE_SECRET,
  version: "wc/v3"
});

export async function POST(request) {
  try {
    const formData = await request.formData();
    const formType = formData.get('formType');

    // Base order data with customer information
    const orderData = {
      status: 'processing',
      payment_method: 'bacs',
      payment_method_title: 'Custom Design Order',
      billing: {
        first_name: formData.get('customerName').split(' ')[0] || '',
        last_name: formData.get('customerName').split(' ').slice(1).join(' ') || '',
        email: formData.get('customerEmail'),
        phone: formData.get('customerPhone') || ''
      },
      shipping: {
        first_name: formData.get('customerName').split(' ')[0] || '',
        last_name: formData.get('customerName').split(' ').slice(1).join(' ') || ''
      },
      meta_data: [
        {
          key: 'custom_design_type',
          value: formType
        }
      ]
    };

    // Add form-specific data
    switch (formType) {
      case 'modify':
        orderData.meta_data.push(
          {
            key: 'original_design_url',
            value: formData.get('designUrl')
          },
          {
            key: 'target_product',
            value: formData.get('targetProduct')
          },
          {
            key: 'notes',
            value: formData.get('notes')
          }
        );
        break;

      case 'upload':
        orderData.meta_data.push(
          {
            key: 'design_name',
            value: formData.get('designName')
          },
          {
            key: 'product_type',
            value: formData.get('productType')
          }
        );
        // Handle file upload here
        const file = formData.get('file');
        if (file) {
          // TODO: Implement file storage
          orderData.meta_data.push({
            key: 'has_design_file',
            value: 'yes'
          });
        }
        break;

      case 'custom':
        orderData.meta_data.push(
          {
            key: 'design_vision',
            value: formData.get('vision')
          },
          {
            key: 'product_type',
            value: formData.get('productType')
          },
          {
            key: 'notes',
            value: formData.get('notes')
          }
        );
        // Handle reference files here
        const referenceFiles = formData.getAll('referenceFiles');
        if (referenceFiles.length > 0) {
          // TODO: Implement file storage
          orderData.meta_data.push({
            key: 'has_reference_files',
            value: 'yes'
          });
        }
        break;
    }

    // Create the order
    const response = await api.post('orders', orderData);

    return Response.json({
      success: true,
      orderId: response.data.id,
      message: 'Order created successfully'
    });

  } catch (error) {
    console.error('Error creating order:', error);
    return Response.json(
      {
        success: false,
        error: error.message || 'Failed to create order'
      },
      { status: 500 }
    );
  }
}
```

### WooCommerce Integration

The system leverages the WooCommerce REST API to create orders with custom metadata. This metadata is then used by the store administrators to process the custom design requests.

## Data Flow

1. **Customer Submission**
   - Customer fills out one of three custom design forms
   - Form data is collected and validated client-side
   - Data is submitted to the API endpoint as FormData (not JSON)

2. **API Processing**
   - API receives the FormData submission
   - Extracts form data and builds appropriate WooCommerce order object
   - Adds form-specific metadata based on the type of request
   - File handling is marked for future implementation

3. **Order Creation**
   - Order is created in WooCommerce with 'processing' status
   - Payment method is set to 'bacs' (bank transfer) as these are inquiry-based orders
   - Custom metadata is attached to identify the order as a custom design request

4. **Success Confirmation**
   - API returns success response with the created order ID
   - Frontend redirects to success page displaying the order ID
   - Success page informs customer of next steps

## Code Implementation Details

### Navigation Integration

Custom design links are integrated into the site's navigation in `/src/components/Header.js`:

```javascript
// Mobile menu link
<a
  href="/custom-designs"
  className={classNames(
    active ? 'bg-gray-100' : '',
    'block px-4 py-2 text-sm text-gray-700'
  )}
>
  Custom Designs
</a>

// Desktop menu link
<Link
  href="/custom-designs"
  className="text-sm font-medium text-gray-700 hover:text-gray-800"
>
  Custom Designs
</Link>
```

### Homepage Integration

Custom designs are featured in the homepage categories section in `/src/app/page.js`:

```javascript
const isCustomDesigns = category.slug === 'custom-designs';
const href = isCustomDesigns ? "/custom-designs" : `/product-category/${category.slug}`;
```

### API Implementation Note

File storage for uploaded designs and reference files is marked as TODO in the API implementation. Currently, the system only flags that files have been uploaded but doesn't yet store them permanently. This is an area for future development.

### Order Processing Workflow

1. Custom design orders are created with the 'processing' status
2. Store administrators can see these orders in the WooCommerce dashboard
3. The custom metadata helps identify the type of request and its details
4. Administrators contact the customer to discuss requirements and pricing
5. Once approved, the design work begins

This implementation provides a seamless experience for customers to request custom designs while giving store administrators the information they need to fulfill these requests.
