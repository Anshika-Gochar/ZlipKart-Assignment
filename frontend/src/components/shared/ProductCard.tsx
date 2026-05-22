import { Link } from 'react-router-dom';
import { Heart, Star } from 'lucide-react';
import type { Product } from '../../types/api.types';
import { formatCurrency } from '../../utils/formatCurrency';

interface ProductCardProps {
  product: Product;
  onToggleWishlist?: (productId: string) => void;
  isWishlisted?: boolean;
}

export const ProductCard = ({ product, onToggleWishlist, isWishlisted = false }: ProductCardProps) => {
  const hasDiscount = product.discountPrice < product.price;
  const discountPercent = hasDiscount 
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100) 
    : 0;

  return (
    <div className="group relative bg-white flex flex-col hover:shadow-[0_3px_16px_0_rgba(0,0,0,0.11)] transition-shadow duration-200 h-full p-3 sm:p-4 border border-transparent hover:border-gray-200">
      <div className="relative h-48 sm:h-56 w-full flex items-center justify-center mb-4">
        <img
          src={product.imageUrls[0] || 'https://via.placeholder.com/200x250'}
          alt={product.name}
          className="max-h-full max-w-full object-contain"
        />
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleWishlist?.(product.id);
          }}
          className="absolute top-0 right-0 p-1.5 text-gray-300 hover:text-gray-500 z-10"
        >
          <Heart className="h-5 w-5" fill={isWishlisted ? "#ff6161" : "none"} color={isWishlisted ? "#ff6161" : "currentColor"} />
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
