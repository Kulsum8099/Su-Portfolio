import { useEffect, useRef } from 'react';
import gsap from 'gsap';

const Loader = ({ onComplete }) => {
  const loaderRef = useRef(null);
  const nameRef = useRef(null);
  const titleRef = useRef(null);
  const counterRef = useRef(null);
  const lineRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        if (onComplete) onComplete();
      },
    });

    // Counter animation
    const counter = { value: 0 };
    tl.to(counter, {
      value: 100,
      duration: 2,
      ease: 'power2.inOut',
      onUpdate: () => {
        if (counterRef.current) {
          counterRef.current.textContent = Math.floor(counter.value) + '%';
        }
      },
    });

    // Line width animation
    tl.to(
      lineRef.current,
      {
        width: '100%',
        duration: 2,
        ease: 'power2.inOut',
      },
      0
    );

    // Name reveal
    tl.fromTo(
      nameRef.current,
      { y: 40, opacity: 0, filter: 'blur(10px)' },
      { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.8, ease: 'power3.out' },
      0.3
    );

    // Title reveal
    tl.fromTo(
      titleRef.current,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' },
      0.6
    );

    // Glitch effect
    tl.to(nameRef.current, {
      skewX: 5,
      duration: 0.1,
      ease: 'power4.inOut',
    }, 2.2);
    tl.to(nameRef.current, {
      skewX: -3,
      duration: 0.08,
      ease: 'power4.inOut',
    });
    tl.to(nameRef.current, {
      skewX: 0,
      duration: 0.1,
      ease: 'power4.inOut',
    });

    // Fade out entire loader
    tl.to(loaderRef.current, {
      opacity: 0,
      scale: 1.05,
      filter: 'blur(10px)',
      duration: 0.8,
      ease: 'power3.inOut',
    }, 2.6);

    tl.set(loaderRef.current, { display: 'none' });

    return () => tl.kill();
  }, [onComplete]);

  return (
    <div ref={loaderRef} className="loader-container">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#070816] via-[#0B1023] to-[#10142B]" />

      {/* Grid overlay */}
      <div className="grid-overlay" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-4">
        <h1
          ref={nameRef}
          className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight opacity-0"
          style={{ fontFamily: 'var(--font-family-primary)' }}
        >
          <span className="text-white">Umme Kulsum</span>{' '}
          <span className="text-neon-green">Suriya</span>
        </h1>

        <p
          ref={titleRef}
          className="text-text-secondary text-sm md:text-base tracking-[0.3em] uppercase opacity-0"
        >
          UX-UI Designer
        </p>

        {/* Progress bar */}
        <div className="mt-8 w-48 md:w-64">
          <div className="h-[1px] bg-white/10 relative overflow-hidden rounded-full">
            <div
              ref={lineRef}
              className="h-full bg-gradient-to-r from-neon-green via-neon-pink to-neon-purple"
              style={{ width: '0%' }}
            />
          </div>
          <p
            ref={counterRef}
            className="text-text-muted text-xs mt-3 text-center font-mono tracking-widest"
          >
            0%
          </p>
        </div>
      </div>

      {/* Corner decorations */}
      <div className="absolute top-6 left-6 w-8 h-8 border-l border-t border-neon-purple/30" />
      <div className="absolute top-6 right-6 w-8 h-8 border-r border-t border-neon-purple/30" />
      <div className="absolute bottom-6 left-6 w-8 h-8 border-l border-b border-neon-purple/30" />
      <div className="absolute bottom-6 right-6 w-8 h-8 border-r border-b border-neon-purple/30" />
    </div>
  );
};

export default Loader;
