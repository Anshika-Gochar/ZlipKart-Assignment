import React from 'react';
import { Check } from 'lucide-react';

interface AddressCardProps {
  address: Record<string, unknown>;
  selected: boolean;
  onSelect: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const AddressCard: React.FC<AddressCardProps> = ({ address, selected, onSelect, onEdit, onDelete }) => {
  // Backend returns: fullName, phone, street, city, state, pincode, landmark
  const id = address.id as string;
  const fullName = (address.fullName as string) || '';
  const street = (address.street as string) || '';
  const city = (address.city as string) || '';
  const state = (address.state as string) || '';
  const pincode = (address.pincode as string) || '';
  const phone = (address.phone as string) || '';
  const landmark = (address.landmark as string) || '';

  return (
    <div
      className={`border rounded-sm p-4 cursor-pointer transition-all hover:shadow-sm ${
        selected ? 'border-primary-600 bg-blue-50/30' : 'border-gray-200 bg-white'
      }`}
      onClick={() => onSelect(id)}
    >
      <div className="flex justify-between items-start gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Selection indicator */}
          <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
            selected ? 'border-primary-600 bg-primary-600' : 'border-gray-300'
          }`}>
            {selected && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <p className="text-sm font-medium text-[#212121]">{fullName}</p>
              <span className="text-[10px] text-white bg-gray-400 px-1.5 py-0.5 rounded-sm font-medium uppercase tracking-wide">
                Home
              </span>
            </div>
            <p className="text-sm text-[#878787] leading-relaxed">
              {street}{landmark ? `, ${landmark}` : ''}, {city}, {state} — {pincode}
            </p>
            {phone && (
              <p className="text-sm text-[#212121] mt-1 font-medium">📞 {phone}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(id); }}
            className="text-xs text-primary-600 hover:underline font-medium"
          >
            Edit
          </button>
          <span className="text-gray-300">|</span>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(id); }}
            className="text-xs text-red-500 hover:underline font-medium"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddressCard;
