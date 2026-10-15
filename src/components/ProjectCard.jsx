import { useRef } from 'react';
import { Link } from 'react-router';
import gsap from 'gsap';
import { HiArrowUpRight } from 'react-icons/hi2';
import { prefetchCaseStudy } from '../lib/content';
import { loadCaseStudyPage } from '../routes/lazyPages';
import { accentStyles } from '../utils/accents';
import { hasFinePointer, prefersReducedMotion } from '../utils/motion';

let hoverMotion;
const canAnimateHover = () => (hoverMotion ??= hasFinePointer() && !prefersReducedMotion());

/** Tall portfolio card; the whole card links to the project's case study. */
// Warm both the page's code and its data as soon as a visitor shows intent.
const prefetch = (slug) => {
  loadCaseStudyPage().catch(() => {});
  prefetchCaseStudy(slug);
};

const ProjectCard = ({ project, number, showFeatured = false, eager = false }) => {
  const cardRef = useRef(null);
  const imageRef = useRef(null);
  const accent = accentStyles(project.accent);
  const cover = project.coverImage?.url;

  const handleEnter = () => {
    prefetch(project.slug);
    if (!canAnimateHover()) return;
    gsap.to(cardRef.current, { y: -10, scale: 1.02, duration: 0.45, ease: 'power3.out', overwrite: 'auto' });
    gsap.to(imageRef.current, { scale: 1.06, duration: 0.6, ease: 'power3.out', overwrite: 'auto' });
  };

  const handleLeave = () => {
    if (!canAnimateHover()) return;
    gsap.to(cardRef.current, { y: 0, scale: 1, duration: 0.6, ease: 'power3.out', overwrite: 'auto' });
    gsap.to(imageRef.current, { scale: 1, duration: 0.6, ease: 'power3.out', overwrite: 'auto' });
  };

  return (
    <article
      ref={cardRef}
      className="group relative w-full"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onFocus={() => prefetch(project.slug)}
    >
      <div className="relative rounded-[14px] bg-white/95 p-2.5 shadow-[0_22px_48px_rgb(0_0_0/0.36)] ring-1 ring-white/50 md:p-3">
        {/* Fixed ratio keeps every card the same shape; the max-height keeps
            it inside the pinned viewport on short desktop screens. */}
        <div className="relative aspect-[4/7] overflow-hidden rounded-[10px] bg-bg-secondary md:max-h-[calc(100svh-6rem)]">
          <div ref={imageRef} className="size-full">
            {cover ? (
              <img
                src={cover}
                alt=""
                loading={eager ? 'eager' : 'lazy'}
                decoding="async"
                className="size-full object-cover"
              />
            ) : (
              <div className="flex size-full items-center justify-center bg-bg-tertiary">
                <span className="text-sm text-text-secondary">Preview coming soon</span>
              </div>
            )}
          </div>

          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, rgb(5 8 24 / 0) 52%, rgb(5 8 24 / 0.82) 86%, rgb(5 8 24 / 0.96) 100%)',
            }}
          />

          <div className="absolute top-4 right-16 left-4 z-10 flex flex-wrap gap-2">
            {project.category && (
              <span className={`${accent.chip} rounded-lg px-3 py-1 text-[11px] font-bold tracking-wide md:text-xs`}>
                {project.category}
              </span>
            )}
            {showFeatured && project.featured && (
              <span className="rounded-lg bg-white/90 px-2.5 py-1 text-[11px] font-bold text-bg-primary md:text-xs">
                ★ Featured
              </span>
            )}
          </div>

          <span
            className="absolute top-3.5 right-3.5 z-10 grid size-9 place-items-center rounded-full bg-white/15 text-lg text-white backdrop-blur-sm transition-colors duration-300 group-hover:bg-neon-green group-hover:text-bg-primary"
            aria-hidden="true"
          >
            <HiArrowUpRight />
          </span>

          <div className="absolute right-4 bottom-4 left-4 z-10">
            {number && (
              <span className="block text-[2rem] leading-none font-bold text-white/25 md:text-[2.75rem]" aria-hidden="true">
                {number}
              </span>
            )}
            <h3 className="-mt-2 text-[clamp(1.75rem,8vw,2.25rem)] leading-[1.05] font-bold tracking-tight text-white [overflow-wrap:anywhere]">
              {project.title}
            </h3>
            {project.subtitle && (
              <p className="mt-1 text-sm leading-tight text-white/80 md:text-[15px]">{project.subtitle}</p>
            )}
          </div>
        </div>
      </div>

      {/* Whole-card hit area: a real link, so it works with keyboard, touch,
          middle-click and "open in new tab". */}
      <Link
        to={`/projects/${project.slug}`}
        className="absolute inset-0 z-20 rounded-[14px]"
        aria-label={`${project.title}: read the case study`}
        data-cursor-text="View"
      />
    </article>
  );
};

export default ProjectCard;
