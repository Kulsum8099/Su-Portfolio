import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import {
  HiArrowDown,
  HiArrowUp,
  HiOutlineEye,
  HiOutlineMagnifyingGlass,
  HiOutlinePencilSquare,
  HiOutlinePhoto,
  HiOutlineStar,
  HiOutlineTrash,
  HiPlus,
  HiStar,
} from 'react-icons/hi2';
import { usePageMeta } from '../../hooks/usePageMeta';
import { adminApi } from '../api';
import ConfirmDialog from '../components/ConfirmDialog';
import { useToast } from '../context';

const FILTERS = [
  { id: 'all', label: 'All', test: () => true },
  { id: 'published', label: 'Published', test: (project) => project.status === 'published' },
  { id: 'draft', label: 'Drafts', test: (project) => project.status === 'draft' },
  { id: 'featured', label: 'Featured', test: (project) => project.featured },
];

const formatDate = (value) =>
  value ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(value)) : '—';

const iconButton =
  'grid size-9 place-items-center rounded-lg text-text-secondary transition-colors hover:bg-white/10 hover:text-white disabled:pointer-events-none disabled:opacity-30 sm:size-10';

const ProjectsListPage = () => {
  const notify = useToast();
  const [projects, setProjects] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  usePageMeta({ title: 'Projects · Admin', noIndex: true });

  const load = useCallback(
    () =>
      adminApi.listProjects().then(
        (list) => {
          setProjects(list);
          setLoadError(null);
        },
        (error) => setLoadError(error),
      ),
    [],
  );

  useEffect(() => {
    load();
  }, [load]);

  const counts = useMemo(
    () => Object.fromEntries(FILTERS.map((item) => [item.id, (projects ?? []).filter(item.test).length])),
    [projects],
  );

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const test = FILTERS.find((item) => item.id === filter)?.test ?? (() => true);
    return (projects ?? []).filter(
      (project) =>
        test(project) &&
        (!needle || [project.title, project.slug, project.category].some((text) => text?.toLowerCase().includes(needle))),
    );
  }, [projects, query, filter]);

  // Reordering only makes sense on the full, unfiltered list.
  const canReorder = filter === 'all' && !query.trim();

  /** Optimistic update: apply locally, roll back if the API rejects it. */
  const patch = async (project, changes, message) => {
    const previous = projects;
    setProjects((list) => list.map((item) => (item.id === project.id ? { ...item, ...changes } : item)));
    try {
      await adminApi.patchProject(project.id, changes);
      notify(message);
    } catch (error) {
      setProjects(previous);
      notify(error.message, { tone: 'error' });
    }
  };

  const move = async (index, step) => {
    const target = index + step;
    if (target < 0 || target >= projects.length) return;
    const previous = projects;
    const next = [...projects];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    setProjects(next);
    requestAnimationFrame(() => document.getElementById(`order-${item.id}-${step < 0 ? 'up' : 'down'}`)?.focus());
    try {
      await adminApi.reorderProjects(next.map((project) => project.id));
    } catch (error) {
      setProjects(previous);
      notify(error.message, { tone: 'error' });
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await adminApi.deleteProject(pendingDelete.id);
      setProjects((list) => list.filter((item) => item.id !== pendingDelete.id));
      notify(`“${pendingDelete.title}” was deleted.`);
      setPendingDelete(null);
    } catch (error) {
      notify(error.message, { tone: 'error' });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Projects</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Published projects appear on the site. Featured ones lead the home page, in the order shown here.
          </p>
        </div>
        <Link to="/admin/projects/new" className="btn btn-primary">
          <HiPlus aria-hidden="true" /> New project
        </Link>
      </div>

      {loadError && (
        <div className="surface mt-8 p-6" role="alert">
          <p className="font-semibold">Projects couldn’t be loaded.</p>
          <p className="mt-1 text-sm text-text-secondary">{loadError.message}</p>
          <button type="button" className="btn btn-secondary mt-4" onClick={load}>
            Try again
          </button>
        </div>
      )}

      {!loadError && !projects && (
        <div className="mt-8 grid gap-3" aria-busy="true" aria-label="Loading projects">
          {[0, 1, 2].map((index) => (
            <div key={index} className="skeleton h-24" />
          ))}
        </div>
      )}

      {projects && projects.length === 0 && (
        <div className="surface mt-8 flex flex-col items-center px-6 py-16 text-center">
          <HiOutlinePhoto className="text-4xl text-text-muted" aria-hidden="true" />
          <h2 className="mt-4 text-xl font-bold">No projects yet</h2>
          <p className="mt-2 max-w-md text-sm text-text-secondary">
            Create your first case study, or import the original three projects with{' '}
            <code className="text-white">npm run db:seed</code>.
          </p>
          <Link to="/admin/projects/new" className="btn btn-primary mt-6">
            <HiPlus aria-hidden="true" /> Create a project
          </Link>
        </div>
      )}

      {projects && projects.length > 0 && (
        <>
          <div className="mt-8 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filter projects">
              {FILTERS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={filter === item.id}
                  onClick={() => setFilter(item.id)}
                  className={`btn btn-sm ${filter === item.id ? 'btn-primary' : 'btn-secondary'}`}
                >
                  {item.label} <span className="opacity-70">{counts[item.id]}</span>
                </button>
              ))}
            </div>
            <div className="relative lg:w-72">
              <label htmlFor="project-search" className="sr-only">
                Search projects
              </label>
              <HiOutlineMagnifyingGlass className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-text-muted" aria-hidden="true" />
              <input
                id="project-search"
                type="search"
                className="input pl-10"
                placeholder="Search projects"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
          </div>

          {!canReorder && <p className="mt-3 text-xs text-text-muted">Clear the search and filters to change the order.</p>}

          <ul className="mt-5 grid gap-3" aria-label="Projects">
            {visible.map((project) => {
              const index = projects.indexOf(project);
              const published = project.status === 'published';
              return (
                <li
                  key={project.id}
                  className="surface grid grid-cols-[4rem_minmax(0,1fr)] items-center gap-x-4 gap-y-3 p-3 sm:grid-cols-[4.5rem_minmax(0,1fr)_auto] sm:p-4"
                >
                  <div className="size-16 overflow-hidden rounded-lg bg-white/5 sm:size-[4.5rem]">
                    {project.coverImage?.url ? (
                      <img src={project.coverImage.url} alt="" loading="lazy" className="size-full object-cover" />
                    ) : (
                      <span className="grid size-full place-items-center text-xl text-text-muted">
                        <HiOutlinePhoto aria-hidden="true" />
                      </span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        to={`/admin/projects/${project.id}`}
                        className="truncate text-base font-bold text-white hover:text-neon-green sm:text-lg"
                      >
                        {project.title}
                      </Link>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-bold tracking-wide uppercase ${
                          published ? 'bg-neon-green/15 text-neon-green' : 'bg-white/10 text-text-secondary'
                        }`}
                      >
                        {published ? 'Published' : 'Draft'}
                      </span>
                      {project.featured && (
                        <span className="rounded-full bg-neon-pink/15 px-2 py-0.5 text-[11px] font-bold tracking-wide text-neon-pink uppercase">
                          Featured
                        </span>
                      )}
                    </div>
                    <p className="mt-1 truncate text-xs text-text-muted">
                      /projects/{project.slug}
                      {project.category ? ` · ${project.category}` : ''} · Updated {formatDate(project.updatedAt)}
                    </p>
                  </div>

                  <div className="col-span-2 flex flex-wrap items-center justify-end gap-1 border-t border-white/5 pt-2 sm:col-span-1 sm:border-0 sm:pt-0">
                    <button
                      type="button"
                      className={`btn btn-sm ${published ? 'btn-ghost' : 'btn-secondary'}`}
                      onClick={() =>
                        patch(
                          project,
                          { status: published ? 'draft' : 'published' },
                          published ? `“${project.title}” is now a draft.` : `“${project.title}” is published.`,
                        )
                      }
                    >
                      {published ? 'Unpublish' : 'Publish'}
                    </button>
                    <button
                      type="button"
                      className={iconButton}
                      aria-pressed={project.featured}
                      aria-label={project.featured ? `Unfeature ${project.title}` : `Feature ${project.title}`}
                      title={project.featured ? 'Featured on the home page' : 'Feature on the home page'}
                      onClick={() =>
                        patch(
                          project,
                          { featured: !project.featured },
                          project.featured ? `“${project.title}” is no longer featured.` : `“${project.title}” is featured.`,
                        )
                      }
                    >
                      {project.featured ? <HiStar className="text-lg text-neon-pink" aria-hidden="true" /> : <HiOutlineStar className="text-lg" aria-hidden="true" />}
                    </button>
                    {canReorder && (
                      <>
                        <button
                          id={`order-${project.id}-up`}
                          type="button"
                          className={iconButton}
                          disabled={index === 0}
                          onClick={() => move(index, -1)}
                          aria-label={`Move ${project.title} up`}
                        >
                          <HiArrowUp aria-hidden="true" />
                        </button>
                        <button
                          id={`order-${project.id}-down`}
                          type="button"
                          className={iconButton}
                          disabled={index === projects.length - 1}
                          onClick={() => move(index, 1)}
                          aria-label={`Move ${project.title} down`}
                        >
                          <HiArrowDown aria-hidden="true" />
                        </button>
                      </>
                    )}
                    {/* Preview is also in the editor, so phones skip it to keep one row. */}
                    <a
                      href={`/projects/${project.slug}?preview=1`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${iconButton} max-sm:hidden`}
                      aria-label={`Preview ${project.title} (opens in a new tab)`}
                      title="Preview"
                    >
                      <HiOutlineEye aria-hidden="true" />
                    </a>
                    <Link to={`/admin/projects/${project.id}`} className={iconButton} aria-label={`Edit ${project.title}`} title="Edit">
                      <HiOutlinePencilSquare aria-hidden="true" />
                    </Link>
                    <button
                      type="button"
                      className={`${iconButton} hover:text-danger`}
                      onClick={() => setPendingDelete(project)}
                      aria-label={`Delete ${project.title}`}
                      title="Delete"
                    >
                      <HiOutlineTrash aria-hidden="true" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>

          {visible.length === 0 && <p className="mt-8 text-center text-sm text-text-secondary">No projects match these filters.</p>}
        </>
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title={`Delete “${pendingDelete?.title}”?`}
        confirmLabel="Delete project"
        tone="danger"
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      >
        The project, its case study and its uploaded images are removed permanently. This can’t be undone.
      </ConfirmDialog>
    </>
  );
};

export default ProjectsListPage;
