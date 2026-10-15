import { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import { revealOnScroll } from '../animations/reveal';
import ProjectCard from '../components/ProjectCard';
import { usePageMeta } from '../hooks/usePageMeta';
import { useProjects } from '../lib/content';

const ALL = 'All';

const ProjectsPage = () => {
  const pageRef = useRef(null);
  const { data, isLoading } = useProjects();
  const [selected, setSelected] = useState(ALL);
  usePageMeta({
    title: 'Projects',
    description: 'UX/UI case studies by Umme Kulsum Suriya — web apps, mobile apps and websites.',
  });

  const projects = data ?? [];
  const categories = [ALL, ...new Set(projects.map((project) => project.category).filter(Boolean))];
  const category = categories.includes(selected) ? selected : ALL;
  const visible = category === ALL ? projects : projects.filter((project) => project.category === category);

  useGSAP(
    () => {
      if (!isLoading) revealOnScroll(pageRef.current.querySelectorAll('.archive-card'), { y: 40, stagger: 0.06 });
    },
    { scope: pageRef, dependencies: [isLoading, category], revertOnUpdate: true },
  );

  return (
    <div ref={pageRef} className="container-page pt-28 pb-8 sm:pt-36">
      <header className="max-w-3xl">
        <p className="eyebrow text-neon-green">Selected work</p>
        <h1 className="mt-4 text-[clamp(2.75rem,8vw,5.5rem)] leading-[0.95] font-bold tracking-[-0.04em]">
          All projects
        </h1>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-text-secondary sm:text-lg">
          Case studies covering research, interface design and the outcomes behind each product.
        </p>
      </header>

      {categories.length > 2 && (
        <div className="mt-10 flex flex-wrap gap-2" role="group" aria-label="Filter projects by category">
          {categories.map((name) => (
            <button
              key={name}
              type="button"
              aria-pressed={category === name}
              onClick={() => setSelected(name)}
              className={`btn btn-sm ${category === name ? 'btn-primary' : 'btn-secondary'}`}
            >
              {name}
            </button>
          ))}
        </div>
      )}

      <p className="sr-only" aria-live="polite">
        {isLoading ? 'Loading projects' : `${visible.length} project${visible.length === 1 ? '' : 's'} shown`}
      </p>

      <ul className="mt-10 grid grid-cols-1 justify-items-center gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {isLoading &&
          [0, 1, 2, 3].map((index) => (
            <li key={index} className="w-full max-w-80" aria-hidden="true">
              <div className="skeleton aspect-[4/7] rounded-[14px]" />
            </li>
          ))}
        {!isLoading &&
          visible.map((project) => (
            <li key={project.id} className="archive-card w-full max-w-80">
              <ProjectCard
                project={project}
                number={String(projects.indexOf(project) + 1).padStart(2, '0')}
                showFeatured
              />
            </li>
          ))}
      </ul>

      {!isLoading && visible.length === 0 && (
        <p className="py-16 text-center text-lg text-text-secondary">No projects to show yet — check back soon.</p>
      )}
    </div>
  );
};

export default ProjectsPage;
