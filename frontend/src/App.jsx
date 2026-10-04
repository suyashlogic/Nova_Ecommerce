import { Route, Routes } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import GuestRoute from './components/GuestRoute';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Categories from './pages/Categories';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import ComingSoon from './pages/ComingSoon';
import NotFound from './pages/NotFound';

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
          <Route path="checkout" element={<ComingSoon title="Checkout" phase={9} />} />
          <Route path="orders" element={<ComingSoon title="Orders" phase={9} />} />
          <Route path="orders/:id" element={<ComingSoon title="Order details" phase={9} />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Phase 10 adds: <Route element={<ProtectedRoute adminOnly />}> ...admin pages... */}

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
