import { useEffect, useState, Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchProductsAsync } from '../../store/slices/productSlice';
import { productApi } from '../../api/productApi';
import type { Product } from '../../types/api.types';
import { ProductCard } from '../../components/shared/ProductCard';
import { ProductSkeleton } from '../../components/shared/ProductSkeleton';
import { RecentlyViewed } from '../../components/shared/RecentlyViewed';
import { ArrowRight, Smartphone, Shirt, Home as HomeIcon, Dumbbell, Baby, ShoppingBag, Sparkles, Package, BookOpen } from 'lucide-react';


// ── Category shortcuts (dense icon row) ─────────────────────
const CATEGORIES = [
  { label: 'Mobiles',    icon: Smartphone,  color: '#2874f0', bg: '#e8f0fe', q: 'mobile'      },
  { label: 'Fashion',   icon: Shirt,        color: '#e91e8c', bg: '#fce4ec', q: 'fashion'     },
  { label: 'Home',      icon: HomeIcon,     color: '#ff9f00', bg: '#fff8e1', q: 'home'        },
  { label: 'Sports',    icon: Dumbbell,     color: '#1da462', bg: '#e8f5e9', q: 'sports'      },
  { label: 'Toys',      icon: Baby,         color: '#ff6161', bg: '#ffeaea', q: 'toys'        },
  { label: 'Beauty',    icon: Sparkles,     color: '#9c27b0', bg: '#f3e5f5', q: 'beauty'      },
  { label: 'Grocery',   icon: ShoppingBag,  color: '#4caf50', bg: '#e8f5e9', q: 'grocery'     },
  { label: 'Books',     icon: BookOpen,     color: '#795548', bg: '#efebe9', q: 'books'       },
];

// ── Promotional offer strips ─────────────────────────────────
const PROMO_STRIPS = [
  {
    title: 'Electronics Sale',
    desc: 'Up to 80% off',
    sub: 'Mobiles, Laptops, Audio',
    bg: '#2874f0',
    q: 'electronics',
    emoji: '📱',
  },
  {
    title: 'Fashion Fest',
    desc: 'Min 50% off',
    sub: 'Top brands: Nike, Puma & more',
    bg: '#ff6161',
    q: 'fashion',
    emoji: '👟',
  },
  {
    title: 'Beauty Sale',
    desc: 'Flat 40% off',
    sub: 'Skincare, Makeup & Haircare',
    bg: '#e91e8c',
    q: 'beauty',
    emoji: '💄',
  },
];

// ── Horizontal top deals bar ─────────────────────────────────
const TOP_DEALS = [
  { label: 'Best Laptops',      q: 'laptop',   badge: '80% off' },
  { label: 'Running Shoes',     q: 'shoes',    badge: '60% off' },
  { label: 'Smart Watches',     q: 'watch',    badge: 'New'     },
  { label: 'Face Wash',         q: 'face wash',badge: 'Popular' },
  { label: 'Books',             q: 'books',    badge: 'Bestseller' },
  { label: 'Gym Equipment',     q: 'gym',      badge: 'Hot'     },
];

export default function Home() {
  const dispatch = useDispatch<AppDispatch>();
  const { products, status } = useSelector((state: RootState) => state.products);

  useEffect(() => {
    dispatch(fetchProductsAsync({ limit: 8, sortBy: 'newest' }));
  }, [dispatch]);

  return (
    <div className="bg-[#f1f3f6] min-h-screen">

      {/* ── Hero Carousel — same max-width container as all sections ── */}
      <div className="max-w-7xl mx-auto px-0 sm:px-2 lg:px-6 pt-2">
        <div className="overflow-hidden rounded-none sm:rounded-sm">
          <HeroCarouselSection />
        </div>
      </div>

      {/* ── Category icon row ─────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
        <div className="bg-white shadow-sm mt-0">
          <div className="grid grid-cols-4 sm:grid-cols-8">
            {CATEGORIES.map(({ label, icon: Icon, color, bg, q }) => (
              <Link
                key={label}
                to={`/products?search=${q}`}
                className="flex flex-col items-center py-4 px-2 hover:bg-gray-50 transition-colors group border-r border-gray-100 last:border-r-0"
              >
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-200"
                  style={{ backgroundColor: bg }}
                >
                  <Icon className="w-7 h-7" style={{ color }} strokeWidth={1.5} />
                </div>
                <span className="text-[11px] font-medium text-[#212121] text-center leading-tight">
                  {label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Quick deal chips strip ─────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 mt-2">
        <div className="bg-white shadow-sm px-4 py-2.5 flex items-center gap-2 overflow-x-auto hide-scrollbar">
          <span className="text-[12px] font-semibold text-[#212121] flex-shrink-0 mr-1">
            🔥 Trending:
          </span>
          {TOP_DEALS.map(({ label, q, badge }) => (
            <Link
              key={label}
              to={`/products?search=${encodeURIComponent(q)}`}
              className="flex-shrink-0 flex items-center gap-1.5 border border-gray-200 rounded-full px-3 py-1 text-[12px] text-[#333] hover:border-primary-600 hover:text-primary-600 transition-colors"
            >
              {label}
              <span className="text-[10px] font-semibold text-[#ff6161] bg-red-50 px-1.5 py-0.5 rounded-full">
                {badge}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Promo banner strip (3 cards) ──────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 mt-2">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {PROMO_STRIPS.map(({ title, desc, sub, bg, q, emoji }) => (
            <Link
              key={q}
              to={`/products?search=${q}`}
              className="flex items-center gap-4 p-4 rounded-sm shadow-sm hover:opacity-95 transition-opacity"
              style={{ backgroundColor: bg }}
            >
              <span className="text-4xl flex-shrink-0">{emoji}</span>
              <div>
                <p className="text-white text-[11px] font-semibold uppercase tracking-widest opacity-80">
                  {title}
                </p>
                <p className="text-white text-[22px] font-bold leading-tight">{desc}</p>
                <p className="text-white/80 text-[12px] mt-0.5">{sub}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-white ml-auto flex-shrink-0" />
            </Link>
          ))}
        </div>
      </div>

      {/* ── Latest Arrivals section ───────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 mt-2">
        {/* Section header */}
        <div className="bg-white px-4 py-3 flex justify-between items-center shadow-sm border-b border-gray-100">
          <div>
            <h2 className="text-[16px] font-semibold text-[#212121]">Latest Arrivals</h2>
            <p className="text-[12px] text-[#878787]">New products added this week</p>
          </div>
          <Link
            to="/products?sortBy=newest"
            className="flex items-center text-[13px] text-white bg-primary-600 hover:bg-primary-700 px-4 py-1.5 rounded-sm font-medium transition-colors"
          >
            View All <ArrowRight className="w-3.5 h-3.5 ml-1" />
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

        {/* Mobile view all */}
        <div className="mt-2 sm:hidden">
          <Link
            to="/products"
            className="block w-full text-center border border-primary-600 text-primary-600 text-[13px] font-medium py-2.5 bg-white hover:bg-blue-50 transition-colors"
          >
            View All Products
          </Link>
        </div>
      </div>

      {/* ── Second product row: Top Rated ─────────────────────────────────── */}
      <TopRatedSection dispatch={dispatch} />

      {/* ── Recently Viewed Products ────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 mt-2">
        <RecentlyViewed />
      </div>

      {/* ── Service guarantees strip ──────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 mt-2 mb-4">
        <div className="bg-white shadow-sm">
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-gray-100">
            {[
              { emoji: '🚚', title: 'Free Delivery',      desc: 'On orders above ₹499' },
              { emoji: '🔄', title: 'Easy Returns',       desc: '10-day hassle-free returns' },
              { emoji: '🔒', title: 'Secure Payment',     desc: '100% encrypted transactions' },
              { emoji: '🎧', title: '24/7 Support',       desc: 'Dedicated customer care' },
            ].map(({ emoji, title, desc }) => (
              <div key={title} className="flex items-center gap-3 px-4 py-4">
                <span className="text-2xl flex-shrink-0">{emoji}</span>
                <div>
                  <p className="text-[13px] font-semibold text-[#212121]">{title}</p>
                  <p className="text-[11px] text-[#878787]">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}

// ── Hero Carousel section (lazy component wrapper) ────────────
const LazyHeroCarousel = lazy(() =>
  import('../../components/shared/HeroCarousel').then(m => ({ default: m.HeroCarousel }))
);

function HeroCarouselSection() {
  return (
    <Suspense fallback={
      <div className="w-full bg-[#2874f0] h-[240px] sm:h-[300px] flex items-center justify-center">
        <div className="text-white/60 text-sm animate-pulse">Loading...</div>
      </div>
    }>
      <LazyHeroCarousel />
    </Suspense>
  );
}


// ── Top Rated section (separate data fetch) ───────────────────
function TopRatedSection({ dispatch: _dispatch }: { dispatch: AppDispatch }) {
  const [topProducts, setTopProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productApi.getAll({ sortBy: 'rating', limit: 4 })
      .then(res => {
        setTopProducts(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 mt-2">
      <div className="bg-white px-4 py-3 flex justify-between items-center shadow-sm border-b border-gray-100">
        <div>
          <h2 className="text-[16px] font-semibold text-[#212121]">Top Rated Products</h2>
          <p className="text-[12px] text-[#878787]">Loved by our customers</p>
        </div>
        <Link
          to="/products?sortBy=rating"
          className="flex items-center text-[13px] text-primary-600 font-medium hover:underline"
        >
          See All <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </Link>
      </div>
      <div className="bg-white shadow-sm">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y divide-gray-100">
            {[...Array(4)].map((_, i) => <ProductSkeleton key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y divide-gray-100">
            {topProducts.map(product => (
              <div key={product.id} className="hover:shadow-[0_0_10px_rgba(0,0,0,0.1)] hover:z-10 relative bg-white transition-shadow">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
