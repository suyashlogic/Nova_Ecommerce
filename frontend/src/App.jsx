import { Route, Routes } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import GuestRoute from './components/GuestRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import ComingSoon from './pages/ComingSoon';
import NotFound from './pages/NotFound';

// The route table: which URL shows which page.
// Layout routes (no path) wrap their children: MainLayout adds the navbar and footer,
// GuestRoute and ProtectedRoute decide who may see the pages inside them.
export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* Public */}
        <Route index element={<Home />} />
        <Route path="shop" element={<ComingSoon title="Shop" phase={7} />} />
        <Route path="products/:id" element={<ComingSoon title="Product details" phase={7} />} />
        <Route path="categories" element={<ComingSoon title="Categories" phase={7} />} />
        <Route path="cart" element={<ComingSoon title="Cart" phase={8} />} />

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
