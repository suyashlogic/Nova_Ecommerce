import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop({ focusTargetId = 'main' }) {
  const { pathname } = useLocation();
  const previousPath = useRef(pathname);

  useEffect(() => {
    // Skip the very first render (and React StrictMode's repeat of it)
    if (previousPath.current === pathname) return;
    previousPath.current = pathname;

    window.scrollTo(0, 0);
    // The target has tabIndex={-1}, which allows focus from code without adding it to the Tab order
    document.getElementById(focusTargetId)?.focus({ preventScroll: true });
  }, [pathname, focusTargetId]);

  return null;
}
