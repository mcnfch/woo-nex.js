export default function RefundsPage() {
  return (
    <div className="container mx-auto">
      <div className="max-w-4xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-6">Refunds and Returns</h1>
        <div className="prose max-w-none">
          <p>At Groovy Gallery Designs, we want you to be completely satisfied with your purchase. If for any reason you&apos;re not happy with your order, we&apos;re here to help.</p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">Return Policy</h2>
          <p>We accept returns within 30 days of delivery for most items in their original condition. To be eligible for a return, your item must be unused and in the same condition that you received it, with all original packaging and tags attached.</p>
          
          <h3 className="text-xl font-semibold mt-6 mb-3">Items Not Eligible for Return</h3>
          <ul>
            <li>Custom or personalized items</li>
            <li>Digital products</li>
            <li>Gift cards</li>
            <li>Sale items (unless defective)</li>
            <li>Items marked as final sale</li>
          </ul>
          
          <h3 className="text-xl font-semibold mt-6 mb-3">Return Process</h3>
          <ol>
            <li>Contact our customer service team at support@groovygallerydesigns.com to initiate your return</li>
            <li>You&apos;ll receive a Return Authorization Number and instructions for returning your item</li>
            <li>Pack the item securely in its original packaging if possible</li>
            <li>Include your order number and Return Authorization Number with your return</li>
            <li>Ship the item to the address provided in the return instructions</li>
          </ol>
          
          <p>Please note that you are responsible for return shipping costs unless the item is defective or we made an error in your order.</p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">Refund Policy</h2>
          <p>Once we receive and inspect your return, we will notify you about the status of your refund.</p>
          
          <h3 className="text-xl font-semibold mt-6 mb-3">Refund Process</h3>
          <ul>
            <li>If your return is approved, we will initiate a refund to your original method of payment</li>
            <li>Credit card refunds typically take 5-10 business days to appear on your statement</li>
            <li>For payment methods other than credit cards, processing times may vary</li>
          </ul>
          
          <h3 className="text-xl font-semibold mt-6 mb-3">Refund Options</h3>
          <ul>
            <li><strong>Full Refund:</strong> For items returned in their original condition within 30 days</li>
            <li><strong>Store Credit:</strong> Available for returns after 30 days but before 60 days</li>
            <li><strong>Exchanges:</strong> Available for items of equal value if you prefer a different size, color, or style</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">Damaged or Defective Items</h2>
          <p>If you receive a damaged or defective item, please contact us immediately at support@groovygallerydesigns.com. We will arrange for a replacement or refund at no additional cost to you.</p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">Late or Missing Refunds</h2>
          <p>If you haven&apos;t received your refund within the expected timeframe, please check your bank account again and then contact your credit card company or bank. There is often a processing period before a refund is posted. If you&apos;ve done this and still haven&apos;t received your refund, please contact our customer service team.</p>
          
          <p className="mt-8">If you have any questions about our return and refund policy, please don&apos;t hesitate to <a href="/contact" className="text-purple-600 hover:text-purple-800">contact us</a>.</p>
        </div>
      </div>
    </div>
  );
}
