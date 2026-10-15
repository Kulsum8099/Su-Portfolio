import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import FloatingBadge from '../components/FloatingBadge';
import { scrollToElement } from '../lib/smoothScroll';
import { prefersReducedMotion } from '../utils/motion';

const TITLE = 'portFolio';

/**
 * `ready` becomes true when the intro loader starts lifting (or right away
 * when there is no loader); the entrance animation plays from that moment.
 */
const Hero = ({ ready = true, name }) => {
  const heroRef = useRef(null);
  const timelineRef = useRef(null);

  // Built paused on mount so the start states apply before the first paint.
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      const loops = [
        gsap.to('.hero-flower', { y: -15, rotation: -15, duration: 2.5, ease: 'sine.inOut', repeat: -1, yoyo: true, paused: true }),
        gsap.to('.hero-scroll', { y: 8, duration: 1.5, ease: 'sine.inOut', repeat: -1, yoyo: true, paused: true }),
      ];

      timelineRef.current = gsap
        .timeline({ paused: true })
        .fromTo('.hero-year', { y: 30, opacity: 0, scale: 0.8 }, { y: 0, opacity: 1, scale: 1, duration: 0.7, ease: 'back.out(1.7)' })
        .fromTo(
          '.hero-char',
          { y: 80, opacity: 0, rotationX: -90 },
          { y: 0, opacity: 1, rotationX: 0, duration: 0.8, stagger: 0.05, ease: 'back.out(1.5)' },
          '-=0.3',
        )
        .fromTo(
          '.hero-badge',
          { y: 40, opacity: 0, scale: 0.5 },
          { y: 0, opacity: 1, scale: 1, duration: 0.6, stagger: 0.12, ease: 'back.out(2)' },
          '-=0.4',
        )
        .fromTo(
          '.hero-flower',
          { scale: 0, rotation: 90, opacity: 0 },
          { scale: 1, rotation: 0, opacity: 1, duration: 0.6, ease: 'back.out(2)' },
          '-=0.6',
        )
        .fromTo('.hero-scroll', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, '-=0.2')
        // Idle loops start once the entrance has finished.
        .call(() => loops.forEach((loop) => loop.play()));
    },
    { scope: heroRef },
  );

  useEffect(() => {
    if (ready) timelineRef.current?.play();
  }, [ready]);

  const handleScrollCue = (event) => {
    event.preventDefault();
    scrollToElement('#intro');
    requestAnimationFrame(() => document.getElementById('intro')?.focus({ preventScroll: true }));
  };

  return (
    <section
      id="hero"
      ref={heroRef}
      tabIndex={-1}
      aria-label="Introduction"
      className="relative flex min-h-[85svh] items-center justify-center overflow-hidden pt-24 pb-16 sm:min-h-svh"
    >
      <div className="container-page relative z-10 flex flex-col items-center text-center">
        {/* Year, title and flower are positioned relative to the title itself,
            so they stay together at every width. */}
        <div className="relative inline-flex flex-col">
          <div className="hero-year mb-3 self-center md:mb-4 md:ml-[33%] md:self-start">
            <span
              className="font-pixel text-[clamp(1.5rem,4.2vw,3rem)] font-bold tracking-wide text-neon-green"
              style={{ textShadow: '0 0 20px rgb(190 255 70 / 0.5)' }}
            >
              {new Date().getFullYear()}
            </span>
          </div>

          {/* Font size follows the viewport so the word never breaks */}
          <h1
            aria-label="Portfolio"
            className="font-pixel text-[clamp(1.75rem,9.4vw,6.4rem)] leading-[0.95] font-bold tracking-[-0.04em] whitespace-nowrap [perspective:800px]"
          >
            {TITLE.split('').map((char, index) => (
              <span
                key={index}
                aria-hidden="true"
                className="hero-char inline-block text-white"
                style={{ textShadow: '0 0 30px rgb(255 255 255 / 0.1), 0 0 60px rgb(139 92 246 / 0.1)' }}
              >
                {char}
              </span>
            ))}
          </h1>

          <div
            aria-hidden="true"
            className="hero-flower absolute -bottom-3 -left-1 z-10 text-[clamp(1.5rem,3.6vw,3rem)] leading-none select-none md:-bottom-8"
          >
            🌸
          </div>
        </div>

        <ul className="mt-8 flex flex-wrap items-center justify-center gap-2.5 md:mt-10 md:gap-3" aria-label="Focus areas">
          <li className="hero-badge">
            <FloatingBadge text="UX-UI Design" color="pink" delay={0.2} />
          </li>
          <li className="hero-badge">
            <FloatingBadge text="Branding" color="green" delay={0.4} />
          </li>
          {name && (
            <li className="hero-badge">
              <FloatingBadge text={`By ${name}`} color="purple" delay={0.6} />
            </li>
          )}
        </ul>
      </div>

      <a
        href="#intro"
        onClick={handleScrollCue}
        className="hero-scroll absolute right-4 bottom-6 z-10 rounded-full p-1 text-white/80 transition-colors hover:text-neon-green sm:right-8 md:right-12 md:bottom-12"
        data-cursor-text="Scroll"
      >
        <span className="sr-only">Scroll to the introduction</span>
        <span className="relative flex items-center justify-center" aria-hidden="true">
          <svg className="h-12 w-8 md:h-14 md:w-10" viewBox="0 0 40 60" fill="none" stroke="currentColor" strokeWidth="2.5">
            <rect x="8" y="5" width="24" height="50" rx="12" ry="12" />
          </svg>
          <span className="absolute size-1.5 animate-scroll-dot rounded-full bg-current md:size-2" />
        </span>
      </a>
    </section>
  );
};

export default Hero;
