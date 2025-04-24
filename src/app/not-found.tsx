import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-12 text-center">
      <h1 className="text-3xl font-bold mb-4 dark:text-white">Page Not Found</h1>
      <p className="mb-6 dark:text-gray-300">The page you're looking for doesn't exist or has been removed.</p>
      <Link 
        href="/"
        className="inline-block px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
      >
        Back to Home
      </Link>
    </div>
  );
}
