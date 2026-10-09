import { Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import ScrollToTop from '../components/ScrollToTop';

// Frame for every /admin page. Access control is done by <ProtectedRoute adminOnly> in App.jsx
// (UI only) and by authorize('admin') on every /api/admin route (the real protection).
export default function AdminLayout() {
  const { pathname } = useLocation();
  return (
    <div className="admin-shell">
      <a href="#admin-main" className="skip-link">Skip to content</a>
      <ScrollToTop focusTargetId="admin-main" />
      <AdminSidebar />
      <main id="admin-main" tabIndex={-1} className="admin-main">
        <div key={pathname} className="page-enter">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
