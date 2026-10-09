import { Link, NavLink, useNavigate } from 'react-router-dom';
import Logo from './Logo';
import Icon from './Icon';
import useAuth from '../hooks/useAuth';
import useToast from '../hooks/useToast';

const linkClass = ({ isActive }) => `admin-link ${isActive ? 'active' : ''}`;

export default function AdminSidebar() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    toast.success('You have been signed out');
    navigate('/');
  }

  return (
    <aside className="admin-sidebar">
      <div className="admin-brand">
        <Logo />
        <span className="badge-nova accent">Admin</span>
      </div>

      <nav className="admin-nav" aria-label="Admin">
        <NavLink to="/admin" end className={linkClass}><Icon name="dashboard" size={18} /> Dashboard</NavLink>
        <NavLink to="/admin/products" className={linkClass}><Icon name="package" size={18} /> Products</NavLink>
        <NavLink to="/admin/orders" className={linkClass}><Icon name="cart" size={18} /> Orders</NavLink>
        <NavLink to="/admin/users" className={linkClass}><Icon name="users" size={18} /> Users</NavLink>
      </nav>

      <div className="admin-sidebar-foot">
        <Link to="/" className="admin-link"><Icon name="store" size={18} /> View store</Link>
        <div className="admin-user">
          <div className="text-truncate fw-medium">{user.name}</div>
          <button type="button" className="admin-signout" onClick={handleLogout}>
            <Icon name="logout" size={16} /> Sign out
          </button>
        </div>
      </div>
    </aside>
  );
}
