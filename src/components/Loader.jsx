import { useEffect, useEffectEvent, useRef } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';

/**
 * First-visit intro. Rendered outside #root (portal) while #root is inert,
 * so keyboard focus can't land on the hidden page underneath. Exits with a
 * transform-only curtain lift (cheap on low-end phones).
 *   onReveal   – the curtain starts lifting (start the hero animation)
 *   onComplete – fully gone (unmount)
 */
const Loader = ({ name, role, onReveal, onComplete }) => {
  const rootRef = useRef(null);
  const contentRef = useRef(null);
  const nameRef = useRef(null);
  const roleRef = useRef(null);
  const counterRef = useRef(null);
  const lineRef = useRef(null);

  const reveal = useEffectEvent(() => onReveal?.());
  const complete = useEffectEvent(() => onComplete?.());

  useEffect(() => {
    const appRoot = document.getElementById('root');
    if (appRoot) appRoot.inert = true;

    const counter = { value: 0 };
    const tl = gsap.timeline({ onComplete: () => complete() });
    tl.to(
      counter,
      {
        value: 100,
        duration: 1.4,
        ease: 'power2.inOut',
        onUpdate: () => {
          if (counterRef.current) counterRef.current.textContent = `${Math.round(counter.value)}%`;
        },
      },
      0,
    )
      .to(lineRef.current, { scaleX: 1, duration: 1.4, ease: 'power2.inOut' }, 0)
      .fromTo(nameRef.current, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' }, 0.15)
      .fromTo(roleRef.current, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' }, 0.35)
      // quick glitch before the exit
      .to(nameRef.current, { skewX: 5, duration: 0.08, ease: 'power4.inOut' }, 1.45)
      .to(nameRef.current, { skewX: -3, duration: 0.06, ease: 'power4.inOut' })
      .to(nameRef.current, { skewX: 0, duration: 0.08, ease: 'power4.inOut' })
      .to(contentRef.current, { y: -24, opacity: 0, duration: 0.35, ease: 'power2.in' }, 1.65)
      .call(() => reveal(), [], 1.8)
      .to(rootRef.current, { yPercent: -100, duration: 0.75, ease: 'power4.inOut' }, 1.8);

    return () => {
      tl.kill();
      if (appRoot) appRoot.inert = false;
    };
  }, []);

  const [first, ...rest] = name.split(' ');
  const last = rest.pop();

  return createPortal(
    <div ref={rootRef} className="loader-container overflow-hidden" role="status">
      <span className="sr-only">Loading the portfolio</span>
      <div className="absolute inset-0 bg-gradient-to-br from-bg-primary via-bg-secondary to-bg-tertiary" aria-hidden="true" />
      <div className="grid-overlay" aria-hidden="true" />

      <div ref={contentRef} className="relative z-10 flex flex-col items-center gap-4 px-6 text-center" aria-hidden="true">
        <p ref={nameRef} className="text-4xl font-bold tracking-tight opacity-0 md:text-6xl lg:text-7xl">
          <span className="text-white">{[first, ...rest].join(' ')}</span>{' '}
          {last && <span className="text-neon-green">{last}</span>}
        </p>
        <p ref={roleRef} className="text-sm tracking-[0.3em] text-text-secondary uppercase opacity-0 md:text-base">
          {role}
        </p>

        <div className="mt-8 w-48 md:w-64">
          <div className="relative h-px overflow-hidden rounded-full bg-white/10">
            <div
              ref={lineRef}
              className="h-full origin-left scale-x-0 bg-gradient-to-r from-neon-green via-neon-pink to-neon-purple"
            />
          </div>
          <p ref={counterRef} className="mt-3 text-center font-mono text-xs tracking-widest text-text-muted">
            0%
          </p>
        </div>
      </div>

      {/* Corner decorations */}
      <div className="absolute top-6 left-6 size-8 border-t border-l border-neon-purple/30" aria-hidden="true" />
      <div className="absolute top-6 right-6 size-8 border-t border-r border-neon-purple/30" aria-hidden="true" />
      <div className="absolute bottom-6 left-6 size-8 border-b border-l border-neon-purple/30" aria-hidden="true" />
      <div className="absolute right-6 bottom-6 size-8 border-r border-b border-neon-purple/30" aria-hidden="true" />
    </div>,
    document.body,
  );
};

export default Loader;
