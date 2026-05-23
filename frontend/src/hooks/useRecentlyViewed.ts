import { useState, useCallback } from 'react';
import type { Product } from '../types/api.types';

const STORAGE_KEY = 'recentlyViewed';
const MAX_ITEMS = 8;

const readFromStorage = (): Product[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Product[]) : [];
  } catch {
    return [];
  }
};

const writeToStorage = (products: Product[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  } catch {
    // Silently ignore storage errors (e.g. private mode quota exceeded)
  }
};

export const useRecentlyViewed = () => {
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>(() =>
    readFromStorage()
  );

  const addToRecentlyViewed = useCallback((product: Product) => {
    setRecentlyViewed((prev) => {
      // Remove any existing entry with the same id to prevent duplicates
      const deduplicated = prev.filter((p) => p.id !== product.id);
      // Prepend the new product and cap at MAX_ITEMS
      const updated = [product, ...deduplicated].slice(0, MAX_ITEMS);
      writeToStorage(updated);
      return updated;
    });
  }, []);

  const clearRecentlyViewed = useCallback(() => {
    setRecentlyViewed([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Silently ignore
    }
  }, []);

  return {
    recentlyViewed,
    addToRecentlyViewed,
    clearRecentlyViewed,
  };
};
