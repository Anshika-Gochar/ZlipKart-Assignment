import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchProductByIdAsync, clearCurrentProduct } from '../../store/slices/productSlice';
import { fetchCart } from '../../store/slices/cartSlice';
import { fetchWishlist, addToWishlist, removeFromWishlist } from '../../store/slices/wishlistSlice';
import { cartApi } from '../../api/cartApi';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatCurrency } from '../../utils/formatCurrency';
import { Heart, Star, Truck, ShieldCheck, ArrowLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { SimilarProducts } from '../../components/shared/SimilarProducts';
import { useRecentlyViewed } from '../../hooks/useRecentlyViewed';
import { ProductImage } from '../../components/shared/ProductImage';


export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { currentProduct, currentProductStatus, error } = useSelector((state: RootState) => state.products);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items);
  const isWishlisted = wishlistItems.some(w => w.id === currentProduct?.id);

  const [activeImage, setActiveImage] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const [togglingWishlist, setTogglingWishlist] = useState(false);

  const { addToRecentlyViewed } = useRecentlyViewed();

  useEffect(() => {
    if (id) {
      dispatch(fetchProductByIdAsync(id));
    }
    return () => {
      dispatch(clearCurrentProduct());
    };
  }, [id, dispatch]);

  // Track recently viewed when product loads successfully
  useEffect(() => {
    if (currentProduct) {
      addToRecentlyViewed(currentProduct);
    }
  }, [currentProduct?.id]); // Only re-run when product ID changes

  // Fetch wishlist so isWishlisted is accurate
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchWishlist());
    }
  }, [isAuthenticated, dispatch]);

  if (currentProductStatus === 'loading') {
    return <div className="min-h-[60vh] flex items-center justify-center"><Spinner className="w-12 h-12" /></div>;
  }

  if (currentProductStatus === 'failed' || !currentProduct) {
    return (
      <div className="container mx-auto px-4 py-16">
        <EmptyState
          title="Product not found"
          description={error || "The product you're looking for doesn't exist or has been removed."}
          action={<Link to="/products"><Button>Back to Products</Button></Link>}
        />
      </div>
    );
  }

  const hasDiscount = currentProduct.discountPrice < currentProduct.price;
  const discountPercentage = hasDiscount
    ? Math.round(((currentProduct.price - currentProduct.discountPrice) / currentProduct.price) * 100)
    : 0;

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to add items to cart');
      navigate('/auth/login');
      return;
    }
    setAddingToCart(true);
    try {
      await cartApi.addItem({ productId: currentProduct.id, quantity: 1 });
      await dispatch(fetchCart());
      toast.success('Added to cart!');
    } catch {
      toast.error('Failed to add to cart. Please try again.');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    navigate('/cart');
  };

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to use wishlist');
      navigate('/auth/login');
      return;
    }
    setTogglingWishlist(true);
    try {
      if (isWishlisted) {
        const result = await dispatch(removeFromWishlist(currentProduct.id));
        if (removeFromWishlist.fulfilled.match(result)) {
          toast.success('Removed from wishlist');
        } else {
          toast.error((result.payload as string) || 'Failed to remove from wishlist');
        }
      } else {
        const result = await dispatch(addToWishlist(currentProduct.id));
        if (addToWishlist.fulfilled.match(result)) {
          toast.success('Added to wishlist!');
        } else {
          toast.error((result.payload as string) || 'Failed to add to wishlist');
        }
      }
    } catch {
      toast.error('Failed to update wishlist');
    } finally {
      setTogglingWishlist(false);
    }
  };

  return (
    <div className="bg-[#f1f3f6] min-h-screen pb-16">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-4">

        {/* Breadcrumb */}
        <nav className="flex items-center text-xs text-[#878787] mb-4 bg-white px-4 py-2 rounded-sm shadow-[0_1px_4px_0_rgba(0,0,0,0.1)]">
          <Link to="/" className="hover:text-primary-600">Home</Link>
          <ChevronRight className="w-3 h-3 mx-1" />
          <Link to="/products" className="hover:text-primary-600">Products</Link>
          {currentProduct.category && (
            <>
              <ChevronRight className="w-3 h-3 mx-1" />
              <Link
                to={`/products?categoryId=${currentProduct.categoryId}`}
                className="hover:text-primary-600"
              >
                {currentProduct.category.name}
              </Link>
            </>
          )}
          <ChevronRight className="w-3 h-3 mx-1" />
          <span className="text-[#212121] truncate max-w-[200px]">{currentProduct.name}</span>
        </nav>

        <div className="bg-white shadow-[0_1px_4px_0_rgba(0,0,0,0.1)] rounded-sm">
          <div className="lg:grid lg:grid-cols-2 lg:gap-0">

            {/* ── LEFT: Image Gallery ── */}
            <div className="flex flex-col-reverse lg:flex-row gap-4 p-6 lg:border-r border-gray-100">
              {/* Thumbnail Column */}
              <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto lg:w-20 custom-scrollbar flex-shrink-0">
                {currentProduct.imageUrls.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`relative flex-shrink-0 w-16 h-16 lg:w-20 lg:h-20 rounded-sm overflow-hidden border-2 transition-colors ${
                      activeImage === idx ? 'border-primary-600' : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-contain p-1" />
                  </button>
                ))}
              </div>

              {/* Main Image */}
              <div className="flex-1 relative bg-white flex items-center justify-center min-h-[300px] sm:min-h-[400px]">
                <ProductImage
                  src={currentProduct.imageUrls[activeImage]}
                  alt={currentProduct.name}
                  containerClassName="w-full h-[380px] sm:h-[420px]"
                  fit="contain"
                />
                {/* Wishlist Heart */}
                <button
                  onClick={handleToggleWishlist}
                  disabled={togglingWishlist}
                  className="absolute top-3 right-3 p-2 rounded-full bg-white shadow-sm border border-gray-100 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                  aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <Heart
                    className="w-5 h-5"
                    fill={isWishlisted ? '#ff6161' : 'none'}
                    color={isWishlisted ? '#ff6161' : 'currentColor'}
                  />
                </button>
              </div>
            </div>

            {/* ── RIGHT: Product Info ── */}
            <div className="p-6 flex flex-col">
              {/* Brand */}
              {currentProduct.brand && (
                <p className="text-sm text-[#878787] font-medium mb-1">{currentProduct.brand}</p>
              )}

              {/* Name */}
              <h1 className="text-xl sm:text-2xl font-medium text-[#212121] mb-3 leading-snug">
                {currentProduct.name}
              </h1>

              {/* Rating Row */}
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                <div className="flex items-center bg-success text-white px-2 py-0.5 rounded text-sm font-bold">
                  {Number(currentProduct.rating).toFixed(1)}
                  <Star className="w-3.5 h-3.5 ml-1 fill-current" />
                </div>
                <span className="text-sm text-[#878787]">
                  {currentProduct.reviewCount.toLocaleString()} Ratings &amp; Reviews
                </span>
              </div>

              <div className="pt-2">
                <div className="flex items-end gap-3 flex-wrap">
                  <span className="text-3xl font-medium text-[#212121]">
                    {formatCurrency(currentProduct.discountPrice)}
                  </span>
                  {hasDiscount && (
                    <>
                      <span className="text-lg text-[#878787] line-through">
                        {formatCurrency(currentProduct.price)}
                      </span>
                      <span className="text-lg font-medium text-success">
                        {discountPercentage}% off
                      </span>
                    </>
                  )}
                </div>
                <p className="text-xs text-[#878787] mt-1">Inclusive of all taxes</p>
              </div>

              {/* Delivery + Stock */}
              <div className="flex items-center gap-2 mb-5 text-sm">
                <Truck className="w-4 h-4 text-primary-600 flex-shrink-0" />
                <span className="text-[#212121]">Free Delivery</span>
                <span className="text-[#878787] ml-2">
                  {currentProduct.stock > 0
                    ? <span className="text-success font-medium">In Stock ({currentProduct.stock} available)</span>
                    : <span className="text-[#ff6161] font-medium">Out of Stock</span>
                  }
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <Button
                  size="lg"
                  variant="outline"
                  className="flex-1 py-3.5 text-sm border-2 border-secondary bg-white text-[#212121] hover:bg-secondary/10"
                  onClick={handleAddToCart}
                  disabled={currentProduct.stock <= 0 || addingToCart}
                  isLoading={addingToCart}
                >
                  🛒 {currentProduct.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                </Button>
                <Button
                  size="lg"
                  variant="secondary"
                  className="flex-1 py-3.5 text-sm"
                  onClick={handleBuyNow}
                  disabled={currentProduct.stock <= 0 || addingToCart}
                >
                  ⚡ Buy Now
                </Button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-3 mb-6 pb-6 border-b border-gray-100">
                <div className="flex items-center gap-2 text-xs text-[#212121]">
                  <ShieldCheck className="w-5 h-5 text-primary-600 flex-shrink-0" />
                  <span>1 Year Warranty</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#212121]">
                  <Truck className="w-5 h-5 text-primary-600 flex-shrink-0" />
                  <span>7-Day Replacement</span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-sm font-medium text-[#212121] uppercase tracking-wide mb-3">
                  Product Description
                </h3>
                <p className="text-sm text-[#878787] leading-relaxed">
                  {currentProduct.description}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Similar Products ── */}
        <SimilarProducts
          productId={currentProduct.id}
          categoryName={currentProduct.category?.name}
        />

        {/* Back link */}
        <div className="mt-4">
          <Link to="/products" className="flex items-center text-sm text-primary-600 hover:underline">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Products
          </Link>
        </div>
      </div>
    </div>
  );
}
