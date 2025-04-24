HeaderClient Search Component
Currently: Client-side component making fetch requests to Redis
Impact: High (affects Total Blocking Time)
Solution: Convert to server component that pre-renders search results or implement a Server Action for search

# Server-Side Search Implementation Plan

## Current Architecture
- Client-side search in `HeaderClient.tsx` makes fetch requests to `/api/search`
- `/api/search` endpoint connects to Redis on port 6380
- Search results displayed in a dropdown component in the header

## Performance Impact
- High impact on Total Blocking Time (2,470ms)
- Contributes to JavaScript execution time (2,801ms)
- Affects user experience with delayed interactivity

## Migration Strategy for Next.js 15.3

### 1. Create Server Components
1. Create a new `SearchServer.tsx` server component:
   - Will handle initial data fetching directly from Redis
   - Will not include any client-side hooks (useState, useEffect)
   - Will pass search results to a client component for interactivity

2. Create a minimal client component `SearchInput.tsx`:
   - Will only handle user input and interaction
   - Will use URL-based search queries for state management
   - Will implement debouncing for improved performance

### 2. Implementation Steps

#### Step 1: Create a Server Action for Search
- Create a server action function in a separate file (`actions/search.ts`)
- Connect directly to Redis and fetch search results
- Return properly typed results to ensure type safety

#### Step 2: Create Search Server Component
- Create a server component that uses the server action
- Handle initial search results display
- Pass data to the client input component

#### Step 3: Create Minimal Client Components
- Create a small client input component for user interaction
- Use URL search parameters for state management
- Implement debouncing to reduce requests

#### Step 4: Integrate with Header
- Update `Header.tsx` to use the new server component
- Remove client-side search functionality from `HeaderClient.tsx`
- Ensure proper styling and layout consistency

### 3. Technical Details

```tsx
// app/actions/search.ts
'use server'

import Redis from 'ioredis';
import { Product } from '../../types/woocommerce';

export async function searchProducts(query: string): Promise<Product[]> {
  // Direct Redis connection within server action
  // Return typed products array
}

// components/SearchServer.tsx
// No 'use client' directive - this is a server component
import { searchProducts } from '../app/actions/search';
import SearchInput from './SearchInput';

export default async function SearchServer({ initialQuery = '' }) {
  // Can use await directly in server component
  const initialResults = initialQuery ? await searchProducts(initialQuery) : [];
  
  return (
    <div>
      <SearchInput initialQuery={initialQuery} initialResults={initialResults} />
    </div>
  );
}

// components/SearchInput.tsx
'use client'

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Product } from '../types/woocommerce';
import { searchProducts } from '../app/actions/search';

export default function SearchInput({ initialQuery, initialResults }) {
  // Minimal client-side state for user interaction
  // URL-based state management for SEO & sharing
}
```

### 4. Benefits
- Reduced JavaScript bundle size
- Improved Total Blocking Time
- Better SEO with server-rendered search results
- Improved user experience with faster initial load

### 5. Testing Strategy
- Test server component rendering
- Test client component interactivity
- Verify Redis connection works as expected
- Ensure no TypeScript errors are introduced

Product Cards/Grids
Currently: Client components (ProductCard.tsx, CategoryGrid.tsx)
Impact: High (initial page load)
Solution: Convert to server components with client islands for interactive elements only
Category Navigation
Currently: Client-rendered dropdown menus in HeaderClient
Impact: Medium-High (affects FCP and layout)
Solution: Pre-render category structure server-side
Footer Component
Currently: Client component
Impact: Medium (affects layout)
Solution: Convert to server component as it's mostly static content
Product Information Display
Currently: Client components (ProductInfo.tsx, ProductAttributes.tsx)
Impact: Medium (affects LCP)
Solution: Server-render product details and use client islands for interactive elements
Theme Toggle
Currently: Client component
Impact: Low
Solution: Keep as client component but lazy-load it
Implementation Strategy
Start with the HeaderClient Search:
Create a server-side API endpoint to generate initial results
Only use client-side for incremental search after initial load
Implement debouncing (already in place) to minimize API calls
Convert Product/Category Components:
Move data fetching to server components
Keep minimal client components for interactive elements
Prioritize Above-the-fold Content:
Focus first on components visible in the initial viewport
This approach follows your project rules by:

Keeping changes simple and focused on performance
Maintaining the existing data management through centralized WooCommerce API calls
Not restructuring code unless necessary
Addressing TypeScript errors while making the changes
These changes could reduce Total Blocking Time by 50-70% and improve First Contentful Paint and Largest Contentful Paint metrics significantly.
