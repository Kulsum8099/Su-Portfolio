import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import FloatingBadge from "../components/FloatingBadge";

const Hero = () => {
  const heroRef = useRef(null);
  const titleRef = useRef(null);
  const yearRef = useRef(null);
  const adminRef = useRef(null);
  const smileyRef = useRef(null);
  const flowerRef = useRef(null);
  const scrollIndicatorRef = useRef(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({ delay: 3.2 });

      // Year reveal
      tl.fromTo(
        yearRef.current,
        { y: 30, opacity: 0, scale: 0.8 },
        { y: 0, opacity: 1, scale: 1, duration: 0.7, ease: "back.out(1.7)" }
      );

      // Title reveal - character by character
      const chars = titleRef.current?.querySelectorAll(".hero-char");
      if (chars) {
        tl.fromTo(
          chars,
          { y: 80, opacity: 0, rotationX: -90 },
          {
            y: 0,
            opacity: 1,
            rotationX: 0,
            duration: 0.8,
            stagger: 0.05,
            ease: "back.out(1.5)",
          },
          "-=0.3"
        );
      }

      // Badges stagger
      tl.fromTo(
        ".hero-badge",
        { y: 40, opacity: 0, scale: 0.5 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.6,
          stagger: 0.12,
          ease: "back.out(2)",
        },
        "-=0.4"
      );

      // Flower
      tl.fromTo(
        flowerRef.current,
        { scale: 0, rotation: 90, opacity: 0 },
        {
          scale: 1,
          rotation: 0,
          opacity: 1,
          duration: 0.6,
          ease: "back.out(2)",
        },
        "-=0.6"
      );

      // // Admin button
      // tl.fromTo(
      //   adminRef.current,
      //   { y: 30, opacity: 0 },
      //   { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' },
      //   '-=0.4'
      // );

      // Continuous floating for smiley
      gsap.to(smileyRef.current, {
        y: -20,
        rotation: 10,
        duration: 3,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        delay: 4,
      });

      // Continuous floating for flower
      gsap.to(flowerRef.current, {
        y: -15,
        rotation: -15,
        duration: 2.5,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        delay: 4.2,
      });

      // Admin floating
      gsap.to(adminRef.current, {
        y: -8,
        duration: 2,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        delay: 4.5,
      });

      // Scroll indicator fade in and pulse
      tl.fromTo(
        scrollIndicatorRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" },
        "-=0.2"
      );

      gsap.to(scrollIndicatorRef.current, {
        y: 8,
        duration: 1.5,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        delay: 4.2,
      });
    },
    { scope: heroRef }
  );

  const titleText = "portFolio";

  return (
    <section
      id="hero"
      ref={heroRef}
      className="section-container flex items-center justify-center relative"
      style={{ minHeight: "100vh" }}
    >
      {/* Main content */}
      <div className="relative z-10 text-center px-4">
        {/* Year */}
        <div
          ref={yearRef}
          className="mb-3 md:mb-4 opacity-0 md:-translate-x-[32%]"
        >
          <span
            className="text-neon-green text-2xl sm:text-3xl md:text-5xl font-bold tracking-wide"
            style={{
              fontFamily: "var(--font-family-pixel)",
              textShadow: "0 0 20px rgba(190, 255, 70, 0.5)",
            }}
          >
            {new Date().getFullYear()}
          </span>
        </div>

        {/* Title */}
        <h1
          ref={titleRef}
          className="text-[2.25rem] sm:text-6xl md:text-7xl lg:text-[5.3rem] xl:text-[6.4rem] font-bold leading-[0.95] tracking-[-0.04em] whitespace-normal sm:whitespace-nowrap"
          style={{
            fontFamily: "var(--font-family-pixel)",
            perspective: "800px",
          }}
        >
          {titleText.split("").map((char, i) => (
            <span
              key={i}
              className="hero-char inline-block opacity-0 text-white"
              style={{
                textShadow:
                  "0 0 30px rgba(255,255,255,0.1), 0 0 60px rgba(139, 92, 246, 0.1)",
              }}
            >
              {char}
            </span>
          ))}
        </h1>

        {/* Floating badges */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 md:gap-3 mt-6 md:mt-7">
          <div className="hero-badge opacity-0">
            {/* <FloatingBadge
              text="UX-UI Design"
              color="pink"
              icon="🌸"
              delay={0.2}
            /> */}
            <FloatingBadge text="UX-UI Design" color="pink" delay={0.2} />
          </div>
          <div className="hero-badge opacity-0">
            <FloatingBadge text="Branding" color="green" delay={0.4} />
          </div>
          <div className="hero-badge opacity-0">
            <FloatingBadge
              text="By Umme Kulsum Suriya"
              color="purple"
              delay={0.6}
            />
          </div>
        </div>
      </div>

      {/* Floating smiley
      <div
        ref={smileyRef}
        className="absolute top-[16%] right-[6%] md:top-[21%] md:right-[22%] text-4xl md:text-7xl opacity-0 select-none"
        style={{ filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.3))' }}
        data-cursor-text="Hi!"
      >
        <div className="w-11 h-11 sm:w-14 sm:h-14 md:w-[74px] md:h-[74px] rounded-full bg-[#E9DD7D] border-2 border-white/80 flex items-center justify-center text-2xl sm:text-3xl md:text-4xl shadow-lg">
          😊
        </div>
      </div> */}

      {/* Floating flower */}
      <div
        ref={flowerRef}
        className="absolute bottom-[31%] left-[6%] md:bottom-[35%] md:left-[18%] z-10 text-3xl md:text-5xl opacity-0 select-none"
        data-cursor-text="✿"
      >
        🌸
      </div>

      {/* Scroll Down Indicator */}
      <div
        ref={scrollIndicatorRef}
        className="absolute bottom-8 right-8 md:bottom-12 md:right-12 z-10 opacity-0"
      >
        <div className="relative flex items-center justify-center">
          {/* Capsule outline */}
          <svg
            className="w-8 h-12 md:w-10 md:h-14"
            viewBox="0 0 40 60"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <rect x="8" y="5" width="24" height="50" rx="12" ry="12" />
          </svg>

          {/* Animated dot inside */}
          <div
            className="absolute w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-white/50"
            style={{
              animation: "scrollDotBounce 1.5s ease-in-out infinite",
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes scrollDotBounce {
          0%, 100% {
            transform: translateY(-4px);
            opacity: 0.8;
          }
          50% {
            transform: translateY(8px);
            opacity: 0.4;
          }
        }
      `}</style>

      {/* Admin button
      <div
        ref={adminRef}
        className="absolute bottom-[8%] right-[5%] md:bottom-[20%] md:right-[21%] z-10 opacity-0"
      >
        <button
          className="px-5 sm:px-7 py-2 sm:py-2.5 rounded-[999px] text-xl sm:text-[1.75rem] leading-none font-bold text-bg-primary bg-neon-green shadow-[0_8px_0_rgba(0,0,0,0.85),0_16px_28px_rgba(0,0,0,0.45)] md:shadow-[0_10px_0_rgba(0,0,0,0.85),0_24px_40px_rgba(0,0,0,0.5)] transition-shadow duration-300 will-change-transform"
          data-cursor-text="Admin"
          style={{ fontFamily: 'var(--font-family-primary)' }}
        >
          admin
        </button>
        Arrow decoration
        <div className="absolute -top-1 -left-4 text-neon-green text-lg rotate-[14deg]">
          <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2 12 L17 4 L9 18 Z" />
          </svg>
        </div>
      </div> */}
    </section>
  );
};

export default Hero;
