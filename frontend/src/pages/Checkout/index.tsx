import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchAddresses, selectAddress } from '../../store/slices/addressSlice';
import { placeOrder } from '../../store/slices/checkoutSlice';
import { fetchCart } from '../../store/slices/cartSlice';
import PriceSummaryCard from '../../components/ui/PriceSummaryCard';
import AddressCard from '../../components/shared/AddressCard';
import CheckoutSection from '../../components/ui/CheckoutSection';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ShoppingBag, Plus, ChevronRight, Truck } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';

const CheckoutPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { cart, isLoading: cartLoading } = useSelector((state: RootState) => state.cart);
  const { addresses, selectedId, isLoading: addressLoading } = useSelector((state: RootState) => state.address);
  const { isLoading: placing } = useSelector((state: RootState) => state.checkout);

  const [selectedAddressId, setSelectedAddressId] = useState<string | undefined>(selectedId);

  useEffect(() => {
    dispatch(fetchAddresses());
    // Ensure cart is loaded
    if (!cart) dispatch(fetchCart());
  }, [dispatch]);

  useEffect(() => {
    if (selectedId) setSelectedAddressId(selectedId);
  }, [selectedId]);

  const handleAddressSelect = (id: string) => {
    setSelectedAddressId(id);
    dispatch(selectAddress(id));
  };

  const handlePlaceOrder = (payload: { addressId: string; paymentMethod: 'COD' | 'UPI' | 'CARD' | 'NET_BANKING' | 'WALLET' }) => {
    if (!cart) return;
    const orderData = {
      addressId: payload.addressId,
      paymentMethod: payload.paymentMethod,
    };
    dispatch(placeOrder(orderData))
      .unwrap()
      .then(res => {
        toast.success('Order placed successfully! 🎉');
        navigate('/order-success', { state: { orderId: res.orderId } });
      })
      .catch(err => {
        toast.error(err || 'Failed to place order. Please try again.');
      });
  };


  if (cartLoading || addressLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-3">
          {[1, 2].map(i => <div key={i} className="h-24 bg-gray-200 animate-pulse rounded-sm" />)}
        </div>
        <div className="lg:col-span-1 space-y-3">
          <div className="h-40 bg-gray-200 animate-pulse rounded-sm" />
          <div className="h-32 bg-gray-200 animate-pulse rounded-sm" />
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" strokeWidth={1} />
        <h2 className="text-lg font-medium text-[#212121] mb-2">Your cart is empty</h2>
        <Link to="/" className="text-sm text-primary-600 hover:underline">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center text-xs text-[#878787] mb-4">
        <Link to="/cart" className="hover:text-primary-600">Cart</Link>
        <ChevronRight className="w-3 h-3 mx-1" />
        <span className="text-[#212121]">Checkout</span>
      </nav>

      <div className="grid gap-4 lg:grid-cols-3 items-start">
        {/* LEFT: Address + Payment */}
        <section className="lg:col-span-2 space-y-4">
          {/* Delivery Address */}
          <div className="bg-white border border-gray-200 rounded-sm shadow-sm">
            <div className="px-5 py-3 border-b border-gray-100 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-primary-600" />
                <h2 className="text-sm font-medium text-[#212121] uppercase tracking-wide">
                  Delivery Address
                </h2>
              </div>
              <Link
                to="/addresses"
                className="flex items-center gap-1 text-xs text-primary-600 hover:underline font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                Add New
              </Link>
            </div>

            <div className="p-4 space-y-2">
              {addresses.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-sm text-[#878787] mb-3">No saved addresses.</p>
                  <Link
                    to="/addresses"
                    className="text-sm text-primary-600 border border-primary-600 px-4 py-1.5 rounded-sm hover:bg-blue-50 transition-colors font-medium"
                  >
                    + Add Address
                  </Link>
                </div>
              ) : (
                addresses.map(addr => (
                  <AddressCard
                    key={addr.id}
                    address={addr}
                    selected={selectedAddressId === addr.id}
                    onSelect={handleAddressSelect}
                    onEdit={() => navigate('/addresses')}
                    onDelete={() => navigate('/addresses')}
                  />
                ))
              )}
            </div>
          </div>

          {/* Order Items (read-only) */}
          <div className="bg-white border border-gray-200 rounded-sm shadow-sm">
            <div className="px-5 py-3 border-b border-gray-100">
              <h2 className="text-sm font-medium text-[#212121] uppercase tracking-wide">
                Order Items ({cart.items.length})
              </h2>
            </div>
            <div className="divide-y divide-gray-100">
              {cart.items.map(item => {
                const product = item.product;
                if (!product) return null;
                return (
                  <div key={item.id} className="flex items-center gap-3 p-4">
                    <div className="w-14 h-14 flex-shrink-0 bg-gray-50 rounded-sm flex items-center justify-center">
                      <img
                        src={product.imageUrls[0]}
                        alt={product.name}
                        className="max-w-full max-h-full object-contain p-1"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#212121] line-clamp-1">{product.name}</p>
                      <p className="text-xs text-[#878787] mt-0.5">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-sm font-medium text-[#212121] flex-shrink-0">
                      {formatCurrency(product.discountPrice * item.quantity)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* RIGHT: Summary + Payment — sticky */}
        <aside className="lg:col-span-1 space-y-3 sticky top-20">
          <PriceSummaryCard cart={cart} />
          <CheckoutSection
            selectedAddressId={selectedAddressId}
            onPlaceOrder={handlePlaceOrder}
            isPlacing={placing}
          />
        </aside>
      </div>
    </div>
  );
};

export default CheckoutPage;
