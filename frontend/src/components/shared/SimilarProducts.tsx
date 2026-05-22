/**
 * src/components/shared/SimilarProducts.tsx
 *
 * Standalone "Similar Products" section for the Product Detail Page.
 *
 * Design decisions:
 * ─────────────────
 * • Local component state (loading / error / data) — no Redux slice needed
 *   for a side-panel recommendation widget.
 * • Fetch is triggered only when `productId` changes and is non-empty,
 *   preventing infinite loops.
 * • Horizontally scrollable on mobile (overflow-x: auto), 4-column grid
 *   on desktop — matches existing Flipkart-style dense layout.
 * • Uses the existing ProductCard + ProductSkeleton components for
 *   visual consistency — no custom card styles.
 */

import { useEffect, useState } from 'react';
import { productApi } from '../../api/productApi';
import type { Product } from '../../types/api.types';
import { ProductCard } from './ProductCard';
import { ProductSkeleton } from './ProductSkeleton';

interface SimilarProductsProps {
  productId: string;
  categoryName?: string;
}

export const SimilarProducts = ({ productId, categoryName }: SimilarProductsProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!productId) return;

    let cancelled = false;

    const fetchSimilar = async () => {
      setLoading(true);
      setError(false);
      try {
        const response = await productApi.getSimilarProducts(productId);
        if (!cancelled) {
          setProducts(response.data ?? []);
        }
      } catch {
        if (!cancelled) {
          setError(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchSimilar();

    // Cleanup: if productId changes before fetch completes, ignore stale response
    return () => {
      cancelled = true;
    };
  }, [productId]);

  // ── Don't render section header if nothing to show after load ──
  if (!loading && (error || products.length === 0)) {
    return null;
  }

  const sectionLabel = categoryName ? `Similar ${categoryName} Products` : 'Similar Products';

  return (
    <section
      className="mt-4 bg-white shadow-[0_1px_4px_0_rgba(0,0,0,0.1)] rounded-sm"
      aria-label={sectionLabel}
    >
      {/* Section header — matches Flipkart's dense heading style */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h2 className="text-base font-medium text-[#212121] tracking-wide">
          {sectionLabel}
        </h2>
        <span className="text-xs text-[#878787]">
          {!loading && `${products.length} products`}
        </span>
      </div>

      {/* ── Scrollable product row ── */}
      <div
        className="flex gap-0 overflow-x-auto similar-products-scroll"
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#d0d0d0 transparent' }}
      >
        {loading
          ? // Skeleton placeholders — 6 cards matching product grid width
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-[180px] sm:w-[200px] border-r border-gray-100 last:border-r-0"
              >
                <ProductSkeleton />
              </div>
            ))
          : products.map((product) => (
              <div
                key={product.id}
                className="flex-shrink-0 w-[180px] sm:w-[200px] border-r border-gray-100 last:border-r-0"
              >
                <ProductCard product={product} />
              </div>
            ))}
      </div>
    </section>
  );
};
