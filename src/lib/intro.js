// The intro loader is a first-impression moment: it plays once per browser
// session, only when the visit starts on the home page, and never for
// visitors who prefer reduced motion.
import { prefersReducedMotion } from '../utils/motion';

const STORAGE_KEY = 'su:intro-played';

function decide() {
  if (typeof window === 'undefined') return false;
  let seen = false;
  try {
    seen = window.sessionStorage.getItem(STORAGE_KEY) === '1';
    window.sessionStorage.setItem(STORAGE_KEY, '1');
  } catch {
    // Storage can be blocked (private mode); then the intro plays per page load.
  }
  return !seen && window.location.pathname === '/' && !prefersReducedMotion();
}

const state = { pending: decide() };

export const shouldPlayIntro = () => state.pending;

export const markIntroPlayed = () => {
  state.pending = false;
};
