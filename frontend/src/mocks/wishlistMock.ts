// src/mocks/wishlistMock.ts
import { Product } from '../types/api.types';

export const mockWishlist: Product[] = [
  {
    id: 'p1',
    name: 'Flipkart SmartWatch 2.0',
    slug: 'flipkart-smartwatch-2',
    price: 1999,
    discountPrice: 1499,
    stock: 10,
    isActive: true,
    imageUrls: ['https://via.placeholder.com/150'],
    description: 'A sleek smartwatch with health tracking.',
    rating: 4.5,
    reviewCount: 128,
    categoryId: 'cat1',
  },
  {
    id: 'p2',
    name: 'Bluetooth Headphones',
    slug: 'bluetooth-headphones',
    price: 1499,
    discountPrice: 999,
    stock: 5,
    isActive: true,
    imageUrls: ['https://via.placeholder.com/150'],
    description: 'Noise-cancelling over-ear headphones.',
    rating: 4.2,
    reviewCount: 95,
    categoryId: 'cat2',
  },
];
