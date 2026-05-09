import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import useMouseParallax from '../hooks/useMouseParallax';

gsap.registerPlugin(ScrollTrigger);

const Intro = () => {
  const sectionRef = useRef(null);
  const textRef = useRef(null);
  const imageRef = useRef(null);
  const sticker1Ref = useRef(null);
  const sticker2Ref = useRef(null);
  const mouse = useMouseParallax({ sensitivity: 0.5 });

  useGSAP(
    () => {
      // Text reveal
      const words = textRef.current?.querySelectorAll('.intro-word');
      if (words) {
        gsap.fromTo(
          words,
          { y: 60, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.06,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: textRef.current,
              start: 'top 80%',
              toggleActions: 'play none none none',
            },
          }
        );
      }

      // Image reveal
      gsap.fromTo(
        imageRef.current,
        { clipPath: 'inset(100% 0 0 0)', opacity: 0 },
        {
          clipPath: 'inset(0% 0 0 0)',
          opacity: 1,
          duration: 1.2,
          ease: 'power4.inOut',
          scrollTrigger: {
            trigger: imageRef.current,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        }
      );

      // Image floating
      gsap.to(imageRef.current, {
        y: -15,
        duration: 3,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        delay: 1,
      });

      // Sticker animations
      [sticker1Ref.current, sticker2Ref.current].forEach((sticker, i) => {
        if (!sticker) return;
        gsap.fromTo(
          sticker,
          { scale: 0, rotation: gsap.utils.random(-30, 30), opacity: 0 },
          {
            scale: 1,
            rotation: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'back.out(2)',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 60%',
              toggleActions: 'play none none none',
            },
            delay: i * 0.2,
          }
        );

        gsap.to(sticker, {
          y: gsap.utils.random(-20, -10),
          rotation: gsap.utils.random(-10, 10),
          duration: gsap.utils.random(2.5, 3.5),
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
          delay: 2 + i * 0.3,
        });
      });
    },
    { scope: sectionRef }
  );

  const renderStatement = () => {
    const parts = [
      { text: 'Designing seamless,', type: 'normal' },
      { text: 'user-centered', type: 'highlight', color: 'green' },
      { text: 'experiences', type: 'highlight', color: 'pink' },
      { text: 'that drive', type: 'normal' },
      { text: 'engagement and', type: 'normal' },
      { text: 'innovation.', type: 'highlight', color: 'purple' },
    ];

    return parts.map((part, i) => {
      if (part.type === 'highlight') {
        const colors = {
          green: {
            bg: 'bg-neon-green',
            text: 'text-bg-primary',
            shadow: '0 0 20px rgba(190, 255, 70, 0.3)',
          },
          pink: {
            bg: 'bg-neon-pink',
            text: 'text-white',
            shadow: '0 0 20px rgba(255, 107, 157, 0.3)',
          },
          purple: {
            bg: 'bg-neon-purple',
            text: 'text-white',
            shadow: '0 0 20px rgba(139, 92, 246, 0.3)',
          },
        };
        const c = colors[part.color];
        return (
          <span key={i} className="inline-block mr-2 md:mr-3 mb-1 md:mb-2">
            <span className="intro-word inline-block opacity-0">
              <span
                className={`${c.bg} ${c.text} px-3 md:px-4 py-0.5 md:py-1 rounded-[8px] inline-block font-bold`}
                style={{ boxShadow: c.shadow }}
              >
                {part.text}
              </span>
            </span>
          </span>
        );
      }
      return part.text.split(' ').map((word, j) => (
        <span key={`${i}-${j}`} className="inline-block mr-2 md:mr-3 mb-1 md:mb-2">
          <span className="intro-word inline-block opacity-0">
            {word}
          </span>
        </span>
      ));
    });
  };

  return (
    <section
      id="intro"
      ref={sectionRef}
      className="section-container py-12 md:py-20 px-4 sm:px-5 md:px-12 lg:px-20 relative"
    >
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1.02fr_0.98fr] gap-0 items-stretch min-h-[60vh] lg:min-h-[78vh] border border-white/8 rounded-[18px] overflow-hidden">
          {/* Left - Text */}
          <div className="relative flex items-center justify-center px-5 sm:px-8 md:px-14 lg:px-16 py-9 sm:py-12 md:py-16 border-b lg:border-b-0 lg:border-r border-white/8 text-center">
            <p
              ref={textRef}
              className="text-[2.1rem] sm:text-5xl md:text-6xl lg:text-[4.15rem] font-bold leading-[1.12] tracking-tight max-w-[18ch] mx-auto"
              style={{ fontFamily: 'var(--font-family-primary)' }}
            >
              {renderStatement()}
            </p>

            {/* Sticker 1 - Angry Apple */}
            <div
              ref={sticker1Ref}
              className="absolute left-3 sm:left-5 md:left-8 top-[28%] sm:top-[38%] text-3xl sm:text-4xl md:text-5xl opacity-0 select-none will-change-transform"
              style={{
                transform: `translate(${mouse.x * 20}px, ${mouse.y * 15}px)`,
                transition: 'transform 0.3s ease-out',
              }}
            >
              🐰
            </div>

            {/* Sticker 2 - Chill Pineapple */}
            <div
              ref={sticker2Ref}
              className="absolute right-4 sm:right-8 md:right-12 bottom-[11%] sm:bottom-[22%] text-3xl sm:text-4xl md:text-5xl opacity-0 select-none will-change-transform"
              style={{
                transform: `translate(${mouse.x * -15}px, ${mouse.y * -20}px)`,
                transition: 'transform 0.3s ease-out',
              }}
            >
              🐇
            </div>
          </div>

          {/* Right - Image */}
          <div className="relative h-full min-h-[320px] sm:min-h-[420px] md:min-h-[560px] lg:min-h-[640px]">
            <div
              ref={imageRef}
              className="relative h-full w-full opacity-0 will-change-transform"
              style={{
                boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)',
              }}
              data-cursor-text="View"
            >
              <div
                className="w-full h-full relative overflow-hidden"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(41,30,93,0.4) 0%, rgba(48,35,110,0.12) 22%, rgba(8,13,40,0.8) 44%, rgba(10,15,42,0.88) 100%)',
                }}
              >
                <img
                  src="https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=crop&w=1000&q=80"
                  alt="Designer portrait"
                  className="w-full h-full object-cover"
                />

                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: 'linear-gradient(180deg, rgba(5,8,24,0) 48%, rgba(5,8,24,0.16) 72%, rgba(5,8,24,0.45) 100%)',
                  }}
                />

                <div className="absolute top-3 left-3 sm:top-5 sm:left-5 px-2.5 sm:px-3 py-1 rounded-[8px] bg-white/90 text-[#10142B] text-[10px] sm:text-xs font-semibold tracking-wide">
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
