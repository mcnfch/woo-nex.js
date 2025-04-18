import React from 'react';
import Link from 'next/link';
import parse from 'html-react-parser';
import { getBlogPosts } from '../../lib/woocommerce';

export const metadata = {
  title: 'Blog | Groovy Gallery Designs',
  description: 'Read the latest news and updates from Groovy Gallery Designs',
};

export default async function BlogPage() {
  const posts = await getBlogPosts();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center dark:text-white">Our Blog</h1>
      
      {posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-gray-600 dark:text-gray-300">No blog posts found.</p>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <div key={post.id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow dark:border-gray-700 dark:bg-gray-800">
              {post._embedded && post._embedded['wp:featuredmedia'] && post._embedded['wp:featuredmedia'][0] && (
                <div className="aspect-w-16 aspect-h-9">
                  <img 
                    src={post._embedded['wp:featuredmedia'][0].source_url} 
                    alt={post._embedded['wp:featuredmedia'][0].alt_text || post.title.rendered} 
                    className="w-full h-48 object-cover"
                  />
                </div>
              )}
              <div className="p-4">
                <Link href={`/blog/${post.slug}`}>
                  <h2 className="text-xl font-semibold mb-2 hover:text-purple-600 transition-colors dark:text-white dark:hover:text-purple-400">
                    {parse(post.title.rendered)}
                  </h2>
                </Link>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  {new Date(post.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
                <div className="prose prose-sm mb-4 text-gray-600 dark:text-gray-300 line-clamp-3">
                  {parse(post.excerpt.rendered)}
                </div>
                <Link 
                  href={`/blog/${post.slug}`}
                  className="inline-block px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                  aria-label={`Read more about ${post.title.rendered.replace(/<[^>]*>/g, '')}`}
                >
                  Read More
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
