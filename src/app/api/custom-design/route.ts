import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api";
import { NextResponse } from 'next/server';

// Initialize the WooCommerce API client
const api = new WooCommerceRestApi({
  url: process.env.NEXT_PUBLIC_WOOCOMMERCE_URL || 'https://ggbe.groovygallerydesigns.com',
  consumerKey: process.env.NEXT_PUBLIC_WOOCOMMERCE_KEY || '',
  consumerSecret: process.env.NEXT_PUBLIC_WOOCOMMERCE_SECRET || '',
  version: "wc/v3"
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const formType = formData.get('formType') as string;

    // Get customer name parts
    const customerName = formData.get('customerName')?.toString() || '';
    const nameParts = customerName.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

    // Create a simple note that includes all the form data
    let note = `Custom Design Request - Type: ${formType}\n\n`;
    note += `Customer: ${customerName}\n`;
    note += `Email: ${formData.get('customerEmail')?.toString() || ''}\n`;
    note += `Phone: ${formData.get('customerPhone')?.toString() || ''}\n\n`;

    // Add form-specific data to the note
    switch (formType) {
      case 'modify':
        note += `Design URL: ${formData.get('designUrl')?.toString() || ''}\n`;
        note += `Target Product: ${formData.get('targetProduct')?.toString() || ''}\n`;
        note += `Notes: ${formData.get('notes')?.toString() || ''}\n`;
        break;

      case 'upload':
        note += `Design Name: ${formData.get('designName')?.toString() || ''}\n`;
        note += `Product Type: ${formData.get('productType')?.toString() || ''}\n`;
        const file = formData.get('file');
        if (file) {
          note += `Has Design File: Yes\n`;
        }
        break;

      case 'custom':
        note += `Design Vision: ${formData.get('vision')?.toString() || ''}\n`;
        note += `Product Type: ${formData.get('productType')?.toString() || ''}\n`;
        note += `Notes: ${formData.get('notes')?.toString() || ''}\n`;
        const referenceFiles = formData.getAll('referenceFiles');
        if (referenceFiles.length > 0) {
          note += `Has Reference Files: Yes (${referenceFiles.length})\n`;
        }
        break;
    }

    // Create order data following WooCommerce API structure
    const orderData = {
      status: 'processing',
      payment_method: 'bacs',
      payment_method_title: 'Custom Design Request',
      set_paid: false,
      customer_note: note,
      billing: {
        first_name: firstName,
        last_name: lastName,
        email: formData.get('customerEmail')?.toString() || '',
        phone: formData.get('customerPhone')?.toString() || '',
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
      line_items: [
        {
          product_id: 93, // Using a sample product ID from the store
          name: `Custom Design - ${formType.charAt(0).toUpperCase() + formType.slice(1)}`,
          quantity: 1,
          total: '0.00',
          subtotal: '0.00'
        }
      ],
      meta_data: [
        {
          key: 'custom_design_type',
          value: formType
        }
      ]
    };

    // Create the order
    const response = await api.post('orders', orderData);

    return NextResponse.json({
      success: true,
      orderId: response.data.id,
      message: 'Order created successfully'
    });

  } catch (error: any) {
    console.error('Error creating order:', error);
    
    // Log more detailed error information if available
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
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
