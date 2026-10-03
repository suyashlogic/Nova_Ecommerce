import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ScrollToTop from '../components/ScrollToTop';

// The frame around every public page. <Outlet /> is where the matched page renders.
export default function MainLayout() {
  return (
    <>
      <a href="#main" className="skip-link">Skip to content</a>
      <ScrollToTop />
      <Navbar />
      <main id="main" className="page-main">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
