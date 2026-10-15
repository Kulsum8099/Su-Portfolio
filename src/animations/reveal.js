import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from '../utils/motion';

gsap.registerPlugin(ScrollTrigger);

/**
 * Fades elements up the first time they scroll into view, each on its own
 * schedule (so long stacked sections don't animate off-screen). Call inside
 * useGSAP so the triggers are cleaned up with the component. Reduced-motion
 * users simply see the content. Uses opacity (not visibility), so content
 * stays readable by screen readers before it animates.
 */
export function revealOnScroll(elements, { y = 36, duration = 0.8, stagger = 0.08, start = 'top 88%' } = {}) {
  const targets = gsap.utils.toArray(elements);
  if (targets.length === 0 || prefersReducedMotion()) return;

  gsap.set(targets, { opacity: 0, y });
  ScrollTrigger.batch(targets, {
    start,
    once: true,
    onEnter: (batch) =>
      gsap.to(batch, { opacity: 1, y: 0, duration, stagger, ease: 'power3.out', overwrite: true }),
  });
}
