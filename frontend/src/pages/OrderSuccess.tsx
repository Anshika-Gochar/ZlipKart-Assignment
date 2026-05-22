// src/pages/OrderSuccess.tsx
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle, Package, ShoppingBag } from 'lucide-react';

const OrderSuccess = () => {
  const location = useLocation();
  const orderId = (location.state as { orderId?: string })?.orderId;

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 py-16">
      {/* Success Icon */}
      <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
        <CheckCircle className="w-12 h-12 text-success" strokeWidth={1.5} />
      </div>

      <h1 className="text-2xl font-medium text-[#212121] mb-2">Order Placed Successfully!</h1>
      <p className="text-sm text-[#878787] text-center mb-1">
        Thank you for your purchase. Your order is being processed.
      </p>
      {orderId && (
        <p className="text-sm text-[#878787] mb-8">
          Order ID: <span className="font-medium text-[#212121]">#{orderId.slice(-8).toUpperCase()}</span>
        </p>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mt-2">
        {orderId && (
          <Link
            to={`/orders/${orderId}`}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-sm hover:bg-primary-700 transition-colors uppercase tracking-wide"
          >
            <Package className="w-4 h-4" />
            Track Order
          </Link>
        )}
        <Link
          to="/products"
          className="flex items-center gap-2 px-6 py-2.5 border border-primary-600 text-primary-600 text-sm font-medium rounded-sm hover:bg-blue-50 transition-colors uppercase tracking-wide"
        >
          <ShoppingBag className="w-4 h-4" />
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccess;