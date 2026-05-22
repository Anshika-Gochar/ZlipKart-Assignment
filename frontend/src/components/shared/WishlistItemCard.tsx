import React from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { Trash2, ShoppingCart, Star } from 'lucide-react';
import { removeFromWishlist, moveToCart } from '../../store/slices/wishlistSlice';
import { AppDispatch } from '../../store';
import { Product } from '../../types/api.types';
import { formatCurrency } from '../../utils/formatCurrency';

interface Props {
  item: Product;
}

export const WishlistItemCard: React.FC<Props> = ({ item }) => {
  const dispatch = useDispatch<AppDispatch>();

  const hasDiscount = item.discountPrice < item.price;
  const discountPercent = hasDiscount
    ? Math.round(((item.price - item.discountPrice) / item.price) * 100)
    : 0;

  const handleRemove = () => {
    dispatch(removeFromWishlist(item.id));
  };

  const handleMoveToCart = () => {
    dispatch(moveToCart(item.id));
  };

  return (
    <div className="flex bg-white border border-gray-200 rounded-sm hover:shadow-[0_2px_8px_rgba(0,0,0,0.1)] transition-shadow p-3 sm:p-4 gap-4">
      {/* Product Image */}
      <Link to={`/products/${item.id}`} className="flex-shrink-0 w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center bg-gray-50 rounded-sm">
        <img
          src={item.imageUrls[0] || 'https://via.placeholder.com/128'}
          alt={item.name}
          className="max-w-full max-h-full object-contain"
        />
      </Link>

      {/* Product Info */}
      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div>
          <Link to={`/products/${item.id}`}>
            <h3 className="text-sm font-medium text-[#212121] line-clamp-2 hover:text-primary-600 mb-1">
              {item.name}
            </h3>
          </Link>

          {/* Rating */}
          <div className="flex items-center space-x-2 mb-2">
            <div className="flex items-center bg-success text-white px-1.5 py-0.5 rounded-sm text-[11px] font-bold">
              {Number(item.rating).toFixed(1)} <Star className="w-2.5 h-2.5 ml-0.5 fill-current" />
            </div>
            <span className="text-[#878787] text-xs">({item.reviewCount})</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline space-x-2 flex-wrap">
            <span className="text-base font-medium text-[#212121]">
              {formatCurrency(item.discountPrice)}
            </span>
            {hasDiscount && (
              <>
                <span className="text-xs text-[#878787] line-through">
                  {formatCurrency(item.price)}
                </span>
                <span className="text-xs font-medium text-success">
                  {discountPercent}% off
                </span>
              </>
            )}
          </div>

          {!item.stock && (
            <p className="text-xs text-[#ff6161] mt-1 font-medium">Out of stock</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 mt-3">
          <button
            onClick={handleMoveToCart}
            disabled={!item.stock}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-primary-600 text-white text-xs font-medium rounded-sm hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors uppercase tracking-wide"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            Move to Cart
          </button>
          <button
            onClick={handleRemove}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 text-xs font-medium text-gray-600 rounded-sm hover:bg-gray-50 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Remove
          </button>
        </div>
      </div>
    </div>
  );
};
