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
import Footer from './sections/Footer';
// import ResumeSection from './components/ResumeSection';
// import Navbar from './components//Navbar';

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
      <main ref={mainRef} className="grid gap-8 md:gap-16">
        {/* <Navbar /> */}
        <Hero />
        <Intro />
        <Resume />
        {/* <ResumeSection /> */}
        <ProjectIndex />
        <Footer />
      </main>
    </>
  );
}

export default App;
