import { Link, useNavigate } from 'react-router-dom';
import { Heart, Star } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '../../store';
import { addToWishlist, removeFromWishlist, selectIsWishlisted } from '../../store/slices/wishlistSlice';
import { useAuth } from '../../hooks/useAuth';
import { ProductImage } from './ProductImage';
import type { Product } from '../../types/api.types';
import { formatCurrency } from '../../utils/formatCurrency';

interface ProductCardProps {
  product: Product;
  // Legacy props kept for backward compatibility (PDP passes these)
  onToggleWishlist?: (productId: string) => void;
  isWishlisted?: boolean;
}

export const ProductCard = ({ product, onToggleWishlist, isWishlisted: isWishlistedProp }: ProductCardProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Read wishlist state from Redux (works even on PLP/homepage)
  const isWishlistedFromStore = useSelector(selectIsWishlisted(product.id));

  // If a parent explicitly controls wishlist state (legacy PDP), use that;
  // otherwise fall back to Redux store (PLP/homepage cards).
  const isWishlisted = isWishlistedProp !== undefined ? isWishlistedProp : isWishlistedFromStore;

  const hasDiscount = product.discountPrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // If parent has explicit handler (PDP), delegate to it
    if (onToggleWishlist) {
      onToggleWishlist(product.id);
      return;
    }

    // Otherwise handle directly via Redux (PLP/homepage)
    if (!isAuthenticated) {
      navigate('/auth/login');
      return;
    }

    if (isWishlistedFromStore) {
      dispatch(removeFromWishlist(product.id));
    } else {
      dispatch(addToWishlist(product.id));
    }
  };

  return (
    <div className="group relative bg-white flex flex-col hover:shadow-[0_4px_20px_0_rgba(0,0,0,0.12)] transition-all duration-200 h-full p-3 sm:p-4 border border-transparent hover:border-gray-200">
      {/* Image container — fixed aspect ratio prevents layout shift */}
      <div className="relative mb-3">
        <ProductImage
          src={product.imageUrls[0]}
          alt={product.name}
          containerClassName="h-48 sm:h-52 w-full"
          fit="contain"
        />
        {/* Wishlist heart */}
        <button
          onClick={handleWishlistClick}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`
            absolute top-1 right-1 z-10
            w-8 h-8 rounded-full flex items-center justify-center
            bg-white shadow-sm border border-gray-100
            transition-all duration-150 hover:scale-110
            ${isWishlisted ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
          `}
        >
          <Heart
            className="h-4 w-4"
            fill={isWishlisted ? '#ff6161' : 'none'}
            color={isWishlisted ? '#ff6161' : '#878787'}
            strokeWidth={2}
          />
        </button>
      </div>
      <div className="flex flex-col flex-1">
        <h3 className="text-[14px] font-medium text-[#212121] line-clamp-2 hover:text-primary-600 mb-1 leading-tight">
          <Link to={`/products/${product.id}`} className="static">
            <span aria-hidden="true" className="absolute inset-0 z-0" />
            {product.name}
          </Link>
        </h3>

        <div className="flex items-center space-x-2 mb-1.5">
          <div className="flex items-center bg-success text-white px-1.5 py-0.5 rounded-sm text-[11px] font-bold">
            {Number(product.rating).toFixed(1)} <Star className="w-2.5 h-2.5 ml-0.5 fill-current" />
          </div>
          <span className="text-[#878787] text-xs font-medium">({product.reviewCount})</span>
        </div>

        <div className="mt-auto">
          <div className="flex items-baseline space-x-2 flex-wrap">
            <span className="text-[16px] font-medium text-[#212121]">
              {formatCurrency(product.discountPrice)}
            </span>
            {hasDiscount && (
              <>
                <span className="text-xs text-[#878787] line-through">
                  {formatCurrency(product.price)}
                </span>
                <span className="text-xs font-medium text-success">
                  {discountPercent}% off
                </span>
              </>
            )}
          </div>
          {!product.stock && (
            <div className="text-xs font-medium text-[#ff6161] mt-1">Out of stock</div>
          )}
        </div>
      </div>
    </div>
  );
};
