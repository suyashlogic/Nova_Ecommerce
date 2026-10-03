import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// React Router changes the page without a reload, so the scroll position would
// stay where it was. This jumps back to the top on every navigation.
export default function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}
