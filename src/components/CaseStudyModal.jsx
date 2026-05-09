import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { HiX } from 'react-icons/hi';

const CaseStudyModal = ({ project, onClose }) => {
  const modalRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    gsap.fromTo(modalRef.current, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'power3.out' });
    gsap.fromTo(contentRef.current, { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out', delay: 0.15 });

    const sections = contentRef.current?.querySelectorAll('.case-section');
    if (sections) {
      gsap.fromTo(sections, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.12, ease: 'power3.out', delay: 0.4 });
    }

    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleClose = () => {
    gsap.to(contentRef.current, { y: 40, opacity: 0, duration: 0.3, ease: 'power3.in' });
    gsap.to(modalRef.current, { opacity: 0, duration: 0.4, ease: 'power3.in', delay: 0.1, onComplete: onClose });
  };

  if (!project) return null;
  const d = project.details;

  return (
    <div ref={modalRef} className="fixed inset-0 z-[200] flex items-start justify-center overflow-y-auto"
      style={{ background: 'rgba(7,8,22,0.95)', backdropFilter: 'blur(20px)' }}>
      {/* Close */}
      <button onClick={handleClose} className="fixed top-6 right-6 z-[201] w-12 h-12 rounded-full glass flex items-center justify-center text-white hover:text-neon-pink transition-colors" data-cursor-text="Close">
        <HiX className="text-xl" />
      </button>

      <div ref={contentRef} className="w-full max-w-4xl px-6 py-20">
        {/* Hero */}
        <div className="case-section mb-16 text-center">
          <span className="text-neon-green text-sm tracking-[0.3em] uppercase mb-4 block">{project.category}</span>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-4" style={{ fontFamily: 'var(--font-family-primary)' }}>{project.title}</h1>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">{project.description}</p>
        </div>

        {/* Problem */}
        <div className="case-section mb-12">
          <h2 className="text-2xl font-bold text-neon-pink mb-4">The Problem</h2>
          <p className="text-text-secondary text-base leading-relaxed">{d.problem}</p>
        </div>

        {/* Research */}
        <div className="case-section mb-12">
          <h2 className="text-2xl font-bold text-neon-green mb-4">Research</h2>
          <p className="text-text-secondary text-base leading-relaxed">{d.research}</p>
        </div>

        {/* Solution */}
        <div className="case-section mb-12">
          <h2 className="text-2xl font-bold text-neon-purple mb-4">Solution</h2>
          <p className="text-text-secondary text-base leading-relaxed">{d.solution}</p>
        </div>

        {/* Results */}
        <div className="case-section mb-12">
          <h2 className="text-2xl font-bold text-electric-blue mb-6">Results</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {d.results.map((result, i) => (
              <div key={i} className="glass rounded-2xl p-6 text-center">
                <p className="text-white font-semibold">{result}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Back */}
        <div className="case-section text-center pt-8">
          <button onClick={handleClose} className="px-8 py-3 rounded-full bg-neon-green text-bg-primary font-bold hover:shadow-[0_0_30px_rgba(190,255,70,0.4)] transition-shadow" data-cursor-text="Back">
            ← Back to Projects
          </button>
        </div>
      </div>
    </div>
  );
};

export default CaseStudyModal;
