import { useRef } from 'react';
import { Link } from 'react-router';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { HiArrowRight } from 'react-icons/hi2';
import { revealOnScroll } from '../animations/reveal';
import ProjectCard from '../components/ProjectCard';
import { prefersReducedMotion } from '../utils/motion';

gsap.registerPlugin(ScrollTrigger);

// Matches Tailwind's `md` breakpoint used by the layout classes below.
const DESKTOP = '(min-width: 768px)';
const MOBILE = '(max-width: 767.98px)';

const CARD_WRAPPER = 'project-card-wrapper w-full max-w-80 shrink-0 md:w-80';

/**
 * Home page project strip: a pinned horizontal scroll on desktop, a stack on
 * mobile. With reduced motion the desktop layout becomes a wrapped grid, so
 * nothing moves sideways while scrolling.
 */
const ProjectIndex = ({ projects = [], totalCount = 0, isLoading = false }) => {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  // Re-run the animation setup only when the list of cards actually changes.
  const signature = isLoading ? 'loading' : projects.map((project) => project.id).join('|');
  const hasMore = totalCount > projects.length;

  useGSAP(
    () => {
      if (isLoading) return;
      const track = trackRef.current;
      const section = sectionRef.current;
      const cards = track.querySelectorAll('.project-card-wrapper');
      if (!cards.length || prefersReducedMotion()) return;

      const mm = gsap.matchMedia();
      mm.add(MOBILE, () => revealOnScroll(cards, { y: 40 }));
      mm.add(DESKTOP, () => {
        // The track's side padding centres the first card; scroll until the
        // last one is centred too, so every card passes through the middle
        // at any screen width. (scrollWidth would ignore the end padding.)
        const items = track.children;
        const centre = (element) => element.offsetLeft + element.offsetWidth / 2;
        const distance = () => Math.max(0, centre(items[items.length - 1]) - centre(items[0]));
        if (distance() > 0) {
          gsap.to(track, {
            x: () => -distance(),
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'top top',
              end: () => `+=${distance()}`,
              pin: true,
              scrub: 1,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          });
        }
        gsap.fromTo(
          cards,
          { y: 60, opacity: 0, scale: 0.9 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.8,
            stagger: 0.15,
            ease: 'power3.out',
            scrollTrigger: { trigger: section, start: 'top 80%', once: true },
          },
        );
      });
      return () => mm.revert();
    },
    { scope: sectionRef, dependencies: [signature], revertOnUpdate: true },
  );

  return (
    <section
      id="projects"
      ref={sectionRef}
      tabIndex={-1}
      aria-labelledby="projects-heading"
      className="section-y relative overflow-hidden md:min-h-screen md:py-0"
    >
      {/* A normal title on mobile, the large vertical watermark on desktop */}
      <div className="container-page mb-8 md:pointer-events-none md:absolute md:inset-y-0 md:left-8 md:z-0 md:mb-0 md:flex md:w-auto md:max-w-none md:items-center md:px-0">
        <h2
          id="projects-heading"
          className="text-[clamp(2.25rem,9vw,3rem)] leading-none font-bold tracking-tight text-white md:text-[9rem] md:text-white/[0.13] md:[writing-mode:vertical-lr] lg:text-[10rem]"
        >
          Projects
        </h2>
      </div>

      <div className="relative z-10 md:flex md:h-screen md:items-center md:motion-reduce:h-auto md:motion-reduce:py-28">
        <ul
          ref={trackRef}
          className="container-page flex flex-col items-center gap-8 md:mx-0 md:max-w-none md:flex-row md:gap-12 md:px-[max(1rem,calc(50%-10rem))] md:motion-reduce:mx-auto md:motion-reduce:max-w-[88rem] md:motion-reduce:flex-wrap md:motion-reduce:justify-center md:motion-reduce:px-[clamp(1rem,5vw,5rem)]"
          aria-busy={isLoading || undefined}
        >
          {isLoading &&
            [0, 1, 2].map((index) => (
              <li key={index} className={CARD_WRAPPER} aria-hidden="true">
                <div className="skeleton aspect-[4/7] rounded-[14px] md:max-h-[calc(100svh-6rem)]" />
              </li>
            ))}

          {!isLoading &&
            projects.map((project, index) => (
              <li key={project.id} className={CARD_WRAPPER}>
                <ProjectCard project={project} number={String(index + 1).padStart(2, '0')} eager={index === 0} />
              </li>
            ))}

          {!isLoading && hasMore && (
            <li className={CARD_WRAPPER}>
              <Link
                to="/projects"
                className="group flex aspect-[4/7] flex-col items-center justify-center gap-4 rounded-[14px] border border-dashed border-white/25 bg-white/[0.03] p-8 text-center transition-colors duration-300 hover:border-neon-green/60 hover:bg-white/[0.06] md:max-h-[calc(100svh-6rem)]"
                data-cursor-text="All"
              >
                <span className="grid size-14 place-items-center rounded-full bg-neon-green text-2xl text-bg-primary transition-transform duration-300 group-hover:translate-x-1">
                  <HiArrowRight aria-hidden="true" />
                </span>
                <span className="text-2xl font-bold text-white">All projects</span>
                <span className="text-sm text-text-secondary">Browse all {totalCount} case studies</span>
              </Link>
            </li>
          )}

          {!isLoading && projects.length === 0 && (
            <li className="w-full max-w-md text-center md:w-[28rem]">
              <p className="text-2xl font-bold text-white">New case studies are on the way.</p>
              <p className="mt-3 text-text-secondary">Check back soon to see the latest work.</p>
            </li>
          )}
        </ul>
      </div>
    </section>
  );
};

export default ProjectIndex;
