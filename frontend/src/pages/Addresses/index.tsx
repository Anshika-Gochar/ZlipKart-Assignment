import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  fetchAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
} from '../../store/slices/addressSlice';
import { addressSchema, AddressData } from '../../schemas/checkout.schemas';
import { AppDispatch, RootState } from '../../store';
import { MapPin, Plus, Pencil, Trash2, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Addresses() {
  const dispatch = useDispatch<AppDispatch>();
  const { addresses, isLoading } = useSelector((state: RootState) => state.address);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddressData>({
    resolver: zodResolver(addressSchema),
  });

  useEffect(() => {
    dispatch(fetchAddresses());
  }, [dispatch]);

  const handleOpenAdd = () => {
    reset({});
    setEditingId(null);
    setShowForm(true);
  };

  const handleOpenEdit = (address: Record<string, unknown>) => {
    reset({
      fullName: (address.fullName as string) || '',
      street: (address.street as string) || '',
      city: (address.city as string) || '',
      state: (address.state as string) || '',
      pincode: (address.pincode as string) || '',
      landmark: (address.landmark as string) || '',
      phone: (address.phone as string) || '',
    });
    setEditingId(address.id as string);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this address?')) return;
    await dispatch(deleteAddress(id));
    toast.success('Address deleted');
  };

  const onSubmit = async (data: AddressData) => {
    try {
      if (editingId) {
        await dispatch(updateAddress({ id: editingId, data })).unwrap();
        toast.success('Address updated');
      } else {
        await dispatch(addAddress(data)).unwrap();
        toast.success('Address added');
      }
      setShowForm(false);
      reset({});
      setEditingId(null);
    } catch {
      toast.error('Failed to save address. Please try again.');
    }
  };

  const fieldClass = (hasError: boolean) =>
    `w-full px-3 py-2 border rounded-sm text-sm focus:outline-none focus:border-primary-600 transition-colors ${
      hasError ? 'border-red-400 bg-red-50' : 'border-gray-300'
    }`;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-medium text-[#212121]">Manage Addresses</h1>
        {!showForm && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 text-sm text-primary-600 border border-primary-600 rounded-sm px-4 py-2 hover:bg-blue-50 transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            Add New Address
          </button>
        )}
      </div>

      {/* Add / Edit Form */}
      {showForm && (
        <div className="bg-white border border-primary-600 rounded-sm p-5 mb-5 shadow-sm">
          <h2 className="text-sm font-medium text-[#212121] uppercase tracking-wide mb-4">
            {editingId ? 'Edit Address' : 'Add New Address'}
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Full Name *</label>
              <input {...register('fullName')} className={fieldClass(!!errors.fullName)} placeholder="John Doe" />
              {errors.fullName && <p className="mt-1 text-xs text-red-500">{errors.fullName.message}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Phone Number *</label>
              <input {...register('phone')} className={fieldClass(!!errors.phone)} placeholder="10-digit mobile number" />
              {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
            </div>

            {/* Street */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Street Address *</label>
              <input {...register('street')} className={fieldClass(!!errors.street)} placeholder="House No., Building, Street, Area" />
              {errors.street && <p className="mt-1 text-xs text-red-500">{errors.street.message}</p>}
            </div>

            {/* City */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">City *</label>
              <input {...register('city')} className={fieldClass(!!errors.city)} placeholder="City" />
              {errors.city && <p className="mt-1 text-xs text-red-500">{errors.city.message}</p>}
            </div>

            {/* State */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">State *</label>
              <input {...register('state')} className={fieldClass(!!errors.state)} placeholder="State" />
              {errors.state && <p className="mt-1 text-xs text-red-500">{errors.state.message}</p>}
            </div>

            {/* PIN Code */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">PIN Code *</label>
              <input {...register('pincode')} className={fieldClass(!!errors.pincode)} placeholder="6-digit PIN code" maxLength={6} />
              {errors.pincode && <p className="mt-1 text-xs text-red-500">{errors.pincode.message}</p>}
            </div>

            {/* Landmark */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Landmark <span className="text-gray-400">(optional)</span></label>
              <input {...register('landmark')} className={fieldClass(false)} placeholder="Near bus stop, mall, etc." />
            </div>

            {/* Actions */}
            <div className="sm:col-span-2 flex gap-3 mt-1">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-1.5 px-6 py-2 bg-primary-600 text-white text-sm font-medium rounded-sm hover:bg-primary-700 disabled:opacity-50 transition-colors uppercase tracking-wide"
              >
                <Check className="w-4 h-4" />
                {isSubmitting ? 'Saving…' : editingId ? 'Update Address' : 'Save Address'}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); reset({}); setEditingId(null); }}
                className="px-6 py-2 border border-gray-300 text-sm font-medium text-gray-600 rounded-sm hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="h-24 bg-gray-200 animate-pulse rounded-sm" />
          ))}
        </div>
      )}

      {/* Address Cards */}
      {!isLoading && addresses.length === 0 && !showForm && (
        <div className="text-center py-16">
          <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm mb-4">No saved addresses yet.</p>
          <button
            onClick={handleOpenAdd}
            className="text-sm text-primary-600 border border-primary-600 rounded-sm px-5 py-2 hover:bg-blue-50 transition-colors font-medium"
          >
            + Add your first address
          </button>
        </div>
      )}

      <div className="space-y-3">
        {addresses.map((addr: Record<string, unknown>) => (
          <div key={addr.id as string} className="bg-white border border-gray-200 rounded-sm p-4 hover:shadow-sm transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-[#212121]">
                    {addr.fullName as string}
                  </span>
                  <span className="text-xs text-white bg-gray-400 px-1.5 py-0.5 rounded-sm font-medium uppercase">
                    Home
                  </span>
                </div>
                <p className="text-sm text-[#878787]">
                  {addr.street as string}{addr.landmark ? `, ${addr.landmark}` : ''}, {addr.city as string}, {addr.state as string} — {addr.pincode as string}
                </p>
                {addr.phone && (
                  <p className="text-sm text-[#212121] mt-1 font-medium">📞 {addr.phone as string}</p>
                )}
              </div>
              <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                <button
                  onClick={() => handleOpenEdit(addr)}
                  className="flex items-center gap-1 text-xs text-primary-600 hover:underline font-medium"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  Edit
                </button>
                <span className="text-gray-300">|</span>
                <button
                  onClick={() => handleDelete(addr.id as string)}
                  className="flex items-center gap-1 text-xs text-red-500 hover:underline font-medium"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
