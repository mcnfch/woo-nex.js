import React from 'react';
import Link from 'next/link';
import parse from 'html-react-parser';
import { notFound } from 'next/navigation';
import { getBlogPosts, getBlogPostBySlug } from '../../../lib/woocommerce';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const post = await getBlogPostBySlug(resolvedParams.slug);
  
  if (!post) {
    return {
      title: 'Blog Post Not Found | Groovy Gallery Designs',
      description: 'The blog post you\'re looking for doesn\'t exist or has been removed.'
    };
  }
  
  return {
    title: `${post.title.rendered} | Groovy Gallery Designs`,
    description: post.excerpt.rendered.replace(/<[^>]*>/g, '').substring(0, 160)
  };
}

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const post = await getBlogPostBySlug(resolvedParams.slug);
  
  if (!post) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <Link 
          href="/blog"
          className="inline-block mb-6 text-purple-600 hover:text-purple-800 transition-colors dark:text-purple-400 dark:hover:text-purple-300"
        >
          ← Back to Blog
        </Link>

        <article className="dark:text-white">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 dark:text-white">
            {parse(post.title.rendered)}
          </h1>
          
          <div className="text-gray-500 dark:text-gray-400 mb-6">
            {new Date(post.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>

          {post._embedded && post._embedded['wp:featuredmedia'] && post._embedded['wp:featuredmedia'][0] && (
            <div className="mb-8">
              <img 
                src={post._embedded['wp:featuredmedia'][0].source_url} 
                alt={post._embedded['wp:featuredmedia'][0].alt_text || post.title.rendered} 
                className="w-full h-auto rounded-lg"
              />
            </div>
          )}

          <div className="prose prose-lg max-w-none dark:prose-invert">
            {parse(post.content.rendered)}
          </div>
        </article>
      </div>
    </div>
  );
}
