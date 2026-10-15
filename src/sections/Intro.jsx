import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import portrait from '../assets/images/me/portrait.webp';
import { hasFinePointer, prefersReducedMotion } from '../utils/motion';

gsap.registerPlugin(ScrollTrigger);

const STATEMENT = [
  { text: 'Designing seamless,' },
  { text: 'user-centered', highlight: 'green' },
  { text: 'experiences', highlight: 'pink' },
  { text: 'that drive' },
  { text: 'engagement and' },
  { text: 'innovation.', highlight: 'purple' },
];

// Dark ink on every highlight keeps the text above WCAG AA contrast.
const HIGHLIGHTS = {
  green: { className: 'bg-neon-green text-bg-primary', shadow: '0 0 20px rgb(190 255 70 / 0.3)' },
  pink: { className: 'bg-neon-pink text-bg-primary', shadow: '0 0 20px rgb(255 107 157 / 0.3)' },
  purple: { className: 'bg-neon-purple text-bg-primary', shadow: '0 0 20px rgb(139 92 246 / 0.3)' },
};

// Words are inline-blocks (for the reveal) separated by real spaces, so lines
// wrap and centre naturally.
const WORDS = STATEMENT.flatMap((part) =>
  part.highlight ? [part] : part.text.split(' ').map((text) => ({ text })),
);

const Intro = () => {
  const sectionRef = useRef(null);
  const textRef = useRef(null);
  const imageRef = useRef(null);
  const sticker1Ref = useRef(null);
  const sticker2Ref = useRef(null);
  const parallax1Ref = useRef(null);
  const parallax2Ref = useRef(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const stickers = [sticker1Ref.current, sticker2Ref.current];

      gsap.fromTo(
        textRef.current.querySelectorAll('.intro-word'),
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.06,
          ease: 'power3.out',
          scrollTrigger: { trigger: textRef.current, start: 'top 80%', once: true },
        },
      );

      gsap.fromTo(
        imageRef.current,
        { clipPath: 'inset(100% 0 0 0)' },
        {
          clipPath: 'inset(0% 0 0 0)',
          duration: 1.2,
          ease: 'power4.inOut',
          scrollTrigger: { trigger: imageRef.current, start: 'top 80%', once: true },
        },
      );

      stickers.forEach((sticker, index) => {
        gsap.fromTo(
          sticker,
          { scale: 0, rotation: gsap.utils.random(-30, 30), opacity: 0 },
          {
            scale: 1,
            rotation: 0,
            opacity: 1,
            duration: 0.8,
            delay: index * 0.2,
            ease: 'back.out(2)',
            scrollTrigger: { trigger: sectionRef.current, start: 'top 60%', once: true },
          },
        );
      });

      // Idle motion (photo drift + floating stickers) only runs while the
      // section is on screen. The photo is over-scaled so the frame never shows.
      const image = imageRef.current.querySelector('img');
      gsap.set(image, { scale: 1.06 });
      const idle = gsap.timeline({ paused: true, repeat: -1, yoyo: true });
      idle.to(image, { y: -12, duration: 3, ease: 'sine.inOut' }, 0);
      // y only: the entrance tween above owns the stickers' scale and rotation.
      stickers.forEach((sticker) => {
        idle.to(sticker, { y: gsap.utils.random(-20, -10), duration: 3, ease: 'sine.inOut' }, 0);
      });
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top bottom',
        end: 'bottom top',
        onToggle: ({ isActive }) => (isActive ? idle.play() : idle.pause()),
      });

      // Mouse parallax on the sticker wrappers. The outer element takes the
      // parallax, the inner one the entrance/float, so transforms never fight.
      if (!hasFinePointer()) return;
      const movers = [
        { element: parallax1Ref.current, fx: 10, fy: 7.5 },
        { element: parallax2Ref.current, fx: -7.5, fy: -10 },
      ].map(({ element, fx, fy }) => ({
        fx,
        fy,
        x: gsap.quickTo(element, 'x', { duration: 0.3, ease: 'power2.out' }),
        y: gsap.quickTo(element, 'y', { duration: 0.3, ease: 'power2.out' }),
      }));
      const onMove = (event) => {
        const nx = (event.clientX / window.innerWidth - 0.5) * 2;
        const ny = (event.clientY / window.innerHeight - 0.5) * 2;
        movers.forEach((mover) => {
          mover.x(nx * mover.fx);
          mover.y(ny * mover.fy);
        });
      };
      window.addEventListener('pointermove', onMove, { passive: true });
      return () => window.removeEventListener('pointermove', onMove);
    },
    { scope: sectionRef },
  );

  return (
    <section id="intro" ref={sectionRef} tabIndex={-1} aria-labelledby="intro-heading" className="section-y relative">
      <div className="container-page">
        <div className="grid grid-cols-1 items-stretch overflow-hidden rounded-[18px] border border-white/10 lg:grid-cols-2">
          {/* Statement */}
          <div className="relative flex items-center justify-center border-b border-white/10 px-6 py-14 text-center sm:px-10 sm:py-16 lg:border-r lg:border-b-0 lg:px-12">
            <h2
              id="intro-heading"
              ref={textRef}
              className="mx-auto max-w-[18ch] text-[clamp(2rem,6.5vw,3.75rem)] leading-[1.32] font-bold tracking-tight lg:text-[clamp(2.5rem,3.4vw,3.5rem)]"
            >
              {WORDS.map((word, index) => {
                const highlight = word.highlight && HIGHLIGHTS[word.highlight];
                return (
                  <span key={index}>
                    <span className="intro-word inline-block">
                      {highlight ? (
                        <span
                          className={`${highlight.className} inline-block rounded-[0.14em] px-[0.22em] pb-[0.04em] leading-[1.15]`}
                          style={{ boxShadow: highlight.shadow }}
                        >
                          {word.text}
                        </span>
                      ) : (
                        word.text
                      )}
                    </span>{' '}
                  </span>
                );
              })}
            </h2>

            <div ref={parallax1Ref} aria-hidden="true" className="pointer-events-none absolute top-3 left-3 select-none sm:top-6 sm:left-6">
              <div ref={sticker1Ref} className="text-3xl md:text-5xl">
                🐰
              </div>
            </div>
            <div ref={parallax2Ref} aria-hidden="true" className="pointer-events-none absolute right-3 bottom-3 select-none sm:right-6 sm:bottom-6">
              <div ref={sticker2Ref} className="text-3xl md:text-5xl">
                🐇
              </div>
            </div>
          </div>

          {/* Portrait (fixed ratio: no layout shift while it loads) */}
          <div className="relative aspect-[3/4] sm:aspect-[4/3] lg:aspect-auto lg:min-h-[36rem]">
            <div ref={imageRef} className="absolute inset-0 shadow-[inset_0_0_0_1px_rgb(255_255_255/0.08)]">
              <div
                className="relative size-full overflow-hidden"
                style={{
                  background:
                    'linear-gradient(135deg, rgb(41 30 93 / 0.4) 0%, rgb(48 35 110 / 0.12) 22%, rgb(8 13 40 / 0.8) 44%, rgb(10 15 42 / 0.88) 100%)',
                }}
              >
                <img
                  src={portrait}
                  alt="Illustrated portrait of Umme Kulsum Suriya sketching wireframes at a drawing desk, with a cat beside the desk"
                  width={896}
                  height={1194}
                  loading="lazy"
                  decoding="async"
                  className="size-full object-cover object-[60%_center]"
                />
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background: 'linear-gradient(180deg, rgb(5 8 24 / 0) 48%, rgb(5 8 24 / 0.16) 72%, rgb(5 8 24 / 0.45) 100%)',
                  }}
                />
                <div className="absolute top-3 left-3 rounded-lg bg-white/90 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-bg-tertiary sm:top-5 sm:left-5 sm:px-3 sm:text-xs">
                  Portfolio Portrait
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Intro;
