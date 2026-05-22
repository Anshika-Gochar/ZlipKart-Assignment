// src/pages/Profile/index.tsx
import { useDispatch } from 'react-redux';
import { useAuth } from '../../hooks/useAuth';
import { logout } from '../../store/slices/authSlice';
import { Link, useNavigate } from 'react-router-dom';
import { AppDispatch } from '../../store';
import {
  User, ShoppingBag, Heart, MapPin, LogOut, ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';

const navLinks = [
  { to: '/orders',    icon: ShoppingBag, label: 'My Orders',   desc: 'Track, return, or buy again' },
  { to: '/wishlist',  icon: Heart,       label: 'My Wishlist',  desc: 'Your saved items' },
  { to: '/addresses', icon: MapPin,      label: 'My Addresses', desc: 'Save and manage delivery addresses' },
];

export default function Profile() {
  const { user } = useAuth();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Logged out successfully');
    navigate('/auth/login');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Account header */}
      <div className="bg-white border border-gray-200 rounded-sm p-5 mb-4 shadow-sm flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0">
          <User className="w-7 h-7 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-xs text-[#878787] mb-0.5">Hello,</p>
          <p className="text-base font-medium text-[#212121]">{user?.name || 'User'}</p>
          <p className="text-xs text-[#878787]">{user?.email}</p>
        </div>
        {user?.role === 'ADMIN' && (
          <span className="text-xs bg-primary-600 text-white px-2 py-0.5 rounded-sm font-medium">
            Admin
          </span>
        )}
      </div>

      {/* Navigation Links */}
      <div className="bg-white border border-gray-200 rounded-sm shadow-sm divide-y divide-gray-100 mb-4">
        {navLinks.map(({ to, icon: Icon, label, desc }) => (
          <Link
            key={to}
            to={to}
            className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors group"
          >
            <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 group-hover:bg-primary-50 transition-colors">
              <Icon className="w-4 h-4 text-[#212121] group-hover:text-primary-600 transition-colors" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-[#212121]">{label}</p>
              <p className="text-xs text-[#878787]">{desc}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </Link>
        ))}
      </div>

      {/* Logout */}
      <div className="bg-white border border-gray-200 rounded-sm shadow-sm">
        <button
          onClick={handleLogout}
          className="flex items-center gap-4 px-5 py-4 w-full text-left hover:bg-red-50 transition-colors group"
        >
          <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 group-hover:bg-red-100 transition-colors">
            <LogOut className="w-4 h-4 text-gray-500 group-hover:text-red-500 transition-colors" />
          </div>
          <span className="text-sm font-medium text-gray-700 group-hover:text-red-500 transition-colors">
            Logout
          </span>
        </button>
      </div>
    </div>
  );
}
