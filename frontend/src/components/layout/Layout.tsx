import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { Toaster } from 'react-hot-toast';
import { AIAssistant } from '../shared/AIAssistant';
import { logout } from '../../store/slices/authSlice';
import { clearCart } from '../../store/slices/cartSlice';
import { clearWishlist } from '../../store/slices/wishlistSlice';
import { AppDispatch } from '../../store';

export const Layout = () => {
  const dispatch = useDispatch<AppDispatch>();

  // Listen for session expiry events dispatched by axiosInstance on 401
  // This clears all user-specific Redux state without a circular import
  useEffect(() => {
    const handleSessionExpired = () => {
      dispatch(logout());
      dispatch(clearCart());
      dispatch(clearWishlist());
    };
    window.addEventListener('auth:session-expired', handleSessionExpired);
    return () => {
      window.removeEventListener('auth:session-expired', handleSessionExpired);
    };
  }, [dispatch]);

  return (
    <div className="flex flex-col min-h-screen bg-[#f1f3f6]">
      <Navbar />
      <main className="flex-grow w-full">
        <Outlet />
      </main>
      <Footer />
      <Toaster 
        position="bottom-center"
        toastOptions={{
          className: 'text-sm font-medium rounded-sm shadow-md',
          duration: 3000,
          style: {
            background: '#333',
            color: '#fff',
          },
        }} 
      />
      {/* AI Shopping Assistant — globally available on every page */}
      <AIAssistant />
    </div>
  );
};

