import { useEffect, useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ProjectCard from '../components/ProjectCard';
import CaseStudyModal from '../components/CaseStudyModal';
import { projectsData } from '../data/projectsData';

gsap.registerPlugin(ScrollTrigger);

const ProjectIndex = () => {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 768px)');
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useGSAP(() => {
    const track = trackRef.current;
    const section = sectionRef.current;
    const cards = track?.querySelectorAll('.project-card-wrapper');
    if (!track || !section || !cards?.length) return;

    if (isMobile) {
      gsap.set(track, { x: 0 });
      gsap.fromTo(
        cards,
        { y: 40, opacity: 0, scale: 0.97 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 82%',
            toggleActions: 'play none none none',
          },
        }
      );
      return;
    }

    const getTotalScroll = () => {
      const viewportWidth = section.clientWidth;
      return Math.max(0, track.scrollWidth - viewportWidth);
    };

    const totalScroll = getTotalScroll();

    if (totalScroll <= 0) {
      gsap.set(track, { x: 0 });
      gsap.set(cards, { y: 0, opacity: 1, scale: 1 });
      return;
    }

    // Horizontal scroll
    gsap.to(track, {
      x: () => -getTotalScroll(),
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        pin: true,
        anticipatePin: 1,
        scrub: 1,
        end: () => `+=${getTotalScroll()}`,
        invalidateOnRefresh: true,
      },
    });

    // Card stagger reveal
    gsap.fromTo(cards, { y: 60, opacity: 0, scale: 0.9 }, {
      y: 0, opacity: 1, scale: 1, duration: 0.8, stagger: 0.15, ease: 'power3.out',
      scrollTrigger: {
        trigger: section,
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
    });
  }, { dependencies: [isMobile], scope: sectionRef });

  return (
    <>
      <section id="projects" ref={sectionRef} className="relative overflow-hidden" style={{ minHeight: isMobile ? 'auto' : '100vh' }}>
        {/* INDEX text */}
        <div className="hidden md:block absolute left-2 md:left-8 top-1/2 -translate-y-1/2 z-0 pointer-events-none">
          <h2 className="text-[6rem] md:text-[9rem] lg:text-[10rem] font-bold text-white/[0.13] leading-none tracking-tight"
            style={{ writingMode: 'vertical-lr', fontFamily: 'var(--font-family-primary)' }}>
            Projects
          </h2>
        </div>

        {/* Content */}
        <div className={`relative z-10 ${isMobile ? 'py-8' : 'flex items-center h-screen'}`}>
          <div
            ref={trackRef}
            className={`${isMobile ? 'flex flex-col items-center gap-6 px-4' : 'flex items-center gap-8 md:gap-12'} will-change-transform`}
            style={
              isMobile
                ? undefined
                : {
                    paddingLeft: 'max(1rem, calc(50vw - 160px))',
                    paddingRight: 'max(1rem, calc(50vw - 160px))',
                  }
            }
          >
            {projectsData.map((project) => (
              <div key={project.id} className="project-card-wrapper opacity-0 will-change-transform">
                <ProjectCard project={project} onClick={setSelectedProject} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Case Study Modal */}
      {selectedProject && (
        <CaseStudyModal project={selectedProject} onClose={() => setSelectedProject(null)} />
      )}
    </>
  );
};

export default ProjectIndex;
