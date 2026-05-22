import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchProductsAsync } from '../../store/slices/productSlice';
import { ProductCard } from '../../components/shared/ProductCard';
import { ProductSkeleton } from '../../components/shared/ProductSkeleton';
import { ArrowRight, Smartphone, Shirt, Home as HomeIcon, Tv, Dumbbell, Baby, ShoppingBag, Sparkles, Package, Zap, Shield, Headphones } from 'lucide-react';

// ── Category Shortcuts ─────────────────────────────────────────────────────
const CATEGORIES = [
  { label: 'Electronics',  icon: Smartphone,  color: 'bg-blue-50',   text: 'text-blue-600',   q: 'electronics' },
  { label: 'Fashion',      icon: Shirt,        color: 'bg-pink-50',   text: 'text-pink-600',   q: 'fashion' },
  { label: 'Home',         icon: HomeIcon,     color: 'bg-amber-50',  text: 'text-amber-600',  q: 'home' },
  { label: 'Appliances',   icon: Tv,           color: 'bg-purple-50', text: 'text-purple-600', q: 'appliances' },
  { label: 'Sports',       icon: Dumbbell,     color: 'bg-green-50',  text: 'text-green-600',  q: 'sports' },
  { label: 'Toys',         icon: Baby,         color: 'bg-red-50',    text: 'text-red-500',    q: 'toys' },
  { label: 'Beauty',       icon: Sparkles,     color: 'bg-fuchsia-50',text: 'text-fuchsia-600',q: 'beauty' },
  { label: 'Grocery',      icon: ShoppingBag,  color: 'bg-lime-50',   text: 'text-lime-700',   q: 'grocery' },
];

// ── Deal banners ───────────────────────────────────────────────────────────
const DEALS = [
  { title: 'Up to 80% off',   subtitle: 'Electronics Sale',  bg: 'from-blue-600 to-blue-500',   q: 'electronics' },
  { title: '50% off & more',  subtitle: 'Fashion Fest',       bg: 'from-pink-500 to-rose-500',   q: 'fashion' },
  { title: 'Buy 2 Get 1',     subtitle: 'Home & Kitchen',     bg: 'from-amber-500 to-orange-500',q: 'home' },
];

export default function Home() {
  const dispatch = useDispatch<AppDispatch>();
  const { products, status } = useSelector((state: RootState) => state.products);

  useEffect(() => {
    dispatch(fetchProductsAsync({ limit: 8, sortBy: 'newest' }));
  }, [dispatch]);

  return (
    <div className="flex flex-col">

      {/* ── Hero Banner ───────────────────────────────────────────────────── */}
      <section style={{ background: 'linear-gradient(135deg, #2874f0 0%, #1a65d6 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-center">
          <p className="text-blue-200 text-sm font-medium uppercase tracking-widest mb-2">
            India's Biggest Sale
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
            Millions of Products.<br className="hidden sm:block" />
            One Destination.
          </h1>
          <p className="text-blue-100 text-base md:text-lg max-w-xl mx-auto mb-8">
            Discover premium products, seamless checkout, and lightning-fast delivery.
          </p>
          <Link
            to="/products"
            className="inline-block bg-[#fb641b] hover:bg-[#e85510] text-white font-semibold px-10 py-3 rounded-sm text-sm tracking-widest uppercase transition-colors shadow-lg"
          >
            Shop Now
          </Link>
        </div>
      </section>

      {/* ── Category Shortcuts ────────────────────────────────────────────── */}
      <section className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 sm:gap-4">
            {CATEGORIES.map(({ label, icon: Icon, color, text, q }) => (
              <Link
                key={label}
                to={`/products?search=${q}`}
                className="flex flex-col items-center gap-2 p-2 sm:p-3 rounded-lg hover:shadow-md transition-all group"
              >
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full ${color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-6 h-6 sm:w-7 sm:h-7 ${text}`} strokeWidth={1.5} />
                </div>
                <span className="text-[11px] sm:text-xs font-medium text-[#212121] text-center leading-tight">
                  {label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Deal Banners ──────────────────────────────────────────────────── */}
      <section className="bg-[#f1f3f6] py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {DEALS.map(({ title, subtitle, bg, q }) => (
              <Link
                key={q}
                to={`/products?search=${q}`}
                className={`relative overflow-hidden rounded-sm bg-gradient-to-r ${bg} p-5 flex flex-col justify-between min-h-[100px] hover:opacity-95 transition-opacity shadow-sm`}
              >
                <div>
                  <p className="text-white text-xs font-medium uppercase tracking-widest opacity-80 mb-1">
                    {subtitle}
                  </p>
                  <p className="text-white text-2xl font-bold leading-tight">{title}</p>
                </div>
                <div className="flex items-center mt-3 text-white text-xs font-semibold">
                  Shop Now <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
                {/* Decorative circle */}
                <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/10" />
                <div className="absolute -right-2 -bottom-4 w-16 h-16 rounded-full bg-white/10" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Latest Arrivals ───────────────────────────────────────────────── */}
      <section className="bg-[#f1f3f6] py-6 flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="bg-white px-5 py-3 flex justify-between items-center rounded-sm shadow-sm mb-0.5">
            <h2 className="text-base font-semibold text-[#212121]">Latest Arrivals</h2>
            <Link
              to="/products?sortBy=newest"
              className="flex items-center text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
            >
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          {/* Product grid */}
          <div className="bg-white shadow-sm">
            {status === 'loading' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 divide-x divide-y divide-gray-100">
                {[...Array(8)].map((_, i) => <ProductSkeleton key={i} />)}
              </div>
            ) : status === 'failed' ? (
              <div className="text-center py-16">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500 mb-4">Failed to load products</p>
                <button
                  onClick={() => dispatch(fetchProductsAsync({ limit: 8, sortBy: 'newest' }))}
                  className="text-sm text-primary-600 border border-primary-600 rounded-sm px-5 py-2 hover:bg-blue-50"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 divide-x divide-y divide-gray-100">
                {products.slice(0, 8).map(product => (
                  <div key={product.id} className="hover:shadow-[0_0_10px_rgba(0,0,0,0.1)] hover:z-10 relative bg-white transition-shadow">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Mobile "View All" button */}
          <div className="mt-4 text-center sm:hidden">
            <Link
              to="/products"
              className="inline-block w-full border border-primary-600 text-primary-600 text-sm font-medium py-2.5 rounded-sm hover:bg-blue-50 transition-colors"
            >
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* ── Features Strip ────────────────────────────────────────────────── */}
      <section className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            {[
              { Icon: Zap,        title: 'Lightning Fast Delivery',  desc: 'Delivered within 24 hours in select cities.' },
              { Icon: Shield,     title: '100% Secure Payments',     desc: 'Bank-level security on every transaction.' },
              { Icon: Headphones, title: '24/7 Customer Support',    desc: 'Our team is here to help, anytime.' },
            ].map(({ Icon, title, desc }) => (
              <div key={title} className="flex flex-col items-center p-4">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-3">
                  <Icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="text-sm font-semibold text-[#212121] mb-1">{title}</h3>
                <p className="text-xs text-[#878787]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
