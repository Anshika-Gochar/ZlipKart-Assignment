import React, { useState } from 'react';
import { Button } from './Button';
import toast from 'react-hot-toast';

// Backend PaymentMethod enum: COD | UPI | CARD | NET_BANKING | WALLET
type PaymentMethod = 'COD' | 'UPI' | 'CARD' | 'NET_BANKING' | 'WALLET';

interface CheckoutSectionProps {
  selectedAddressId?: string;
  onPlaceOrder: (payload: { addressId: string; paymentMethod: PaymentMethod }) => void;
  isPlacing: boolean;
}

const paymentOptions: { label: string; value: PaymentMethod; icon: string }[] = [
  { label: 'Cash on Delivery', value: 'COD', icon: '💵' },
  { label: 'Card Payment', value: 'CARD', icon: '💳' },
  { label: 'UPI', value: 'UPI', icon: '📱' },
];

export const CheckoutSection: React.FC<CheckoutSectionProps> = ({ selectedAddressId, onPlaceOrder, isPlacing }) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD');

  const handlePlace = () => {
    if (!selectedAddressId) {
      toast.error('Please select a delivery address to continue');
      return;
    }
    onPlaceOrder({ addressId: selectedAddressId, paymentMethod });
  };

  return (
    <div className="border rounded-sm p-4 bg-white space-y-4">
      <h3 className="text-sm font-medium text-[#212121] uppercase tracking-wide">Payment Method</h3>
      <div className="flex flex-col space-y-2">
        {paymentOptions.map(opt => (
          <label
            key={opt.value}
            className={`inline-flex items-center cursor-pointer border rounded-sm px-3 py-2.5 transition-colors ${
              paymentMethod === opt.value
                ? 'border-primary-600 bg-blue-50'
                : 'border-gray-200 hover:bg-gray-50'
            }`}
          >
            <input
              type="radio"
              name="payment"
              value={opt.value}
              checked={paymentMethod === opt.value}
              onChange={() => setPaymentMethod(opt.value)}
              className="form-radio h-4 w-4 text-primary-600"
            />
            <span className="ml-2 text-sm text-[#212121]">
              {opt.icon} {opt.label}
            </span>
          </label>
        ))}
      </div>
      <Button
        onClick={handlePlace}
        variant="secondary"
        size="md"
        isLoading={isPlacing}
        className="w-full"
        disabled={isPlacing}
      >
        {isPlacing ? 'Placing Order…' : 'Place Order'}
      </Button>
    </div>
  );
};

export default CheckoutSection;
