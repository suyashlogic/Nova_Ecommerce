import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import GuestRoute from './components/GuestRoute';
import LoadingSpinner from './components/LoadingSpinner';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Categories from './pages/Categories';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Wishlist from './pages/Wishlist';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

// Code splitting: this import() makes Vite put all admin code in a separate file
// that is only downloaded when someone opens /admin.
const AdminRoutes = lazy(() => import('./pages/admin/AdminRoutes'));

// The route table: which URL shows which page.
export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* Public */}
        <Route index element={<Home />} />
        <Route path="shop" element={<Shop />} />
        <Route path="products/:id" element={<ProductDetail />} />
        <Route path="categories" element={<Categories />} />
        <Route path="cart" element={<Cart />} />

        {/* Only for logged-out visitors */}
        <Route element={<GuestRoute />}>
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
        </Route>

        {/* Only for logged-in users */}
        <Route element={<ProtectedRoute />}>
          <Route path="checkout" element={<Checkout />} />
          <Route path="orders" element={<Orders />} />
          <Route path="orders/:id" element={<OrderDetail />} />
          <Route path="wishlist" element={<Wishlist />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Admin area: loaded on demand, admins only. This guard only controls the UI.
          Every /api/admin route also checks the role on the server. */}
      <Route element={<ProtectedRoute adminOnly />}>
        <Route
          path="admin/*"
          element={
            <Suspense fallback={<LoadingSpinner label="Loading admin area..." />}>
              <AdminRoutes />
            </Suspense>
          }
        />
      </Route>
    </Routes>
  );
}
