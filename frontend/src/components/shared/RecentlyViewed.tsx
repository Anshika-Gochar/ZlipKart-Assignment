import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, ArrowRight } from 'lucide-react';
import { useRecentlyViewed } from '../../hooks/useRecentlyViewed';
import { ProductCard } from './ProductCard';

export const RecentlyViewed: React.FC = () => {
  const { recentlyViewed, clearRecentlyViewed } = useRecentlyViewed();

  if (recentlyViewed.length === 0) return null;

  return (
    <section className="bg-white shadow-sm px-4 py-5 sm:px-6">
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-[#878787]" />
          <h2 className="text-[16px] font-semibold text-[#212121] tracking-wide">
            Recently Viewed
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={clearRecentlyViewed}
            className="text-xs text-[#878787] hover:text-[#ff6161] transition-colors duration-150"
          >
            (clear)
          </button>
          <Link
            to="/products"
            className="flex items-center gap-1 text-xs font-medium text-primary-600 hover:underline"
          >
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Horizontally scrollable product row */}
      <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-1">
        {recentlyViewed.slice(0, 8).map((product) => (
          <div
            key={product.id}
            className="flex-shrink-0 w-[180px] sm:w-[200px]"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
};
