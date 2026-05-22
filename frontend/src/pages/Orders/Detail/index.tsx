import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrderDetail, selectOrderDetail, clearOrderDetail } from '../../../store/slices/ordersSlice';
import { OrderTimeline } from '../../../components/ui/OrderTimeline';
import { AppDispatch, RootState } from '../../../store';
import { ArrowLeft, Package } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatCurrency';

const STATUS_COLORS: Record<string, string> = {
  'PENDING':    'bg-blue-100 text-blue-700',
  'PROCESSING': 'bg-yellow-100 text-yellow-700',
  'SHIPPED':    'bg-orange-100 text-orange-700',
  'DELIVERED':  'bg-green-100 text-green-700',
  'CANCELLED':  'bg-red-100 text-red-600',
  // Legacy
  'Order Placed': 'bg-blue-100 text-blue-700',
  'Packed':       'bg-yellow-100 text-yellow-700',
  'Shipped':      'bg-orange-100 text-orange-700',
  'Delivered':    'bg-green-100 text-green-700',
  'Cancelled':    'bg-red-100 text-red-600',
};

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const order = useSelector(selectOrderDetail);
  const loading = useSelector((state: RootState) => state.orders.isLoading);
  const error = useSelector((state: RootState) => state.orders.error);

  useEffect(() => {
    if (id) dispatch(fetchOrderDetail(id));
    return () => { dispatch(clearOrderDetail()); };
  }, [dispatch, id]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
        <div className="h-6 bg-gray-200 animate-pulse rounded w-48 mb-6" />
        <div className="h-32 bg-gray-200 animate-pulse rounded-sm" />
        <div className="h-48 bg-gray-200 animate-pulse rounded-sm" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 mb-4">{error || 'Order not found.'}</p>
        <Link to="/orders" className="text-sm text-primary-600 hover:underline">← Back to Orders</Link>
      </div>
    );
  }

  const statusColor = STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600';

  // Backend: item.priceAtPurchase (not item.price)
  const subtotal = order.items.reduce(
    (s, i) => s + Number(i.priceAtPurchase) * i.quantity,
    0
  );
  const totalAmount = Number(order.totalAmount);
  const deliveryFee = Math.max(0, totalAmount - subtotal);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Back */}
      <Link to="/orders" className="flex items-center text-sm text-primary-600 hover:underline mb-5">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Orders
      </Link>

      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-sm p-5 mb-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-base font-medium text-[#212121]">Order #{order.id.slice(-8).toUpperCase()}</h1>
            <p className="text-xs text-[#878787] mt-0.5">
              Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'long', year: 'numeric'
              })}
            </p>
            {order.paymentMethod && (
              <p className="text-xs text-[#878787] mt-0.5">
                Payment: <span className="font-medium">{order.paymentMethod}</span>
                {order.paymentStatus && <span className="ml-2">· {order.paymentStatus}</span>}
              </p>
            )}
          </div>
          <span className={`inline-flex items-center px-3 py-1 rounded-sm text-xs font-semibold self-start sm:self-auto ${statusColor}`}>
            {order.status}
          </span>
        </div>
      </div>

      {/* Delivery Address */}
      {order.address && (
        <div className="bg-white border border-gray-200 rounded-sm p-5 mb-4 shadow-sm">
          <h2 className="text-sm font-medium text-[#212121] uppercase tracking-wide mb-3">Delivery Address</h2>
          <p className="text-sm font-medium text-[#212121]">{order.address.fullName}</p>
          <p className="text-sm text-[#878787]">
            {order.address.street}{order.address.landmark ? `, ${order.address.landmark}` : ''}
          </p>
          <p className="text-sm text-[#878787]">
            {order.address.city}, {order.address.state} — {order.address.pincode}
          </p>
          <p className="text-sm text-[#212121] mt-1 font-medium">📞 {order.address.phone}</p>
        </div>
      )}

      {/* Timeline */}
      <div className="bg-white border border-gray-200 rounded-sm p-5 mb-4 shadow-sm">
        <h2 className="text-sm font-medium text-[#212121] uppercase tracking-wide mb-4">Order Status</h2>
        <OrderTimeline currentStatus={order.status} />
      </div>

      {/* Order Items */}
      {order.items.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-sm p-5 mb-4 shadow-sm">
          <h2 className="text-sm font-medium text-[#212121] uppercase tracking-wide mb-4">Items Ordered</h2>
          <div className="space-y-4 divide-y divide-gray-100">
            {order.items.map((item, idx) => (
              <div key={item.id || idx} className="flex items-start gap-4 pt-4 first:pt-0">
                <div className="w-16 h-16 flex-shrink-0 bg-gray-50 rounded-sm flex items-center justify-center">
                  {item.product?.imageUrls?.[0] ? (
                    <img
                      src={item.product.imageUrls[0]}
                      alt={item.product.name}
                      className="max-w-full max-h-full object-contain p-1"
                    />
                  ) : (
                    <Package className="w-6 h-6 text-gray-300" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#212121] line-clamp-2">
                    {item.product?.name || 'Product'}
                    {item.product?.brand && (
                      <span className="text-xs text-[#878787] ml-1 font-normal">by {item.product.brand}</span>
                    )}
                  </p>
                  <p className="text-xs text-[#878787] mt-0.5">Qty: {item.quantity}</p>
                  <p className="text-xs text-[#878787]">
                    {formatCurrency(Number(item.priceAtPurchase))} each
                  </p>
                </div>
                <div className="text-sm font-medium text-[#212121] flex-shrink-0">
                  {formatCurrency(Number(item.priceAtPurchase) * item.quantity)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pricing Breakdown */}
      <div className="bg-white border border-gray-200 rounded-sm p-5 shadow-sm">
        <h2 className="text-sm font-medium text-[#212121] uppercase tracking-wide mb-4">Price Details</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-[#878787]">
              Price ({order.items.length} {order.items.length === 1 ? 'item' : 'items'})
            </span>
            <span className="text-[#212121]">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#878787]">Delivery Charges</span>
            <span className={deliveryFee === 0 ? 'text-success font-medium' : 'text-[#212121]'}>
              {deliveryFee <= 0 ? 'Free' : formatCurrency(deliveryFee)}
            </span>
          </div>
          <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between font-medium text-base">
            <span className="text-[#212121]">Total Amount</span>
            <span className="text-[#212121]">{formatCurrency(totalAmount)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
