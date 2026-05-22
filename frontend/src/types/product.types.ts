// src/types/product.types.ts

export type SortBy = 'newest' | 'price_asc' | 'price_desc' | 'rating';

export interface ProductListQuery {
  page?: number;
  limit?: number;
  sortBy?: SortBy;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  minRating?: number;
}

export interface SearchQuery {
  q: string;
  page?: number;
  limit?: number;
}
