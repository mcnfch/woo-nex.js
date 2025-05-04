import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api";
import { NextResponse } from 'next/server';
import { IncomingMessage } from 'http';
import { uploadFileToWordPress, uploadMultipleFilesToWordPress } from '@/lib/wordpress-media';

// Initialize the WooCommerce API client - use type assertion to handle the default property
// @ts-expect-error TODO: Fix WooCommerce API type definition
const WooCommerce = WooCommerceRestApi.default || WooCommerceRestApi;
const api = new WooCommerce({
  url: process.env.NEXT_PUBLIC_WOOCOMMERCE_URL || 'https://ggbe.groovygallerydesigns.com',
  consumerKey: process.env.NEXT_PUBLIC_WOOCOMMERCE_KEY || '',
  consumerSecret: process.env.NEXT_PUBLIC_WOOCOMMERCE_SECRET || '',
  version: "wc/v3"
});

// Maximum file size in bytes (64MB)
const MAX_FILE_SIZE = 64 * 1024 * 1024;

export async function POST(request: Request) {
  console.log('[DEBUG] Custom design order request received');
  
  try {
    // Check content length before parsing
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > MAX_FILE_SIZE) {
      console.log('[DEBUG] Request too large:', contentLength);
      return NextResponse.json(
        {
          success: false,
          error: `Request size exceeds the maximum allowed (64MB)`
        },
        { status: 413 }
      );
    }
    
    // Parse the form data manually
    const formData = await request.formData();
    console.log('[DEBUG] Form data parsed successfully');
    
    // Extract form type
    const formType = formData.get('formType') as string;
    console.log('[DEBUG] Form type:', formType);
    
    // Get customer name parts
    const customerName = formData.get('customerName') as string || '';
    const nameParts = customerName.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
    console.log('[DEBUG] Customer:', { firstName, lastName });

    // Base order data with customer information
    console.log('[DEBUG] Creating order data');
    const orderData: any = {
      status: 'processing',
      payment_method: 'bacs',
      payment_method_title: 'Custom Design Order',
      billing: {
        first_name: firstName,
        last_name: lastName,
        email: formData.get('customerEmail') as string || '',
        phone: formData.get('customerPhone') as string || '',
        address_1: '',
        city: '',
        state: '',
        postcode: '',
        country: 'US'
      },
      shipping: {
        first_name: firstName,
        last_name: lastName,
        address_1: '',
        city: '',
        state: '',
        postcode: '',
        country: 'US'
      },
      meta_data: [
        {
          key: 'custom_design_type',
          value: formType
        }
      ]
    };

    // Add form-specific data
    console.log('[DEBUG] Processing form type:', formType);
    switch (formType) {
      case 'modify':
        console.log('[DEBUG] Processing modify form');
        orderData.meta_data.push(
          {
            key: 'original_design_url',
            value: formData.get('designUrl') as string || ''
          },
          {
            key: 'target_product',
            value: formData.get('targetProduct') as string || ''
          },
          {
            key: 'notes',
            value: formData.get('notes') as string || ''
          }
        );
        break;

      case 'upload':
        console.log('[DEBUG] Processing upload form');
        orderData.meta_data.push(
          {
            key: 'design_name',
            value: formData.get('designName') as string || ''
          },
          {
            key: 'product_type',
            value: formData.get('productType') as string || ''
          }
        );
        
        // Handle file URL and ID from the form data
        console.log('[DEBUG] Checking for design file URL and ID');
        const designFileUrl = formData.get('designFileUrl') as string;
        const designFileId = formData.get('designFileId') as string;
        
        if (designFileUrl && designFileId) {
          console.log('[DEBUG] Design file URL and ID found:', { 
            url: designFileUrl,
            id: designFileId
          });
          
          // Store WordPress media URL in order metadata
          orderData.meta_data.push(
            {
              key: 'design_file_url',
              value: designFileUrl
            },
            {
              key: 'design_file_id',
              value: designFileId
            },
            {
              key: 'has_design_file',
              value: 'yes'
            }
          );
          
          // Add a note to the order about the file
          orderData.customer_note = `Customer uploaded a design file. The file is available at: ${designFileUrl}`;
        } else {
          console.log('[DEBUG] No design file URL or ID found');
          return NextResponse.json(
            {
              success: false,
              error: 'Design file URL and ID are required'
            },
            { status: 400 }
          );
        }
        break;

      case 'custom':
        console.log('[DEBUG] Processing custom form');
        orderData.meta_data.push(
          {
            key: 'design_vision',
            value: formData.get('vision') as string || ''
          },
          {
            key: 'product_type',
            value: formData.get('productType') as string || ''
          },
          {
            key: 'notes',
            value: formData.get('notes') as string || ''
          }
        );
        
        // Handle reference file URLs and IDs from the form data
        console.log('[DEBUG] Checking for reference file URLs and IDs');
        const referenceFileUrlsJson = formData.get('referenceFileUrls') as string;
        const referenceFileIdsJson = formData.get('referenceFileIds') as string;
          
        if (referenceFileUrlsJson && referenceFileIdsJson) {
          console.log('[DEBUG] Reference file URLs and IDs found');
          
          try {
            const referenceFileUrls = JSON.parse(referenceFileUrlsJson);
            const referenceFileIds = JSON.parse(referenceFileIdsJson);
            
            if (referenceFileUrls.length > 0) {
              // Store file metadata and WordPress media URLs
              orderData.meta_data.push(
                {
                  key: 'reference_file_urls',
                  value: referenceFileUrlsJson
                },
                {
                  key: 'reference_file_ids',
                  value: referenceFileIdsJson
                },
                {
                  key: 'has_reference_files',
                  value: 'yes'
                }
              );
              
              // Add a note to the order about the files with URLs
              orderData.customer_note = `Customer uploaded ${referenceFileUrls.length} reference files. Files are available at: ${referenceFileUrls.join(', ')}`;
            }
          } catch (error) {
            console.error('[DEBUG] Error parsing reference file URLs or IDs:', error);
          }
        } else {
          console.log('[DEBUG] No reference file URLs or IDs found');
        }
        break;
    }

    // Add a sample product to the order
    orderData.line_items = [
      {
        product_id: 93, // Using a sample product ID from the store
        name: `Custom Design - ${formType.charAt(0).toUpperCase() + formType.slice(1)}`,
        quantity: 1,
        total: '0.00',
        subtotal: '0.00'
      }
    ];

    // Create the order
    console.log('[DEBUG] Creating WooCommerce order');
    const response = await api.post('orders', orderData);
    console.log('[DEBUG] Order created successfully:', response.data.id);

    return NextResponse.json({
      success: true,
      orderId: response.data.id,
      message: 'Order created successfully'
    });

  } catch (error: any) {
    console.error('[DEBUG] Error creating order:', error);
    
    // Log more detailed error information if available
    if (error.response) {
      console.error('[DEBUG] Error response data:', JSON.stringify(error.response.data));
      console.error('[DEBUG] Error response status:', error.response.status);
      
      // Return the specific WooCommerce error if available
      if (error.response.data && error.response.data.message) {
        return NextResponse.json(
          {
            success: false,
            error: `WooCommerce error: ${error.response.data.message}`
          },
          { status: error.response.status }
        );
      }
    }
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to create order'
      },
      { status: 500 }
    );
  }
}
