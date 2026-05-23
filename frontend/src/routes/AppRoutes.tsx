import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';
import { Layout } from '../components/layout/Layout';

import Profile from '../pages/Profile';
import Home from '../pages/Home';
import Products from '../pages/Products';
import ProductDetail from '../pages/ProductDetail';
import Cart from '../pages/Cart';
import Checkout from '../pages/Checkout';
import Orders from '../pages/Orders';
import Wishlist from '../pages/Wishlist';
import Addresses from '../pages/Addresses';
import OrderSuccess from '../pages/OrderSuccess';
import Login from '../pages/Auth/Login';
import Register from '../pages/Auth/Register';
import OrderDetail from '../pages/Orders/Detail';
import SellerPage from '../pages/Seller';
import NotFound from '../pages/NotFound';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/seller" element={<SellerPage />} />

        {/* Auth Routes (Only for non-logged-in users) */}
        <Route element={<PublicRoute />}>
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />
        </Route>

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:id" element={<OrderDetail />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/addresses" element={<Addresses />} />
          <Route path="/order-success" element={<OrderSuccess />} />
        </Route>

        {/* 404 — must be last */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};
