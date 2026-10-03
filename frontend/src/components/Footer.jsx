import { Link } from 'react-router-dom';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="nova-footer">
      <div className="container">
        <div className="row g-4">
          <div className="col-lg-5">
            <Logo />
            <p className="mt-3 mb-0" style={{ maxWidth: 360 }}>
              Carefully selected products for work, play and everyday life.
            </p>
          </div>
          <div className="col-6 col-lg-2 offset-lg-1">
            <h4>Explore</h4>
            <Link to="/shop">Shop</Link>
            <Link to="/categories">Categories</Link>
            <Link to="/cart">Cart</Link>
          </div>
          <div className="col-6 col-lg-2">
            <h4>Account</h4>
            <Link to="/login">Sign in</Link>
            <Link to="/register">Create account</Link>
            <Link to="/orders">My orders</Link>
          </div>
          <div className="col-lg-2">
            <h4>About</h4>
            <p className="small mb-0">
              A portfolio project built for the CodeAlpha internship. Payments are simulated.
            </p>
          </div>
        </div>
        <div className="nova-footer-bottom">&copy; {new Date().getFullYear()} NOVA. Demo store, no real purchases.</div>
      </div>
    </footer>
  );
}
