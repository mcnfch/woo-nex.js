import React from 'react';
import Link from 'next/link';

export default function BlogPostNotFound() {
  return (
    <div className="container mx-auto px-4 py-12 text-center">
      <h1 className="text-2xl font-bold mb-4 dark:text-white">Blog Post Not Found</h1>
      <p className="mb-6 dark:text-gray-300">The blog post you&apos;re looking for doesn&apos;t exist or has been removed.</p>
      <Link 
        href="/blog"
        className="inline-block px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
      >
        Back to Blog
      </Link>
    </div>
  );
}
