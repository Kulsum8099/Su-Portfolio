import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { hasFinePointer, prefersReducedMotion } from '../utils/motion';

const INTERACTIVE =
  'a, button, [role="button"], [data-cursor], [data-cursor-text], input, textarea, select, summary, label';

/**
 * Decorative cursor for mouse users. It only runs (and only hides the system
 * cursor, via the `has-custom-cursor` class) on fine pointers when motion is
 * allowed, so touch, keyboard and reduced-motion users keep the native one.
 */
const CustomCursor = () => {
  const [enabled] = useState(() => hasFinePointer() && !prefersReducedMotion());
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState(false);
  const [label, setLabel] = useState('');
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const auraRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    if (!enabled) return;
    const html = document.documentElement;
    html.classList.add('has-custom-cursor');
    const elements = [dotRef.current, ringRef.current, auraRef.current, textRef.current];
    const lag = [0.12, 0.24, 0.55, 0.3]; // seconds each layer trails the pointer

    // quickTo reuses one tween per axis instead of creating new ones per event.
    const followers = elements.map((element, index) => ({
      x: gsap.quickTo(element, 'x', { duration: lag[index], ease: 'power2.out' }),
      y: gsap.quickTo(element, 'y', { duration: lag[index], ease: 'power2.out' }),
    }));

    let shown = false;
    const onMove = (event) => {
      if (event.pointerType === 'touch') return;
      for (const follower of followers) {
        follower.x(event.clientX);
        follower.y(event.clientY);
      }
      if (!shown) {
        shown = true;
        setVisible(true);
      }
    };
    const onOver = (event) => {
      const target = event.target instanceof Element ? event.target.closest(INTERACTIVE) : null;
      setActive(Boolean(target));
      setLabel(target?.getAttribute('data-cursor-text') ?? '');
    };
    const onOut = (event) => {
      if (event.relatedTarget) return; // still inside the page
      shown = false;
      setVisible(false);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerover', onOver, { passive: true });
    window.addEventListener('mouseout', onOut, { passive: true });

    return () => {
      html.classList.remove('has-custom-cursor');
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerover', onOver);
      window.removeEventListener('mouseout', onOut);
      gsap.killTweensOf(elements);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div aria-hidden="true" className={active ? 'cursor-active' : undefined}>
      <div ref={auraRef} className="cursor-aura" style={{ opacity: visible ? (active ? 0.9 : 0.58) : 0 }} />
      <div ref={dotRef} className="cursor-dot" style={{ opacity: visible ? 1 : 0 }} />
      <div ref={ringRef} className="cursor-ring" style={{ opacity: visible ? 1 : 0 }} />
      <div ref={textRef} className="cursor-text" style={{ opacity: visible && label ? 1 : 0 }}>
        {label}
      </div>
    </div>
  );
};

export default CustomCursor;
