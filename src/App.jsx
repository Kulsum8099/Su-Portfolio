import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import Lenis from 'lenis';

import Loader from './components/Loader';
import CustomCursor from './components/CustomCursor';
import Background from './components/Background';
import Hero from './sections/Hero';
import Intro from './sections/Intro';
import Resume from './sections/Resume';
import ProjectIndex from './sections/ProjectIndex';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const mainRef = useRef(null);
  const lenisRef = useRef(null);

  // Initialize Lenis smooth scrolling
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    lenisRef.current = lenis;

    // Connect Lenis to GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      gsap.ticker.remove(lenis.raf);
    };
  }, []);

  // Handle loader completion
  const handleLoaderComplete = () => {
    setIsLoading(false);
    // Refresh ScrollTrigger after content is shown
    setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);
  };

  return (
    <>
      {/* Custom Cursor */}
      <CustomCursor />

      {/* Background System */}
      <Background />

      {/* Loader */}
      {isLoading && <Loader onComplete={handleLoaderComplete} />}

      {/* Main Content */}
      <main ref={mainRef} className="relative z-10">
        <Hero />
        <Intro />
        <Resume />
        <ProjectIndex />

        <footer className="relative z-10 px-4 sm:px-5 md:px-12 lg:px-20 pb-10 md:pb-14 pt-12 md:pt-16">
          <div className="max-w-7xl mx-auto rounded-2xl border border-dashed border-white/20 bg-[#090D25]/80 backdrop-blur-sm px-6 md:px-10 py-8 md:py-10 text-center">
            <div className="flex flex-col md:flex-row md:items-center md:justify-center gap-8 md:gap-10">
              <div className="max-w-2xl mx-auto">
                <p className="text-neon-green text-sm md:text-base tracking-[0.18em] uppercase mb-2">Let&apos;s Collaborate</p>
                <h3 className="text-2xl sm:text-3xl md:text-5xl font-bold text-white leading-tight" style={{ fontFamily: 'var(--font-family-primary)' }}>
                  Build your next
                  <span className="text-neon-pink"> standout product</span>
                </h3>
                <p className="text-text-secondary mt-4 max-w-xl">
                  Open for product design, UX strategy, and end-to-end UI systems.
                </p>
              </div>

              <a
                href="mailto:hello@suriya.design"
                className="inline-flex w-full md:w-auto items-center justify-center px-4 sm:px-6 py-3 rounded-xl bg-neon-green text-bg-primary text-sm sm:text-base font-bold break-all shadow-[0_8px_24px_rgba(190,255,70,0.35)] hover:shadow-[0_12px_30px_rgba(190,255,70,0.45)] transition-shadow"
                data-cursor-text="Email"
              >
                hello@suriya.design
              </a>
            </div>

            <div className="mt-8 pt-5 border-t border-white/10 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-center text-sm text-text-secondary">
              <div className="flex flex-wrap items-center justify-center gap-4">
                <a href="#hero" className="hover:text-white transition-colors">Home</a>
                <a href="#projects" className="hover:text-white transition-colors">Projects</a>
                <a href="#resume" className="hover:text-white transition-colors">Resume</a>
              </div>
              <p>© 2025 Umme Kulsum Suriya</p>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}

export default App;
