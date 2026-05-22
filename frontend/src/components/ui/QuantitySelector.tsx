import React from 'react';
import {Button} from './Button';

interface QuantitySelectorProps {
  quantity: number;
  onChange: (newQuantity: number) => void;
  min?: number;
  max?: number;
}

const QuantitySelector: React.FC<QuantitySelectorProps> = ({ quantity, onChange, min = 1, max = 99 }) => {
  const decrement = () => {
    if (quantity > min) onChange(quantity - 1);
  };
  const increment = () => {
    if (quantity < max) onChange(quantity + 1);
  };

  return (
    <div className="flex items-center space-x-2 border rounded-sm overflow-hidden w-max">
      <Button
        onClick={decrement}
        className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700"
        disabled={quantity <= min}
      >
        -
      </Button>
      <span className="px-2 text-sm font-medium">{quantity}</span>
      <Button
        onClick={increment}
        className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700"
        disabled={quantity >= max}
      >
        +
      </Button>
    </div>
  );
};

export default QuantitySelector;
