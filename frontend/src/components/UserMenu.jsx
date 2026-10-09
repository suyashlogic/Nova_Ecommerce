import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from './Icon';
import useAuth from '../hooks/useAuth';
import useToast from '../hooks/useToast';

// Avatar button with a dropdown: Profile, Orders, Wishlist, Admin (admins only), Sign out.
export default function UserMenu() {
  const { user, isAdmin, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  // Close when clicking outside; Escape closes and returns focus to the button
  useEffect(() => {
    if (!open) return undefined;
    const handleClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setOpen(false);
    };
    const handleKey = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
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

  const close = () => setOpen(false);

  return (
    <div className="nova-menu" ref={menuRef}>
      <button
        ref={buttonRef}
        type="button"
        className="nova-menu-btn"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="account-menu"
        aria-label="Account menu"
      >
        <span className="nova-avatar">{user.name.charAt(0).toUpperCase()}</span>
        <Icon name="chevronDown" size={16} />
      </button>

      {open && (
        <div className="nova-menu-panel" id="account-menu">
          <div className="nova-menu-head">
            <div className="fw-semibold text-truncate">{user.name}</div>
            <div className="text-muted-nova small text-truncate">{user.email}</div>
          </div>
          <Link to="/profile" className="nova-menu-item" onClick={close}><Icon name="user" size={18} /> Profile</Link>
          <Link to="/orders" className="nova-menu-item" onClick={close}><Icon name="package" size={18} /> My orders</Link>
          <Link to="/wishlist" className="nova-menu-item" onClick={close}><Icon name="heart" size={18} /> Wishlist</Link>
          {isAdmin && (
            <Link to="/admin" className="nova-menu-item" onClick={close}><Icon name="dashboard" size={18} /> Admin dashboard</Link>
          )}
          <button type="button" className="nova-menu-item" onClick={handleLogout}>
            <Icon name="logout" size={18} /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}
