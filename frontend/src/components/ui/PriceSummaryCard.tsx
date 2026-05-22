import React from 'react';
import { formatCurrency } from '../../utils/formatCurrency';
import { calculateDeliveryFee } from '../../utils/deliveryFee';
import { Cart } from '../../types/api.types';

interface PriceSummaryCardProps {
  cart: Cart;
}

const PriceSummaryCard: React.FC<PriceSummaryCardProps> = ({ cart }) => {
  // Use backend-computed summary if available, fallback to client computation
  const subtotal = cart.summary?.subtotal
    ?? cart.items.reduce((sum, item) => sum + item.quantity * (item.product?.discountPrice ?? 0), 0);
  const totalSavings = cart.summary?.totalSavings ?? 0;
  const deliveryFee = calculateDeliveryFee(subtotal);
  const total = subtotal + deliveryFee;

  return (
    <div className="border rounded-sm p-4 bg-white space-y-2">
      <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-3">Price Details</h3>
      <div className="flex justify-between text-sm">
        <span className="text-[#212121]">Price ({cart.items.length} item{cart.items.length !== 1 ? 's' : ''})</span>
        <span>{formatCurrency(subtotal + totalSavings)}</span>
      </div>
      {totalSavings > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-[#212121]">Discount</span>
          <span className="text-success font-medium">− {formatCurrency(totalSavings)}</span>
        </div>
      )}
      <div className="flex justify-between text-sm">
        <span className="text-[#212121]">Delivery Charges</span>
        <span className={deliveryFee === 0 ? 'text-success font-medium' : ''}>
          {deliveryFee === 0 ? '✓ Free' : formatCurrency(deliveryFee)}
        </span>
      </div>
      <hr className="border-t border-gray-200 my-2" />
      <div className="flex justify-between font-medium text-base">
        <span className="text-[#212121]">Total Amount</span>
        <span>{formatCurrency(total)}</span>
      </div>
      {totalSavings > 0 && (
        <p className="text-xs text-success font-medium pt-1">
          You will save {formatCurrency(totalSavings)} on this order
        </p>
      )}
    </div>
  );
};

export default PriceSummaryCard;

