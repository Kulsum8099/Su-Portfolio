// Lenis smooth scrolling for the public pages, wired into GSAP's ticker so
// ScrollTrigger animations stay in sync. Skipped for reduced-motion users,
// who keep native scrolling and get instant jumps instead of glides.
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { prefersReducedMotion } from '../utils/motion';

gsap.registerPlugin(ScrollTrigger);

// Leaves room for the fixed navbar when jumping to a section.
export const NAV_OFFSET = -88;

let lenis = null;

export function startSmoothScroll() {
  if (lenis || prefersReducedMotion()) return () => {};

  lenis = new Lenis({
    duration: 1.1,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });
  lenis.on('scroll', ScrollTrigger.update);

  const raf = (time) => lenis?.raf(time * 1000);
  gsap.ticker.add(raf);
  gsap.ticker.lagSmoothing(0);

  return () => {
    gsap.ticker.remove(raf);
    gsap.ticker.lagSmoothing(500, 33);
    lenis?.destroy();
    lenis = null;
  };
}

/** Jumps immediately to a scroll position (route changes, back/forward). */
export function scrollToPosition(y) {
  if (lenis) {
    lenis.resize(); // the page height may have just changed
    lenis.scrollTo(y, { immediate: true, force: true });
  } else {
    window.scrollTo(0, y);
  }
}

/** Scrolls to an element or selector. Returns false when it doesn't exist. */
export function scrollToElement(target, { immediate = false, offset = NAV_OFFSET } = {}) {
  const element = typeof target === 'string' ? document.querySelector(target) : target;
  if (!element) return false;

  if (lenis && !immediate) {
    lenis.scrollTo(element, { offset, duration: 1.1 });
  } else {
    scrollToPosition(Math.max(0, element.getBoundingClientRect().top + window.scrollY + offset));
  }
  return true;
}

/** Glides to the top of the page (instant with reduced motion). */
export function smoothScrollToTop() {
  if (lenis) lenis.scrollTo(0, { duration: 1.1 });
  else window.scrollTo(0, 0);
}

export const pauseSmoothScroll = () => lenis?.stop();
export const resumeSmoothScroll = () => lenis?.start();
