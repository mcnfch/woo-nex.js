'use client';

import React from 'react';

interface JsonLdSchemaProps {
  data: Record<string, any>;
}

/**
 * Component to inject JSON-LD schema markup into a page
 * @param data The schema data object
 */
export default function JsonLdSchema({ data }: JsonLdSchemaProps) {
  // Ensure data is properly stringified for JSON-LD compliance
  const jsonString = JSON.stringify(data);
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonString }}
    />
  );
}
