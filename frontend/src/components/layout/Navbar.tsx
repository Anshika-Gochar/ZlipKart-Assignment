import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ShoppingCart, User, Search, Store, Heart, Menu, X, TrendingUp } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { useSelector } from 'react-redux';
import { selectWishlistCount } from '../../store/slices/wishlistSlice';
import { useState, useRef, useEffect, useCallback } from 'react';

// ── Static trending searches ───────────────────────────────────
const TRENDING = [
  'iPhone 15', 'Running Shoes', 'Smart Watch', 'Wireless Earbuds',
  'Laptop', 'Face Wash', 'Gaming Chair', 'Yoga Mat',
];

// ── Static suggestion seed (keyword → display) ────────────────
// Lightweight approach: no API call, pure substring match on these seeds
const SUGGESTION_SEEDS = [
  'Apple iPhone 15 Pro Max', 'Samsung Galaxy S24', 'OnePlus 12',
  'Sony WH-1000XM5', 'boAt Rockerz 550', 'Apple AirPods Pro',
  'Apple MacBook Pro', 'Dell XPS 15', 'ASUS ROG Zephyrus',
  'Nike Air Force 1', 'Puma Running Shoes', 'Adidas Ultraboost',
  'Levi\'s Men\'s Jeans', 'Biba Kurta Set', 'Zara Floral Dress',
  'Dyson Airwrap', 'MAC Lipstick', 'Plum Face Wash', 'L\'Oreal Serum',
  'Wakefit Mattress', 'Milton Water Bottle', 'Philips Mixer',
  'Decathlon Dumbbell', 'Boldfit Yoga Mat', 'Optimum Nutrition Whey',
  'LEGO Classic Set', 'Funskool Monopoly', 'Monopoly Board Game',
  'Atomic Habits Book', 'Deep Work Cal Newport', 'Psychology of Money',
  'Maggi Noodles', 'Tata Salt', 'Aashirvaad Atta',
  'Samsung Double Door Fridge', 'Laptop Bag', 'Gaming Laptop',
];

function getSuggestions(query: string): string[] {
  if (!query.trim()) return [];
  const lower = query.toLowerCase();
  return SUGGESTION_SEEDS
    .filter(s => s.toLowerCase().includes(lower))
    .slice(0, 6);
}

export const Navbar = () => {
  const { isAuthenticated } = useAuth();
  const { itemCount } = useCart();
  const wishlistCount = useSelector(selectWishlistCount);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Sync search input from URL (back/forward navigation)
  useEffect(() => {
    const urlSearch = searchParams.get('search') || '';
    setSearchQuery(urlSearch);
  }, [searchParams]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const doSearch = useCallback((query: string) => {
    setShowDropdown(false);
    if (query.trim()) {
      navigate(`/products?search=${encodeURIComponent(query.trim())}`);
    } else {
      navigate('/products');
    }
  }, [navigate]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    setSuggestions(getSuggestions(val));
    setShowDropdown(true);

    // Debounced auto-navigate
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (val.trim()) navigate(`/products?search=${encodeURIComponent(val.trim())}`);
      else navigate('/products');
    }, 450);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    doSearch(searchQuery);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    doSearch(suggestion);
  };

  // ── Suggestions + Trending dropdown ─────────────────────────
  const SearchDropdown = () => {
    const showTrending = !searchQuery.trim();
    const showSuggestions = searchQuery.trim() && suggestions.length > 0;

    if (!showDropdown) return null;
    if (!showTrending && !showSuggestions) return null;

    return (
      <div className="absolute top-full left-0 right-0 mt-0 bg-white shadow-xl border border-gray-200 z-[9999] rounded-b-sm">
        {showTrending ? (
          <div className="py-2">
            <div className="flex items-center gap-1.5 px-4 py-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-[#878787]" />
              <span className="text-[11px] font-semibold text-[#878787] uppercase tracking-widest">
                Trending Searches
              </span>
            </div>
            {TRENDING.map(term => (
              <button
                key={term}
                onMouseDown={() => handleSuggestionClick(term)}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-left transition-colors"
              >
                <TrendingUp className="w-4 h-4 text-[#fb641b] flex-shrink-0" />
                <span className="text-[13px] text-[#212121]">{term}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="py-2">
            <div className="flex items-center gap-1.5 px-4 py-1.5">
              <Search className="w-3.5 h-3.5 text-[#878787]" />
              <span className="text-[11px] font-semibold text-[#878787] uppercase tracking-widest">
                Suggestions
              </span>
            </div>
            {suggestions.map(s => (
              <button
                key={s}
                onMouseDown={() => handleSuggestionClick(s)}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-left transition-colors"
              >
                <Search className="w-4 h-4 text-[#878787] flex-shrink-0" />
                <span className="text-[13px] text-[#212121]">
                  {/* Bold the matched portion */}
                  {highlightMatch(s, searchQuery)}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <header className="bg-primary-600 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">

            {/* Logo */}
            <div className="flex items-center flex-shrink-0 w-32">
              <Link to="/" className="flex flex-col items-start">
                <span className="text-[22px] font-bold text-white tracking-tight leading-none italic">
                  ZlipKart
                </span>
                <span className="text-[10px] text-white/90 italic mt-0.5 flex items-center">
                  Explore <span className="text-secondary font-bold ml-1">Plus</span>
                </span>
              </Link>
            </div>

            {/* Search Bar — hidden on mobile */}
            <div className="hidden sm:flex flex-1 max-w-2xl px-4 lg:px-8 items-center justify-center">
              <div ref={searchRef} className="w-full relative">
                <form onSubmit={handleSearchSubmit} className="w-full relative shadow-sm">
                  <input
                    id="navbar-search"
                    name="search"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onFocus={() => setShowDropdown(true)}
                    className="block w-full pl-4 pr-10 py-2 border-none rounded-sm leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-0 text-sm h-9"
                    placeholder="Search for products, brands and more"
                    type="search"
                    autoComplete="off"
                  />
                  <button
                    type="submit"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-primary-600 hover:text-primary-700"
                    aria-label="Search"
                  >
                    <Search className="h-5 w-5" />
                  </button>
                </form>
                <SearchDropdown />
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center space-x-4 lg:space-x-6 flex-shrink-0">
              {isAuthenticated ? (
                <div className="hidden sm:flex items-center text-white space-x-5 font-medium text-sm">
                  <Link to="/profile" className="flex items-center hover:text-white/80">
                    <User className="h-4 w-4 mr-1.5" />
                    Profile
                  </Link>
                  <Link to="/wishlist" className="flex items-center hover:text-white/80 relative">
                    <Heart className="h-4 w-4 mr-1.5" />
                    Wishlist
                    {wishlistCount > 0 && (
                      <span className="absolute -top-1.5 left-5 inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-[#ff6161] border-2 border-primary-600 rounded-full">
                        {wishlistCount > 9 ? '9+' : wishlistCount}
                      </span>
                    )}
                  </Link>
                </div>
              ) : (
                <Link
                  to="/auth/login"
                  className="hidden sm:block bg-white text-primary-600 px-8 py-1 rounded-sm font-medium text-sm hover:bg-gray-50 transition-colors"
                >
                  Login
                </Link>
              )}

              <Link to="/seller" className="hidden lg:flex items-center text-white font-medium text-sm hover:text-white/80">
                <Store className="h-4 w-4 mr-1.5" />
                Become a Seller
              </Link>

              {/* Cart */}
              <Link to="/cart" className="flex items-center text-white font-medium text-sm hover:text-white/80 relative">
                <ShoppingCart className="h-5 w-5 mr-1.5" />
                <span className="hidden sm:inline">Cart</span>
                {itemCount > 0 && (
                  <span className="absolute -top-1.5 left-2.5 inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-[#fb641b] border-2 border-primary-600 rounded-full">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </Link>

              {/* Mobile hamburger */}
              <button
                className="sm:hidden text-white p-1"
                onClick={() => setMobileMenuOpen(v => !v)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Mobile search bar */}
          <div className="sm:hidden pb-2">
            <form onSubmit={handleSearchSubmit} className="w-full relative shadow-sm">
              <input
                id="navbar-search-mobile"
                value={searchQuery}
                onChange={handleSearchChange}
                className="block w-full pl-4 pr-10 py-2 border-none rounded-sm leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-0 text-sm h-9"
                placeholder="Search products, brands..."
                type="search"
                autoComplete="off"
              />
              <button
                type="submit"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-primary-600"
                aria-label="Search"
              >
                <Search className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden bg-primary-700 border-t border-primary-500 px-4 py-3 space-y-3">
            {isAuthenticated ? (
              <>
                <Link to="/profile" className="flex items-center text-white text-sm font-medium hover:text-white/80 py-1" onClick={() => setMobileMenuOpen(false)}>
                  <User className="h-4 w-4 mr-2" /> Profile
                </Link>
                <Link to="/wishlist" className="flex items-center text-white text-sm font-medium hover:text-white/80 py-1" onClick={() => setMobileMenuOpen(false)}>
                  <Heart className="h-4 w-4 mr-2" /> Wishlist
                  {wishlistCount > 0 && (
                    <span className="ml-1.5 bg-[#ff6161] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
                <Link to="/seller" className="flex items-center text-white text-sm font-medium hover:text-white/80 py-1" onClick={() => setMobileMenuOpen(false)}>
                  <Store className="h-4 w-4 mr-2" /> Become a Seller
                </Link>
              </>
            ) : (
              <Link
                to="/auth/login"
                className="block w-full text-center bg-white text-primary-600 px-4 py-2 rounded-sm font-medium text-sm"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login / Register
              </Link>
            )}
          </div>
        )}
      </header>

      {/* Category nav */}
      <nav className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 flex items-center space-x-8 h-10 overflow-x-auto text-sm font-medium text-gray-700 whitespace-nowrap hide-scrollbar">
          {([
            { label: 'Electronics', search: 'electronics' },
            { label: 'Fashion',     search: 'fashion'     },
            { label: 'Home',        search: 'home'        },
            { label: 'Beauty',      search: 'beauty'      },
            { label: 'Sports',      search: 'sports'      },
            { label: 'Toys',        search: 'toys'        },
            { label: 'Grocery',     search: 'grocery'     },
            { label: 'Books',       search: 'books'       },
          ] as const).map(({ label, search }) => (
            <Link key={label} to={`/products?search=${search}`} className="hover:text-primary-600 shrink-0">
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
};

// ── Highlight matching text in bold ───────────────────────────
function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <strong className="text-primary-600">{text.slice(idx, idx + query.length)}</strong>
      {text.slice(idx + query.length)}
    </>
  );
}
