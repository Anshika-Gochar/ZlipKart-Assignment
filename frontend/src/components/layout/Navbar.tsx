import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Search, Store, MoreVertical, Heart, Menu, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { useSelector } from 'react-redux';
import { selectWishlistCount } from '../../store/slices/wishlistSlice';
import { useState, useRef } from 'react';

export const Navbar = () => {
  const { isAuthenticated } = useAuth();
  const { itemCount } = useCart();
  const wishlistCount = useSelector(selectWishlistCount);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigate = useNavigate();

  // Debounced search — navigates to /products?search=... after 400ms pause
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (val.trim()) {
        navigate(`/products?search=${encodeURIComponent(val.trim())}`);
      } else {
        navigate('/products');
      }
    }, 400);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/products');
    }
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
                  Flipkart
                </span>
                <span className="text-[10px] text-white/90 italic mt-0.5 flex items-center">
                  Explore <span className="text-secondary font-bold ml-1">Plus</span>
                </span>
              </Link>
            </div>

            {/* Search Bar — hidden on mobile, shown on sm+ */}
            <div className="hidden sm:flex flex-1 max-w-2xl px-4 lg:px-8 items-center justify-center">
              <form onSubmit={handleSearchSubmit} className="w-full relative shadow-sm">
                <input
                  id="navbar-search"
                  name="search"
                  value={searchQuery}
                  onChange={handleSearchChange}
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

              <button className="hidden lg:flex items-center text-white hover:text-white/80 font-medium text-sm">
                More <MoreVertical className="h-4 w-4 ml-0.5" />
              </button>

              {/* Cart — always visible */}
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
                <Link
                  to="/profile"
                  className="flex items-center text-white text-sm font-medium hover:text-white/80 py-1"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="h-4 w-4 mr-2" /> Profile
                </Link>
                <Link
                  to="/wishlist"
                  className="flex items-center text-white text-sm font-medium hover:text-white/80 py-1"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Heart className="h-4 w-4 mr-2" /> Wishlist
                  {wishlistCount > 0 && (
                    <span className="ml-1.5 bg-[#ff6161] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {wishlistCount}
                    </span>
                  )}
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
        <div className="max-w-7xl mx-auto px-4 flex items-center
          space-x-8 h-10 overflow-x-auto text-sm font-medium
          text-gray-700 whitespace-nowrap hide-scrollbar">
          {['Electronics', 'Fashion', 'Home', 'Appliances',
            'Beauty', 'Toys', 'Grocery', 'Sports'].map(c => (
            <Link
              key={c}
              to={`/products?search=${c.toLowerCase()}`}
              className="hover:text-primary-600 shrink-0"
            >
              {c}
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
};
