import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders, selectOrders } from '../../store/slices/ordersSlice';
import { OrderCard } from '../../components/shared/OrderCard';
import { AppDispatch, RootState } from '../../store';
import { Package } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Orders() {
  const dispatch = useDispatch<AppDispatch>();
  const orders = useSelector(selectOrders);
  const loading = useSelector((state: RootState) => state.orders.isLoading);
  const error = useSelector((state: RootState) => state.orders.error);

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="h-6 bg-gray-200 animate-pulse rounded w-36 mb-6" />
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-gray-200 animate-pulse rounded-sm" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-lg font-medium text-gray-700 mb-2">Failed to load orders</h2>
        <p className="text-sm text-gray-500 mb-5">{error}</p>
        <button
          onClick={() => dispatch(fetchOrders())}
          className="px-6 py-2 bg-primary-600 text-white text-sm rounded-sm hover:bg-primary-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-xl font-medium text-[#212121] mb-5">My Orders</h1>
      {orders.length === 0 ? (
        <div className="text-center py-16">
          <Package className="w-20 h-20 text-gray-200 mx-auto mb-4" strokeWidth={1} />
          <h2 className="text-lg font-medium text-[#212121] mb-2">No orders yet!</h2>
          <p className="text-sm text-[#878787] mb-6">Your order history will appear here once you place an order.</p>
          <Link
            to="/products"
            className="inline-block px-8 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-sm hover:bg-primary-700 transition-colors uppercase tracking-wide"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order: import('../../types/api.types').Order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
