import { useEffect, useLayoutEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router';
import { scrollToElement, scrollToPosition } from '../lib/smoothScroll';

// Scroll position per history entry, so Back returns to where you were.
const positions = new Map();

/**
 * Route-aware scrolling for the public site (works with Lenis):
 * new pages start at the top, `/#section` links land on the section, and
 * back/forward navigation restores the previous position.
 */
export function useRouteScroll() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const keyRef = useRef(location.key);

  useEffect(() => {
    if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';
    const remember = () => positions.set(keyRef.current, window.scrollY);
    window.addEventListener('scroll', remember, { passive: true });
    return () => window.removeEventListener('scroll', remember);
  }, []);

  // Layout effect: runs after the new page's own layout effects (which
  // create ScrollTrigger pins), before the browser paints.
  useLayoutEffect(() => {
    keyRef.current = location.key;
    const saved = positions.get(location.key);
    if (navigationType === 'POP' && saved !== undefined) {
      scrollToPosition(saved);
    } else if (!(location.hash && scrollToElement(location.hash, { immediate: true }))) {
      scrollToPosition(0);
    }
  }, [location.key, location.hash, navigationType]);
}
