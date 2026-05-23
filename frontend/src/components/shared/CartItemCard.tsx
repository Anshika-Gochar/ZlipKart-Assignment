import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { CartItem } from '../../types/api.types';
import { formatCurrency } from '../../utils/formatCurrency';
import QuantitySelector from '../ui/QuantitySelector';
import { wishlistApi } from '../../api/wishlistApi';
import { fetchWishlist } from '../../store/slices/wishlistSlice';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';
import { Heart, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { ProductImage } from './ProductImage';

interface CartItemCardProps {
  item: CartItem;
  onQuantityChange: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
}

const CartItemCard: React.FC<CartItemCardProps> = ({ item, onQuantityChange, onRemove }) => {
  const dispatch = useDispatch<AppDispatch>();
  const product = item.product;
  const [movingToWishlist, setMovingToWishlist] = useState(false);

  if (!product) return null;

  const hasDiscount = product.discountPrice < product.price;
  const discountPct = hasDiscount
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const handleMoveToWishlist = async () => {
    setMovingToWishlist(true);
    try {
      await wishlistApi.addItem(product.id);
      await dispatch(fetchWishlist());
      onRemove(item.id); // remove from cart after adding to wishlist
      toast.success('Moved to wishlist!');
    } catch (err: any) {
      // 409 means already in wishlist — still remove from cart
      if (err?.response?.status === 409) {
        onRemove(item.id);
        toast.success('Already in wishlist — removed from cart');
      } else {
        toast.error('Failed to move to wishlist');
      }
    } finally {
      setMovingToWishlist(false);
    }
  };

  return (
    <div className="flex bg-white p-3 sm:p-4 rounded-sm border border-gray-200 hover:shadow-sm transition-shadow">
      {/* Image */}
      <Link
        to={`/products/${product.id}`}
        className="w-24 h-24 flex-shrink-0 mr-4 rounded-sm overflow-hidden"
      >
        <ProductImage
          src={product.imageUrls[0]}
          alt={product.name}
          containerClassName="w-24 h-24"
          fit="contain"
        />
      </Link>

      {/* Details */}
      <div className="flex flex-col flex-1 min-w-0">
        <Link to={`/products/${product.id}`}>
          <h3 className="text-sm font-medium text-[#212121] line-clamp-2 hover:text-primary-600 mb-1">
            {product.name}
          </h3>
        </Link>

        {/* Price */}
        <div className="flex items-center space-x-2 mb-2 flex-wrap">
          <span className="text-base font-medium text-[#212121]">
            {formatCurrency(product.discountPrice)}
          </span>
          {hasDiscount && (
            <>
              <span className="text-xs text-[#878787] line-through">
                {formatCurrency(product.price)}
              </span>
              <span className="text-xs font-medium text-success">
                {discountPct}% off
              </span>
            </>
          )}
        </div>

        {/* Quantity */}
        <QuantitySelector
          quantity={item.quantity}
          onChange={(qty) => onQuantityChange(item.id, qty)}
          min={1}
        />

        {/* Actions */}
        <div className="flex items-center gap-4 mt-2">
          <button
            onClick={() => onRemove(item.id)}
            className="flex items-center gap-1 text-xs text-[#878787] hover:text-red-500 transition-colors font-medium"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Remove
          </button>
          <span className="text-gray-200">|</span>
          <button
            onClick={handleMoveToWishlist}
            disabled={movingToWishlist}
            className="flex items-center gap-1 text-xs text-[#878787] hover:text-primary-600 transition-colors font-medium disabled:opacity-50"
          >
            <Heart className="w-3.5 h-3.5" />
            {movingToWishlist ? 'Moving…' : 'Move to Wishlist'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartItemCard;
