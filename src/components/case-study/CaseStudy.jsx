import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { HiArrowLeft, HiArrowRight, HiArrowUpRight } from 'react-icons/hi2';
import { revealOnScroll } from '../../animations/reveal';
import { scrollToElement } from '../../lib/smoothScroll';
import { accentStyles } from '../../utils/accents';
import { prefersReducedMotion } from '../../utils/motion';
import { Features, Gallery, Goals, Outcomes, Process, Prose } from './CaseStudyBlocks';

/** Only the sections that have content are shown (and listed in the contents). */
function buildSections(caseStudy, accent) {
  const cs = caseStudy ?? {};
  return [
    cs.overview && { id: 'overview', title: 'Overview', body: <Prose text={cs.overview} /> },
    cs.problem && { id: 'problem', title: 'The problem', body: <Prose text={cs.problem} /> },
    cs.goals?.length > 0 && { id: 'goals', title: 'Goals', body: <Goals items={cs.goals} accent={accent} /> },
    cs.research && { id: 'research', title: 'Research', body: <Prose text={cs.research} /> },
    cs.solution && { id: 'solution', title: 'The solution', body: <Prose text={cs.solution} /> },
    cs.features?.length > 0 && {
      id: 'features',
      title: 'Key features',
      body: <Features items={cs.features} accent={accent} />,
    },
    cs.process?.length > 0 && { id: 'process', title: 'Process', body: <Process steps={cs.process} accent={accent} /> },
    cs.gallery?.length > 0 && { id: 'screens', title: 'Screens', body: <Gallery images={cs.gallery} /> },
    cs.outcomes?.length > 0 && {
      id: 'outcomes',
      title: 'Outcomes',
      body: <Outcomes items={cs.outcomes} accent={accent} />,
    },
  ].filter(Boolean);
}

const jumpTo = (event, id) => {
  event.preventDefault();
  scrollToElement(`#cs-${id}`);
  requestAnimationFrame(() => document.getElementById(`cs-${id}-title`)?.focus({ preventScroll: true }));
};

const Cover = ({ image, title }) => {
  if (!image?.url) return null;
  const ratio = image.width && image.height ? image.width / image.height : null;
  return (
    <div
      className="cs-cover mx-auto rounded-[20px] bg-white/95 p-2 shadow-[0_30px_70px_rgb(0_0_0/0.4)] sm:p-3"
      // Known proportions: size the frame so the image is never taller than the viewport.
      style={ratio ? { maxWidth: `calc(78svh * ${ratio.toFixed(4)})` } : undefined}
    >
      <img
        src={image.url}
        alt={image.alt || `${title} cover image`}
        width={image.width ?? undefined}
        height={image.height ?? undefined}
        fetchPriority="high"
        decoding="async"
        className={`w-full rounded-[13px] bg-white ${ratio ? 'h-auto' : 'max-h-[78svh] object-contain'}`}
      />
    </div>
  );
};

const CaseStudy = ({ project, next, preview = false }) => {
  const rootRef = useRef(null);
  const accent = accentStyles(project.accent);
  const sections = buildSections(project.caseStudy, accent);
  const [active, setActive] = useState(sections[0]?.id);
  const meta = [
    ['Role', project.role],
    ['Client', project.client],
    ['Timeline', project.timeline],
  ].filter(([, value]) => value);
  const technologies = project.technologies ?? [];
  const links = project.links ?? [];

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.fromTo(
        '.cs-hero-item',
        { y: 28, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.07, ease: 'power3.out' },
      );
      gsap.fromTo('.cs-cover', { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1, delay: 0.25, ease: 'power3.out' });
      revealOnScroll(rootRef.current.querySelectorAll('.cs-reveal'));
    },
    { scope: rootRef },
  );

  // Highlight the section being read in the table of contents.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.dataset.section);
      },
      { rootMargin: '-30% 0px -65% 0px' },
    );
    rootRef.current?.querySelectorAll('[data-section]').forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [project.id]);

  return (
    <article ref={rootRef} className="pb-8" aria-labelledby="cs-title">
      <header className="container-page pt-28 sm:pt-32">
        {preview && (
          <div
            className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neon-green/30 bg-neon-green/10 px-4 py-3 text-sm"
            role="status"
          >
            <p>
              <strong className="text-neon-green">Preview.</strong>{' '}
              {project.status === 'draft'
                ? 'This draft is only visible to signed-in admins.'
                : 'This is how visitors see the published case study.'}
            </p>
            <Link to={`/admin/projects/${project.id}`} className="btn btn-sm btn-secondary">
              Back to editor
            </Link>
          </div>
        )}

        <Link
          to="/projects"
          className="cs-hero-item inline-flex items-center gap-2 rounded-lg py-1 text-sm font-medium text-text-secondary transition-colors hover:text-white"
        >
          <HiArrowLeft aria-hidden="true" /> All projects
        </Link>

        {project.category && (
          <p className="cs-hero-item mt-8">
            <span className={`${accent.chip} inline-block rounded-lg px-3 py-1 text-xs font-bold tracking-wide`}>
              {project.category}
            </span>
          </p>
        )}
        <h1
          id="cs-title"
          className="cs-hero-item mt-5 max-w-5xl text-[clamp(2.6rem,9vw,7rem)] leading-[0.95] font-bold tracking-[-0.04em] text-balance [overflow-wrap:anywhere]"
        >
          {project.title}
        </h1>
        {project.subtitle && <p className={`cs-hero-item mt-4 text-xl font-medium sm:text-2xl ${accent.text}`}>{project.subtitle}</p>}
        {project.summary && (
          <p className="cs-hero-item mt-6 max-w-2xl text-base leading-relaxed text-text-secondary sm:text-lg">
            {project.summary}
          </p>
        )}

        {(meta.length > 0 || technologies.length > 0 || links.length > 0) && (
          <div className="cs-hero-item mt-10 flex flex-col gap-8 border-t border-white/10 pt-8 lg:flex-row lg:items-start lg:justify-between">
            <dl className="grid grid-cols-2 gap-x-8 gap-y-6 sm:flex sm:flex-wrap sm:gap-x-12">
              {meta.map(([label, value]) => (
                <div key={label}>
                  <dt className="eyebrow text-text-muted">{label}</dt>
                  <dd className="mt-2 font-medium text-white">{value}</dd>
                </div>
              ))}
              {technologies.length > 0 && (
                <div className="col-span-2">
                  <dt className="eyebrow text-text-muted">Tools &amp; technologies</dt>
                  <dd className="mt-2">
                    <ul className="flex flex-wrap gap-2">
                      {technologies.map((technology) => (
                        <li
                          key={technology}
                          className="rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 text-sm text-white/90"
                        >
                          {technology}
                        </li>
                      ))}
                    </ul>
                  </dd>
                </div>
              )}
            </dl>

            {links.length > 0 && (
              <ul className="flex flex-wrap gap-3">
                {links.map((link, index) => (
                  <li key={link.url}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`btn ${index === 0 ? 'btn-primary' : 'btn-secondary'}`}
                    >
                      {link.label}
                      <HiArrowUpRight aria-hidden="true" />
                      <span className="sr-only">(opens in a new tab)</span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </header>

      <div className="container-page mt-12 sm:mt-16">
        <Cover image={project.coverImage} title={project.title} />
      </div>

      {sections.length > 0 && (
        <div className="container-page mt-16 grid gap-12 sm:mt-24 lg:grid-cols-[12rem_minmax(0,1fr)] lg:gap-16 xl:grid-cols-[14rem_minmax(0,1fr)] xl:gap-24">
          <nav aria-label="Case study sections" className="hidden lg:block">
            <div className="sticky top-28">
              <p className="eyebrow text-text-muted">On this page</p>
              <ol className="mt-4 border-l border-white/10">
                {sections.map((section) => (
                  <li key={section.id}>
                    <a
                      href={`#cs-${section.id}`}
                      onClick={(event) => jumpTo(event, section.id)}
                      aria-current={active === section.id ? 'true' : undefined}
                      className={`-ml-px block border-l-2 py-2 pl-4 text-sm transition-colors duration-300 ${
                        active === section.id
                          ? `${accent.line} font-semibold text-white`
                          : 'border-transparent text-text-secondary hover:text-white'
                      }`}
                    >
                      {section.title}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </nav>

          <div className="min-w-0 space-y-20 sm:space-y-28">
            {sections.map((section, index) => (
              <section
                key={section.id}
                id={`cs-${section.id}`}
                data-section={section.id}
                aria-labelledby={`cs-${section.id}-title`}
                className="cs-reveal scroll-mt-28"
              >
                <div className="mb-6 flex items-baseline gap-4 sm:mb-8">
                  <span className={`font-pixel text-xs ${accent.text}`} aria-hidden="true">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h2
                    id={`cs-${section.id}-title`}
                    tabIndex={-1}
                    className="text-[clamp(1.75rem,3.5vw,2.75rem)] leading-tight font-bold tracking-tight text-white"
                  >
                    {section.title}
                  </h2>
                </div>
                {section.body}
              </section>
            ))}
          </div>
        </div>
      )}

      <section className="cs-reveal container-page mt-24 sm:mt-32" aria-label="Keep exploring">
        {next ? (
          <Link
            to={`/projects/${next.slug}`}
            className="surface group grid overflow-hidden transition-colors duration-300 hover:border-white/25 sm:grid-cols-[minmax(0,1fr)_42%]"
            data-cursor-text="Next"
          >
            <div className="flex flex-col justify-center p-7 sm:p-10">
              <p className="eyebrow text-text-muted">Next project</p>
              <p className="mt-3 text-[clamp(2rem,5vw,3.5rem)] leading-none font-bold tracking-tight text-white transition-colors duration-300 group-hover:text-neon-green">
                {next.title}
              </p>
              {next.subtitle && <p className="mt-3 text-text-secondary">{next.subtitle}</p>}
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white">
                Read the case study
                <HiArrowRight className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
              </span>
            </div>
            {next.coverImage?.url && (
              <div className="aspect-[16/10] overflow-hidden sm:aspect-auto">
                <img
                  src={next.coverImage.url}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="size-full object-cover transition-transform duration-700 ease-out-expo group-hover:scale-105"
                />
              </div>
            )}
          </Link>
        ) : (
          <Link to="/projects" className="btn btn-secondary">
            <HiArrowLeft aria-hidden="true" /> Back to all projects
          </Link>
        )}
      </section>
    </article>
  );
};

export default CaseStudy;
