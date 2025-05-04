'use client';

import { useState, FormEvent, useRef, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function CustomDesigns() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<{
    uploading: boolean;
    error: string | null;
    fileUrl: string | null;
    fileId: string | null;
  }>({
    uploading: false,
    error: null,
    fileUrl: null,
    fileId: null,
  });
  const [referenceUploadStatus, setReferenceUploadStatus] = useState<{
    uploading: boolean;
    error: string | null;
    fileUrls: string[];
    fileIds: string[];
  }>({
    uploading: false,
    error: null,
    fileUrls: [],
    fileIds: [],
  });
  
  const router = useRouter();
  const designFileInputRef = useRef<HTMLInputElement>(null);
  const referenceFilesInputRef = useRef<HTMLInputElement>(null);

  // Handle file upload for the design file
  const handleDesignFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    setUploadStatus({
      uploading: true,
      error: null,
      fileUrl: null,
      fileId: null,
    });
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload-media', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || 'Failed to upload file');
      }
      
      const result = await response.json();
      
      setUploadStatus({
        uploading: false,
        error: null,
        fileUrl: result.mediaUrl,
        fileId: result.mediaId.toString(),
      });
      
      console.log('File uploaded successfully:', result);
    } catch (error: any) {
      console.error('Error uploading file:', error);
      setUploadStatus({
        uploading: false,
        error: error.message || 'Failed to upload file',
        fileUrl: null,
        fileId: null,
      });
    }
  };
  
  // Handle file upload for reference files
  const handleReferenceFilesChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setReferenceUploadStatus({
      uploading: true,
      error: null,
      fileUrls: [],
      fileIds: [],
    });
    
    try {
      const fileUrls: string[] = [];
      const fileIds: string[] = [];
      
      // Upload each file one by one
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch('/api/upload-media', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.error || `Failed to upload file ${i + 1}`);
        }
        
        const result = await response.json();
        fileUrls.push(result.mediaUrl);
        fileIds.push(result.mediaId.toString());
      }
      
      setReferenceUploadStatus({
        uploading: false,
        error: null,
        fileUrls,
        fileIds,
      });
      
      console.log('Reference files uploaded successfully:', { fileUrls, fileIds });
    } catch (error: any) {
      console.error('Error uploading reference files:', error);
      setReferenceUploadStatus({
        uploading: false,
        error: error.message || 'Failed to upload reference files',
        fileUrls: [],
        fileIds: [],
      });
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>, formType: string) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const form = e.target as HTMLFormElement;
      const formData = new FormData();
      formData.append('formType', formType);

      // Add contact information for all forms
      formData.append('customerName', (form.querySelector('input[name="customerName"]') as HTMLInputElement).value);
      formData.append('customerEmail', (form.querySelector('input[name="customerEmail"]') as HTMLInputElement).value);
      formData.append('customerPhone', (form.querySelector('input[name="customerPhone"]') as HTMLInputElement).value);

      // Collect form data based on type
      switch (formType) {
        case 'modify':
          formData.append('designUrl', (form.querySelector('input[type="url"]') as HTMLInputElement).value);
          formData.append('targetProduct', (form.querySelector('input[name="targetProduct"]') as HTMLInputElement).value);
          formData.append('notes', (form.querySelector('textarea') as HTMLTextAreaElement).value || '');
          break;

        case 'upload':
          formData.append('designName', (form.querySelector('input[name="designName"]') as HTMLInputElement).value);
          formData.append('productType', (form.querySelector('input[name="productType"]') as HTMLInputElement).value);
          
          // Add the uploaded file URL and ID instead of the actual file
          if (uploadStatus.fileUrl && uploadStatus.fileId) {
            formData.append('designFileUrl', uploadStatus.fileUrl);
            formData.append('designFileId', uploadStatus.fileId);
          } else {
            throw new Error('Please upload a design file first');
          }
          break;

        case 'custom':
          formData.append('vision', (form.querySelector('textarea[name="vision"]') as HTMLTextAreaElement).value);
          formData.append('productType', (form.querySelector('input[name="productType"]') as HTMLInputElement).value);
          formData.append('notes', (form.querySelector('textarea[name="notes"]') as HTMLTextAreaElement).value || '');
          
          // Add the uploaded reference file URLs and IDs
          if (referenceUploadStatus.fileUrls.length > 0) {
            formData.append('referenceFileUrls', JSON.stringify(referenceUploadStatus.fileUrls));
            formData.append('referenceFileIds', JSON.stringify(referenceUploadStatus.fileIds));
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

    } catch (error: unknown) {
      console.error('Error submitting form:', error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to submit design request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const ContactFields = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-gray-900 dark:text-gray-100 font-medium mb-2">Your Name*</label>
        <input
          type="text"
          name="customerName"
          required
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800"
          placeholder="Full Name"
        />
      </div>
      <div>
        <label className="block text-gray-900 dark:text-gray-100 font-medium mb-2">Email*</label>
        <input
          type="email"
          name="customerEmail"
          required
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800"
          placeholder="email@example.com"
        />
      </div>
      <div>
        <label className="block text-gray-900 dark:text-gray-100 font-medium mb-2">Phone Number</label>
        <input
          type="tel"
          name="customerPhone"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800"
          placeholder="(555) 555-5555"
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-[#FF6EC7] via-[#6A82FB] to-[#FFD200] py-10">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Custom Designs</h2>
            <p className="text-lg text-white">Create your perfect festival outfit with our custom design service</p>
          </div>
        </div>
      </section>

      {/* Custom Design Options */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 text-center mb-12">Choose Your Design Path</h2>
          
          {submitError && (
            <div className="mb-8 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg">
              {submitError}
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-8">
            {/* Option 1: Modify Existing Design */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col h-full">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Modify Existing Design</h3>
              <form onSubmit={(e) => handleSubmit(e, 'modify')} className="flex flex-col flex-grow">
                <div className="space-y-4 flex-grow">
                  <ContactFields />
                  <div>
                    <label className="block text-gray-900 dark:text-gray-100 font-medium mb-2">Design URL*</label>
                    <input
                      type="url"
                      name="designUrl"
                      placeholder="https://groovygallerydesigns.com/product/..."
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800"
                      required
                    />
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">Copy the URL of the product with the design you like</p>
                  </div>
                  <div>
                    <label className="block text-gray-900 dark:text-gray-100 font-medium mb-2">Target Product*</label>
                    <input
                      type="text"
                      name="targetProduct"
                      placeholder="e.g., Hoodie, T-Shirt, Tank Top"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-900 dark:text-gray-100 font-medium mb-2">Additional Notes</label>
                    <textarea
                      rows={3}
                      name="notes"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800"
                    ></textarea>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 mt-6 disabled:bg-purple-300 dark:disabled:bg-purple-800"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </form>
            </div>

            {/* Option 2: Upload Own Design */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col h-full">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Upload Your Design</h3>
              <form onSubmit={(e) => handleSubmit(e, 'upload')} className="flex flex-col flex-grow">
                <div className="space-y-4 flex-grow">
                  <ContactFields />
                  <div>
                    <label className="block text-gray-900 dark:text-gray-100 font-medium mb-2">Design Name*</label>
                    <input
                      type="text"
                      name="designName"
                      placeholder="Name your design"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-900 dark:text-gray-100 font-medium mb-2">Upload File*</label>
                    <input
                      type="file"
                      name="file"
                      accept=".png,.jpg,.jpeg,.svg"
                      className="w-full text-gray-900 dark:text-gray-100"
                      required
                      ref={designFileInputRef}
                      onChange={handleDesignFileChange}
                    />
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">Supported: PNG, JPG, SVG</p>
                    
                    {uploadStatus.uploading && (
                      <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">Uploading file...</p>
                    )}
                    
                    {uploadStatus.error && (
                      <p className="text-sm text-red-600 dark:text-red-400 mt-2">Error: {uploadStatus.error}</p>
                    )}
                    
                    {uploadStatus.fileUrl && (
                      <p className="text-sm text-green-600 dark:text-green-400 mt-2">File uploaded successfully!</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-gray-900 dark:text-gray-100 font-medium mb-2">Product Type*</label>
                    <input
                      type="text"
                      name="productType"
                      placeholder="e.g., Hoodie, T-Shirt, Tank Top"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800"
                      required
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="copyright"
                      required
                      className="mr-2"
                    />
                    <label htmlFor="copyright" className="text-sm text-gray-900 dark:text-gray-100">
                      I confirm this design is non-copyrighted
                    </label>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting || uploadStatus.uploading || !uploadStatus.fileUrl}
                  className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 mt-6 disabled:bg-purple-300 dark:disabled:bg-purple-800"
                >
                  {isSubmitting ? 'Submitting...' : uploadStatus.uploading ? 'Uploading File...' : 'Upload Design'}
                </button>
              </form>
            </div>

            {/* Option 3: Custom Design */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col h-full">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Work with Our Designers</h3>
              <form onSubmit={(e) => handleSubmit(e, 'custom')} className="flex flex-col flex-grow">
                <div className="space-y-4 flex-grow">
                  <ContactFields />
                  <div>
                    <label className="block text-gray-900 dark:text-gray-100 font-medium mb-2">Your Vision*</label>
                    <textarea
                      rows={3}
                      name="vision"
                      placeholder="Describe your design idea"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800"
                      required
                    ></textarea>
                  </div>
                  <div>
                    <label className="block text-gray-900 dark:text-gray-100 font-medium mb-2">Reference Images</label>
                    <input
                      type="file"
                      name="referenceFiles"
                      accept=".png,.jpg,.jpeg,.svg"
                      multiple
                      className="w-full text-gray-900 dark:text-gray-100"
                      ref={referenceFilesInputRef}
                      onChange={handleReferenceFilesChange}
                    />
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">Optional: Upload reference images</p>
                    
                    {referenceUploadStatus.uploading && (
                      <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">Uploading files...</p>
                    )}
                    
                    {referenceUploadStatus.error && (
                      <p className="text-sm text-red-600 dark:text-red-400 mt-2">Error: {referenceUploadStatus.error}</p>
                    )}
                    
                    {referenceUploadStatus.fileUrls.length > 0 && (
                      <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                        {referenceUploadStatus.fileUrls.length} file(s) uploaded successfully!
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-gray-900 dark:text-gray-100 font-medium mb-2">Product Type*</label>
                    <input
                      type="text"
                      name="productType"
                      placeholder="e.g., Hoodie, T-Shirt, Tank Top"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-900 dark:text-gray-100 font-medium mb-2">Additional Notes</label>
                    <textarea
                      rows={2}
                      name="notes"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800"
                    ></textarea>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting || referenceUploadStatus.uploading}
                  className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 mt-6 disabled:bg-purple-300 dark:disabled:bg-purple-800"
                >
                  {isSubmitting ? 'Submitting...' : referenceUploadStatus.uploading ? 'Uploading Files...' : 'Start Design Process'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
