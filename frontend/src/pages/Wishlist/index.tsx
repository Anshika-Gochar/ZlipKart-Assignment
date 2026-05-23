import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWishlist, selectWishlistItems, selectWishlistCount } from '../../store/slices/wishlistSlice';
import { WishlistItemCard } from '../../components/shared/WishlistItemCard';
import { AppDispatch, RootState } from '../../store';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Product } from '../../types/api.types';

export default function Wishlist() {
  const dispatch = useDispatch<AppDispatch>();
  const items = useSelector(selectWishlistItems);
  const count = useSelector(selectWishlistCount);
  const loading = useSelector((state: RootState) => state.wishlist.isLoading);
  const error = useSelector((state: RootState) => state.wishlist.error);

  useEffect(() => {
    dispatch(fetchWishlist());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="h-6 bg-gray-200 animate-pulse rounded w-48 mb-6" />
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex bg-white p-4 rounded-sm border border-gray-200 animate-pulse gap-4">
              <div className="w-24 h-24 bg-gray-200 flex-shrink-0 rounded-sm" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="h-5 bg-gray-200 rounded w-1/3 mt-4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-lg font-medium text-gray-700 mb-2">Failed to load wishlist</h2>
        <p className="text-sm text-gray-500 mb-5">{error}</p>
        <button
          onClick={() => dispatch(fetchWishlist())}
          className="px-6 py-2 bg-primary-600 text-white text-sm rounded-sm hover:bg-primary-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-xl font-medium text-[#212121] mb-5">
        My Wishlist {count > 0 && <span className="text-[#878787] text-sm font-normal">({count} items)</span>}
      </h1>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <Heart className="w-20 h-20 text-gray-200 mx-auto mb-4" strokeWidth={1} />
          <h2 className="text-lg font-medium text-[#212121] mb-2">Your wishlist is empty</h2>
          <p className="text-sm text-[#878787] mb-6">Save items you love and access them anytime.</p>
          <Link
            to="/products"
            className="inline-block px-8 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-sm hover:bg-primary-700 transition-colors uppercase tracking-wide"
          >
            Discover Products
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item: Product) => (
            <WishlistItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
