// src/components/shared/OrderCard.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Order } from '../../types/api.types';
import { formatCurrency } from '../../utils/formatCurrency';
import { Package } from 'lucide-react';

interface Props {
  order: Order;
}

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  'PENDING':    { bg: 'bg-blue-50',   text: 'text-blue-700',   dot: 'bg-blue-500' },
  'PROCESSING': { bg: 'bg-yellow-50', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  'SHIPPED':    { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500' },
  'DELIVERED':  { bg: 'bg-green-50',  text: 'text-green-700',  dot: 'bg-green-500' },
  'CANCELLED':  { bg: 'bg-red-50',    text: 'text-red-600',    dot: 'bg-red-500' },
  // Legacy status labels (fallback)
  'Order Placed': { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  'Packed':       { bg: 'bg-yellow-50', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  'Shipped':      { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500' },
  'Delivered':    { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
  'Cancelled':    { bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-500' },
};

export const OrderCard: React.FC<Props> = ({ order }) => {
  const style = STATUS_STYLES[order.status] || { bg: 'bg-gray-50', text: 'text-gray-600', dot: 'bg-gray-400' };
  const firstItem = order.items?.[0];

  // Backend: item.product.imageUrls[0] and item.product.name
  const firstImage = firstItem?.product?.imageUrls?.[0];
  const firstTitle = firstItem?.product?.name || `Order #${order.id.slice(-8).toUpperCase()}`;

  return (
    <Link
      to={`/orders/${order.id}`}
      className="block bg-white border border-gray-200 rounded-sm hover:shadow-[0_2px_8px_rgba(0,0,0,0.1)] transition-shadow"
    >
      <div className="p-4 flex items-center gap-4">
        {/* Product thumbnail or icon */}
        <div className="w-14 h-14 flex-shrink-0 bg-gray-50 rounded-sm flex items-center justify-center border border-gray-100">
          {firstImage ? (
            <img src={firstImage} alt={firstTitle} className="max-w-full max-h-full object-contain p-1" />
          ) : (
            <Package className="w-6 h-6 text-gray-300" />
          )}
        </div>

        {/* Order Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[#212121] truncate">{firstTitle}</p>
          {order.items?.length > 1 && (
            <p className="text-xs text-[#878787]">+{order.items.length - 1} more item(s)</p>
          )}
          <p className="text-xs text-[#878787] mt-0.5">
            {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        </div>

        {/* Status + Price */}
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm text-xs font-semibold ${style.bg} ${style.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
            {order.status}
          </span>
          <span className="text-sm font-medium text-[#212121]">
            {formatCurrency(Number(order.totalAmount))}
          </span>
        </div>
      </div>
    </Link>
  );
};
