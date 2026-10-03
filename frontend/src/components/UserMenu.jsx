import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from './Icon';
import useAuth from '../hooks/useAuth';
import useToast from '../hooks/useToast';

// Avatar button with a dropdown: Profile, Orders, Admin (admins only), Sign out.
export default function UserMenu() {
  const { user, isAdmin, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  // Close when clicking outside the menu or pressing Escape
  useEffect(() => {
    if (!open) return undefined;
    const handleClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setOpen(false);
    };
    const handleKey = (event) => event.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  async function handleLogout() {
    setOpen(false);
    await logout();
    toast.success('You have been signed out');
    navigate('/');
  }

  return (
    <div className="nova-menu" ref={menuRef}>
      <button
        type="button"
        className="nova-menu-btn"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Account menu"
      >
        <span className="nova-avatar">{user.name.charAt(0).toUpperCase()}</span>
        <Icon name="chevronDown" size={16} />
      </button>

      {open && (
        <div className="nova-menu-panel" role="menu">
          <div className="nova-menu-head">
            <div className="fw-semibold text-truncate">{user.name}</div>
            <div className="text-muted-nova small text-truncate">{user.email}</div>
          </div>
          <Link to="/profile" className="nova-menu-item" role="menuitem" onClick={() => setOpen(false)}>
            <Icon name="user" size={18} /> Profile
          </Link>
          <Link to="/orders" className="nova-menu-item" role="menuitem" onClick={() => setOpen(false)}>
            <Icon name="package" size={18} /> My orders
          </Link>
          {isAdmin && (
            <Link to="/admin" className="nova-menu-item" role="menuitem" onClick={() => setOpen(false)}>
              <Icon name="dashboard" size={18} /> Admin dashboard
            </Link>
          )}
          <button type="button" className="nova-menu-item" role="menuitem" onClick={handleLogout}>
            <Icon name="logout" size={18} /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}
