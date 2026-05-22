import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCart, updateCartItem, removeCartItem } from '../../store/slices/cartSlice';
import CartItemCard from '../../components/shared/CartItemCard';
import PriceSummaryCard from '../../components/ui/PriceSummaryCard';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { AppDispatch, RootState } from '../../store';
import { ShoppingCart } from 'lucide-react';

const CartPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { cart, isLoading, error } = useSelector((state: RootState) => state.cart);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const handleQuantityChange = async (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    try {
      await dispatch(updateCartItem({ itemId, quantity })).unwrap();
      toast.success('Quantity updated');
    } catch {
      toast.error('Failed to update quantity');
    }
  };

  const handleRemove = async (itemId: string) => {
    try {
      await dispatch(removeCartItem(itemId)).unwrap();
      toast.success('Item removed from cart');
    } catch {
      toast.error('Failed to remove item');
    }
  };

  if (isLoading && !cart) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="h-6 bg-gray-200 rounded w-40 mb-4 animate-pulse" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
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
          <div className="lg:col-span-1">
            <div className="h-48 bg-gray-200 rounded-sm animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-lg font-medium text-gray-700 mb-2">Failed to load your cart</h2>
        <p className="text-sm text-gray-500 mb-5">{error}</p>
        <button
          onClick={() => dispatch(fetchCart())}
          className="px-6 py-2 bg-primary-600 text-white text-sm rounded-sm hover:bg-primary-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <ShoppingCart className="w-20 h-20 text-gray-200 mx-auto mb-5" strokeWidth={1} />
        <h2 className="text-xl font-medium text-[#212121] mb-2">Your cart is empty!</h2>
        <p className="text-sm text-[#878787] mb-8">Add items to it now.</p>
        <Link
          to="/products"
          className="inline-block px-10 py-3 bg-primary-600 text-white text-sm font-medium rounded-sm hover:bg-primary-700 transition-colors uppercase tracking-wide"
        >
          Shop Now
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-base font-medium text-[#212121] mb-4">
        My Cart ({cart.items.length} {cart.items.length === 1 ? 'item' : 'items'})
      </h1>
      <div className="grid gap-4 lg:grid-cols-3 items-start">
        {/* Cart items list */}
        <section className="lg:col-span-2 space-y-3">
          {cart.items.map(item => (
            <CartItemCard
              key={item.id}
              item={item}
              onQuantityChange={handleQuantityChange}
              onRemove={handleRemove}
            />
          ))}
        </section>

        {/* Price summary — sticky */}
        <aside className="lg:col-span-1 sticky top-20">
          <PriceSummaryCard cart={cart} />
          <Link
            to="/checkout"
            className="mt-3 block w-full bg-[#fb641b] hover:bg-[#e85510] text-white text-center py-3 rounded-sm font-medium text-sm transition-colors uppercase tracking-wide"
          >
            Place Order
          </Link>
        </aside>
      </div>
    </div>
  );
};

export default CartPage;
