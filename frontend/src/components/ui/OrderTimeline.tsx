// src/components/ui/OrderTimeline.tsx
import React from 'react';
import { CheckCircle, Circle, XCircle } from 'lucide-react';

// Backend status enum: PENDING | PROCESSING | SHIPPED | DELIVERED | CANCELLED
// Map backend statuses to display labels
const STEPS: { status: string; label: string }[] = [
  { status: 'PENDING',    label: 'Order Placed' },
  { status: 'PROCESSING', label: 'Processing' },
  { status: 'SHIPPED',    label: 'Shipped' },
  { status: 'DELIVERED',  label: 'Delivered' },
];

// Map legacy labels to backend statuses
const STATUS_MAP: Record<string, string> = {
  'Order Placed': 'PENDING',
  'Packed':       'PROCESSING',
  'Shipped':      'SHIPPED',
  'Delivered':    'DELIVERED',
  'Cancelled':    'CANCELLED',
};

interface Props {
  currentStatus: string;
}

export const OrderTimeline: React.FC<Props> = ({ currentStatus }) => {
  // Normalize: accept both backend enum and legacy labels
  const normalizedStatus = STATUS_MAP[currentStatus] || currentStatus;
  const isCancelled = normalizedStatus === 'CANCELLED';

  const currentIndex = STEPS.findIndex(s => s.status === normalizedStatus);

  return (
    <div className="relative">
      {isCancelled ? (
        <div className="flex items-center gap-2 text-red-600">
          <XCircle className="h-5 w-5" />
          <span className="text-sm font-medium">Order Cancelled</span>
        </div>
      ) : (
        <div className="flex flex-col space-y-3">
          {STEPS.map((step, idx) => {
            const isCompleted = currentIndex >= idx;
            const isCurrent = currentIndex === idx;
            return (
              <div key={step.status} className="flex items-center gap-3">
                {isCompleted ? (
                  <CheckCircle className={`h-5 w-5 flex-shrink-0 ${isCurrent ? 'text-primary-600' : 'text-success'}`} />
                ) : (
                  <Circle className="h-5 w-5 text-gray-300 flex-shrink-0" />
                )}
                <span className={`text-sm ${isCompleted ? (isCurrent ? 'text-primary-600 font-semibold' : 'text-success font-medium') : 'text-gray-400'}`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
