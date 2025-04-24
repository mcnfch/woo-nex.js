// Product interface for WooCommerce products
export interface Product {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  date_created: string;
  description: string;
  short_description: string;
  price: string;
  regular_price: string;
  sale_price: string;
  stock_status: "instock" | "outofstock" | "onbackorder";
  categories: {
    id: number;
    name: string;
    slug: string;
  }[];
  images: {
    id: number;
    src: string;
    alt: string;
  }[];
  attributes?: {
    id: number;
    name: string;
    options: string[];
    variation: boolean;
    visible: boolean;
  }[];
}

// Search result item interface
export interface SearchResult {
  products: Product[];
  message?: string;
}
