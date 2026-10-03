import { Navigate, Outlet, useLocation } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';
import useAuth from '../hooks/useAuth';

// The opposite of ProtectedRoute: login and register pages are for logged-out visitors.
// A logged-in user is sent on to where they were heading (or the home page).
export default function GuestRoute() {
  const { user, authLoading } = useAuth();
  const location = useLocation();

  if (authLoading) return <LoadingSpinner label="Loading..." />;
  if (user) return <Navigate to={location.state?.from?.pathname || '/'} replace />;

  return <Outlet />;
}
