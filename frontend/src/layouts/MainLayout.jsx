import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ScrollToTop from '../components/ScrollToTop';

// The frame around every public page. <Outlet /> is where the matched page renders.
export default function MainLayout() {
  const { pathname } = useLocation();
  return (
    <>
      <a href="#main" className="skip-link">Skip to content</a>
      <ScrollToTop />
      <Navbar />
      <main id="main" tabIndex={-1} className="page-main">
        {/* Changing the key remounts this wrapper on each page, which replays the fade-in */}
        <div key={pathname} className="page-enter">
          <Outlet />
        </div>
      </main>
      <Footer />
    </>
  );
}
