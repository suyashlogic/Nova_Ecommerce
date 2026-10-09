import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import Logo from './Logo';
import Icon from './Icon';
import SearchBar from './SearchBar';
import UserMenu from './UserMenu';
import useAuth from '../hooks/useAuth';
import useCart from '../hooks/useCart';

// NavLink adds the "active" class automatically for the current page
const linkClass = ({ isActive }) => `nova-link ${isActive ? 'active' : ''}`;

export default function Navbar() {
  const { user, authLoading } = useAuth();
  const { itemCount } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeMobile = () => setMobileOpen(false);

  // Escape closes the mobile menu
  useEffect(() => {
    if (!mobileOpen) return undefined;
    const handleKey = (event) => event.key === 'Escape' && setMobileOpen(false);
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [mobileOpen]);

  const links = (
    <>
      <NavLink to="/" end className={linkClass} onClick={closeMobile}>Home</NavLink>
      <NavLink to="/shop" className={linkClass} onClick={closeMobile}>Shop</NavLink>
      <NavLink to="/categories" className={linkClass} onClick={closeMobile}>Categories</NavLink>
      {user && <NavLink to="/orders" className={linkClass} onClick={closeMobile}>Orders</NavLink>}
    </>
  );

  return (
    <header className="nova-header">
      <div className="container nova-nav">
        <Logo onClick={closeMobile} />

        {/* Desktop: inline links and search. Hidden below the lg breakpoint. */}
        <nav className="nova-nav-links d-none d-lg-flex" aria-label="Main">{links}</nav>
        <div className="nova-nav-search d-none d-lg-block"><SearchBar /></div>

        <div className="nova-nav-actions">
          <Link
            to="/cart"
            className="nova-icon-btn"
            aria-label={itemCount > 0 ? `Shopping cart, ${itemCount} items` : 'Shopping cart'}
          >
            <Icon name="cart" size={22} />
            {itemCount > 0 && <span key={itemCount} className="nova-badge-count" aria-hidden="true">{itemCount > 99 ? '99+' : itemCount}</span>}
          </Link>

          {/* Avoid flashing "Sign in" while we are still asking the server who the user is */}
          {!authLoading && (user ? (
            <UserMenu />
          ) : (
            <Link to="/login" className="btn btn-nova-dark btn-sm ms-1">Sign in</Link>
          ))}

          {/* Mobile: hamburger toggles the panel below */}
          <button
            type="button"
            className="nova-icon-btn d-lg-none"
            onClick={() => setMobileOpen((value) => !value)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-panel"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            <Icon name={mobileOpen ? 'close' : 'menu'} size={22} />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="nova-mobile-panel d-lg-none" id="mobile-panel">
          <div className="container">
            <SearchBar onSearch={closeMobile} />
            <nav className="nova-mobile-links" aria-label="Mobile">{links}</nav>
          </div>
        </div>
      )}
    </header>
  );
}
