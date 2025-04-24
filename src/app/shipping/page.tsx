export default function ShippingPage() {
  return (
    <div className="container mx-auto">
      <div className="max-w-4xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-6">Shipping Information</h1>
        <div className="prose max-w-none">
          <h2 className="text-2xl font-semibold mt-4 mb-4">Shipping Policy</h2>
          <p>At Groovy Gallery Designs, we strive to provide reliable and efficient shipping services to our customers. Here&apos;s what you need to know about our shipping process:</p>
          
          <h3 className="text-xl font-semibold mt-6 mb-3">Processing Time</h3>
          <p>All orders are processed within 1-3 business days after payment confirmation. During high-volume periods or sales, processing may take an additional 1-2 business days.</p>
          
          <h3 className="text-xl font-semibold mt-6 mb-3">Shipping Methods and Timeframes</h3>
          <ul>
            <li><strong>Standard Shipping:</strong> 7-14 business days</li>
             (may be subject to customs delays)
          </ul>
          
          <h3 className="text-xl font-semibold mt-6 mb-3">Tracking Information</h3>
          <p>Once your order ships, you will receive a confirmation email with tracking information. You can also track your order by logging into your account on our website.</p>
          
          <h3 className="text-xl font-semibold mt-6 mb-3">International Orders</h3>
          <p>Please note that international customers are responsible for all duties, taxes, and customs fees that may be incurred. These charges are not included in the order total and will be collected upon delivery.</p>
          
          <h3 className="text-xl font-semibold mt-6 mb-3">Shipping Restrictions</h3>
          <p>We currently ship to most countries worldwide. However, there may be restrictions for certain regions. If you have concerns about shipping to your location, please contact our customer service team.</p>
          
          <p className="mt-8">If you have any questions about our shipping policy, please don&apos;t hesitate to <a href="/contact" className="text-purple-600 hover:text-purple-800">contact us</a>.</p>
        </div>
      </div>
    </div>
  );
}
