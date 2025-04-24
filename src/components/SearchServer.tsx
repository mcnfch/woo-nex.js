import { searchProducts } from '../app/actions/search';
import SearchInput from './SearchInput';
import type { Product } from '../types/woocommerce';

interface SearchServerProps {
  initialQuery?: string;
}

/**
 * Server component for search functionality
 * Handles initial data fetching and renders the client search input
 */
export default async function SearchServer({ initialQuery = '' }: SearchServerProps) {
  // Only fetch initial results if query is provided and has at least 2 characters
  let initialResults: Product[] = [];
  
  if (initialQuery && initialQuery.length >= 2) {
    initialResults = await searchProducts(initialQuery);
  }
  
  return (
    <div className="relative">
      <SearchInput initialQuery={initialQuery} initialResults={initialResults} />
    </div>
  );
}
