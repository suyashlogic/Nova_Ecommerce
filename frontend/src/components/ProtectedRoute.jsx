import { Navigate, Outlet, useLocation } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';
import useAuth from '../hooks/useAuth';

// Wraps pages that need a login. Used as a layout route in App.jsx:
//   <Route element={<ProtectedRoute />}>  ...pages...  </Route>
// Important: this only controls what the UI shows. The REAL protection is the
// backend's authenticate middleware, because anyone can edit frontend code.
export default function ProtectedRoute({ adminOnly = false }) {
  const { user, authLoading, isAdmin } = useAuth();
  const location = useLocation();

  // We don't know yet whether the user is logged in. Redirecting now would be wrong.
  if (authLoading) return <LoadingSpinner label="Checking your session..." />;

  // `state.from` remembers where they wanted to go, so login can send them back.
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;

  if (adminOnly && !isAdmin) return <Navigate to="/" replace />;

  return <Outlet />;
}
