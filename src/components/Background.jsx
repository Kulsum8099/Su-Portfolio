import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { hasFinePointer, prefersReducedMotion } from '../utils/motion';

/** Fixed decorative backdrop: grid, ambient glows and a soft cursor spotlight. */
const Background = () => {
  const spotlightRef = useRef(null);
  const [spotlight] = useState(() => hasFinePointer() && !prefersReducedMotion());

  useEffect(() => {
    if (!spotlight) return;
    // Moving a pre-rendered glow with transforms stays on the compositor,
    // instead of repainting a full-screen gradient on every mouse move.
    const element = spotlightRef.current;
    const x = gsap.quickTo(element, 'x', { duration: 0.6, ease: 'power3.out' });
    const y = gsap.quickTo(element, 'y', { duration: 0.6, ease: 'power3.out' });
    const onMove = (event) => {
      x(event.clientX);
      y(event.clientY);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      gsap.killTweensOf(element);
    };
  }, [spotlight]);

  return (
    <div aria-hidden="true">
      <div className="grid-overlay" />

      {spotlight && (
        <div
          ref={spotlightRef}
          className="pointer-events-none fixed top-0 left-0 z-[3] -mt-60 -ml-60 size-120 rounded-full"
          style={{ background: 'radial-gradient(circle closest-side, rgb(139 92 246 / 0.07), transparent)' }}
        />
      )}

      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {/* Bottom-right violet glow */}
        <div
          className="absolute -right-1/4 -bottom-1/3 size-[62vw] animate-float-slow rounded-full opacity-30"
          style={{
            background:
              'radial-gradient(circle, rgb(84 52 210 / 0.24) 0%, rgb(40 30 116 / 0.12) 45%, transparent 75%)',
          }}
        />
        {/* Top-left indigo haze */}
        <div
          className="absolute -top-1/3 -left-1/4 size-[56vw] animate-float-slow rounded-full opacity-25 [animation-direction:reverse] [animation-duration:14s]"
          style={{ background: 'radial-gradient(circle, rgb(58 76 192 / 0.18) 0%, transparent 70%)' }}
        />
      </div>
    </div>
  );
};

export default Background;
