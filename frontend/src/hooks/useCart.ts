import { useSelector } from 'react-redux';
import { RootState } from '../store';

export const useCart = () => {
  const { cart, isLoading } = useSelector((state: RootState) => state.cart);

  return {
    cart,
    items: cart?.items || [],
    // Use server-computed summary; fall back to client sum if summary not yet loaded
    totalAmount: cart?.summary?.subtotal ?? 0,
    itemCount: cart?.summary?.totalItems ?? cart?.items.reduce((total, item) => total + item.quantity, 0) ?? 0,
    isLoading,
  };
};

