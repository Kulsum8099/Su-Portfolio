import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router';
import { HiArrowLeft, HiOutlineArrowTopRightOnSquare, HiOutlineTrash } from 'react-icons/hi2';
import { ACCENTS, LIMITS, slugify } from '../../../shared/content';
import { normalizeProjectInput } from '../../../shared/normalize';
import { usePageMeta } from '../../hooks/usePageMeta';
import { adminApi } from '../api';
import ConfirmDialog from '../components/ConfirmDialog';
import { Field, TextArea, TextField } from '../components/Field';
import ImageField from '../components/ImageField';
import RowList from '../components/RowList';
import Section from '../components/Section';
import StringList from '../components/StringList';
import Switch from '../components/Switch';
import TagInput from '../components/TagInput';
import { useToast } from '../context';
import {
  cleanRows,
  cleanStrings,
  focusFirstError,
  getIn,
  useFormState,
  useSaveShortcut,
  useUnsavedChangesGuard,
  withRowKeys,
} from '../forms';

const DEFAULT_CATEGORIES = ['Web App', 'Mobile App', 'Website Design', 'Dashboard', 'Branding', 'Design System'];

const SWATCHES = {
  pink: 'bg-neon-pink',
  green: 'bg-neon-green',
  purple: 'bg-neon-purple',
  blue: 'bg-electric-blue',
};

// Form state = the normalized project + stable keys for repeatable rows.
const toFormValues = (project) => {
  const values = normalizeProjectInput(project ?? {});
  return {
    ...values,
    links: withRowKeys(values.links),
    caseStudy: {
      ...values.caseStudy,
      features: withRowKeys(values.caseStudy.features),
      process: withRowKeys(values.caseStudy.process),
      gallery: withRowKeys(values.caseStudy.gallery),
    },
  };
};

const cleanForm = (values) => ({
  ...values,
  technologies: cleanStrings(values.technologies),
  links: cleanRows(values.links),
  caseStudy: {
    ...values.caseStudy,
    goals: cleanStrings(values.caseStudy.goals),
    features: cleanRows(values.caseStudy.features),
    process: cleanRows(values.caseStudy.process),
    gallery: cleanRows(values.caseStudy.gallery),
    outcomes: cleanStrings(values.caseStudy.outcomes),
  },
});

const formatDateTime = (value) =>
  value ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : null;

const EditorSkeleton = () => (
  <div aria-busy="true" aria-label="Loading project">
    <div className="skeleton h-5 w-24" />
    <div className="skeleton mt-4 h-10 w-72" />
    <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="grid gap-6">
        <div className="skeleton h-96" />
        <div className="skeleton h-64" />
      </div>
      <div className="skeleton h-72" />
    </div>
  </div>
);

const ProjectForm = ({ initialProject, categories }) => {
  const navigate = useNavigate();
  const notify = useToast();
  const formRef = useRef(null);
  const [saved, setSaved] = useState(initialProject);
  const isNew = !saved;
  const { values, setValues, setField, isDirty, reset, errors, setErrors } = useFormState(() => toFormValues(initialProject));
  const [slugEdited, setSlugEdited] = useState(!isNew);
  const [uploads, setUploads] = useState(0);
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { blocker, allowNextNavigation } = useUnsavedChangesGuard(isDirty);
  useSaveShortcut(formRef);
  usePageMeta({ title: `${isNew ? 'New project' : saved.title} · Admin`, noIndex: true });

  // Shorthand for simple text fields bound to a path.
  const bind = (path) => ({
    path,
    value: getIn(values, path),
    error: errors[path],
    onChange: (value) => setField(path, value),
  });

  const trackUpload = (busy) => setUploads((count) => Math.max(0, count + (busy ? 1 : -1)));

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (saving || uploads > 0) return;

    const cleaned = cleanForm(values);
    setValues(cleaned);
    setSaving(true);
    try {
      const payload = normalizeProjectInput(cleaned);
      const result = saved ? await adminApi.updateProject(saved.id, payload) : await adminApi.createProject(payload);
      setSaved(result);
      reset(toFormValues(result));
      if (isNew) {
        allowNextNavigation();
        navigate(`/admin/projects/${result.id}`, { replace: true, state: { project: result } });
        notify('Project created.');
      } else {
        notify('Changes saved.');
      }
    } catch (error) {
      if (error.fields && Object.keys(error.fields).length > 0) {
        setErrors(error.fields);
        focusFirstError();
      }
      notify(error.status === 401 ? 'Sign in again to save your changes.' : error.message, { tone: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await adminApi.deleteProject(saved.id);
      allowNextNavigation();
      notify(`“${saved.title}” was deleted.`);
      navigate('/admin', { replace: true });
    } catch (error) {
      notify(error.message, { tone: 'error' });
      setDeleting(false);
    }
  };

  const saveLabel = uploads > 0 ? 'Uploading image…' : saving ? 'Saving…' : isNew ? 'Create project' : 'Save changes';
  const saveDisabled = saving || uploads > 0 || (!isNew && !isDirty);
  const statusNote = isDirty ? 'Unsaved changes' : saved ? `Saved ${formatDateTime(saved.updatedAt)}` : 'Not saved yet';

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <Link to="/admin" className="inline-flex items-center gap-2 text-sm text-text-secondary transition-colors hover:text-white">
            <HiArrowLeft aria-hidden="true" /> Projects
          </Link>
          <h1 className="mt-2 truncate text-3xl font-bold tracking-tight sm:text-4xl">
            {isNew ? 'New project' : values.title || 'Untitled project'}
          </h1>
        </div>
        {saved && (
          <a
            href={`/projects/${saved.slug}?preview=1`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
          >
            <HiOutlineArrowTopRightOnSquare aria-hidden="true" /> Preview page
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        )}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        {/* Publish panel: first on mobile, a sticky sidebar on desktop */}
        <aside className="surface grid gap-5 p-5 sm:p-6 lg:sticky lg:top-24 lg:order-last" aria-label="Publishing">
          <Switch
            id="field-status"
            label="Published"
            description={values.status === 'published' ? 'Visible on the site.' : 'Draft — only visible to you in preview.'}
            checked={values.status === 'published'}
            onChange={(on) => setField('status', on ? 'published' : 'draft')}
          />
          <Switch
            id="field-featured"
            label="Featured"
            description="Leads the home page project strip."
            checked={values.featured}
            onChange={(on) => setField('featured', on)}
          />
          <div className="hidden border-t border-white/10 pt-5 lg:block">
            <button type="submit" className="btn btn-primary w-full" disabled={saveDisabled}>
              {saveLabel}
            </button>
            <p className={`mt-2 text-center text-xs ${isDirty ? 'text-neon-pink' : 'text-text-muted'}`} aria-live="polite">
              {statusNote}
            </p>
            <p className="mt-1 text-center text-[11px] text-text-muted">Ctrl / ⌘ + S saves</p>
          </div>
          {saved && (
            <button type="button" className="btn btn-ghost w-full hover:text-danger" onClick={() => setDeleteOpen(true)}>
              <HiOutlineTrash aria-hidden="true" /> Delete project
            </button>
          )}
        </aside>

        <div className="grid min-w-0 gap-6">
          <Section id="basics" title="Basics" description="How the project appears on cards and at the top of its page.">
            <TextField
              {...bind('title')}
              label="Title"
              required
              maxLength={LIMITS.title}
              onChange={(title) => {
                setField('title', title);
                if (!slugEdited) setField('slug', slugify(title));
              }}
            />
            <Field
              path="slug"
              label="URL slug"
              required
              error={errors.slug}
              hint={
                isNew
                  ? 'Generated from the title. Lowercase letters, numbers and hyphens.'
                  : 'Changing this changes the page address, so existing links to it will stop working.'
              }
            >
              {(aria) => (
                <div className="flex items-stretch">
                  <span className="inline-flex items-center rounded-l-xl border border-r-0 border-white/15 bg-white/[0.04] px-3 text-sm text-text-muted">
                    /projects/
                  </span>
                  <input
                    {...aria}
                    className="input rounded-l-none"
                    value={values.slug}
                    maxLength={LIMITS.slug}
                    onChange={(event) => {
                      setSlugEdited(true);
                      setField('slug', event.target.value.toLowerCase().replace(/\s+/g, '-'));
                    }}
                    onBlur={() => setField('slug', slugify(values.slug))}
                  />
                </div>
              )}
            </Field>
            <div className="grid gap-6 sm:grid-cols-2">
              <TextField {...bind('subtitle')} label="Subtitle" maxLength={LIMITS.subtitle} placeholder="e.g. Healthcare simplified" />
              <TextField {...bind('category')} label="Category" maxLength={LIMITS.category} list="category-options" placeholder="e.g. Web App" />
              <datalist id="category-options">
                {categories.map((category) => (
                  <option key={category} value={category} />
                ))}
              </datalist>
            </div>
            <fieldset>
              <legend className="text-sm font-semibold text-white">Accent colour</legend>
              <p className="mt-1 text-xs text-text-muted">Used for the category badge and highlights on the case study.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {ACCENTS.map((accent) => (
                  <label
                    key={accent}
                    className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm capitalize transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-neon-green ${
                      values.accent === accent ? 'border-white/60 bg-white/10 text-white' : 'border-white/15 text-text-secondary hover:border-white/30'
                    }`}
                  >
                    <input
                      type="radio"
                      name="accent"
                      value={accent}
                      checked={values.accent === accent}
                      onChange={() => setField('accent', accent)}
                      className="sr-only"
                    />
                    <span className={`size-4 rounded-full ${SWATCHES[accent]}`} aria-hidden="true" />
                    {accent}
                  </label>
                ))}
              </div>
            </fieldset>
            <TextArea
              {...bind('summary')}
              label="Summary"
              rows={3}
              maxLength={LIMITS.summary}
              hint="One or two sentences for the project card and page introduction."
            />
          </Section>

          <Section id="cover" title="Cover image" description="Shown on the project card and at the top of the case study.">
            <ImageField
              path="coverImage"
              label="Cover"
              value={values.coverImage}
              onChange={(next) => setField('coverImage', next)}
              errors={errors}
              onBusyChange={trackUpload}
            />
          </Section>

          <Section id="details" title="Project details" description="Shown as facts under the title. Leave empty to hide.">
            <div className="grid gap-6 sm:grid-cols-3">
              <TextField {...bind('role')} label="Your role" maxLength={LIMITS.meta} placeholder="Lead UX designer" />
              <TextField {...bind('client')} label="Client" maxLength={LIMITS.meta} placeholder="Company or personal" />
              <TextField {...bind('timeline')} label="Timeline" maxLength={LIMITS.meta} placeholder="8 weeks · 2024" />
            </div>
            <TagInput
              path="technologies"
              label="Tools & technologies"
              values={values.technologies}
              onChange={(next) => setField('technologies', next)}
              error={errors.technologies}
              max={LIMITS.technologies}
              maxLength={LIMITS.technology}
              placeholder="Figma, Maze, Protopie…"
            />
            <RowList
              path="links"
              label="Links"
              hint="Live site, prototype, Behance… The first link is shown as the main button."
              itemName="Link"
              rows={values.links}
              onChange={(next) => setField('links', next)}
              createRow={() => ({ label: '', url: '' })}
              errors={errors}
              max={LIMITS.links}
              renderRow={(row, index, update) => (
                <div className="grid gap-4 sm:grid-cols-[minmax(0,14rem)_minmax(0,1fr)]">
                  <TextField
                    path={`links.${index}.label`}
                    label="Label"
                    value={row.label}
                    onChange={(value) => update('label', value)}
                    error={errors[`links.${index}.label`]}
                    maxLength={LIMITS.linkLabel}
                    placeholder="View prototype"
                  />
                  <TextField
                    path={`links.${index}.url`}
                    label="URL"
                    type="url"
                    inputMode="url"
                    value={row.url}
                    onChange={(value) => update('url', value)}
                    error={errors[`links.${index}.url`]}
                    maxLength={LIMITS.url}
                    placeholder="https://"
                  />
                </div>
              )}
            />
          </Section>

          <Section
            id="case-study"
            title="Case study"
            description="Each section appears on the project page only when it has content. Leave a blank line between paragraphs."
          >
            <TextArea {...bind('caseStudy.overview')} label="Overview" rows={4} maxLength={LIMITS.longText} />
            <TextArea {...bind('caseStudy.problem')} label="Problem statement" rows={4} maxLength={LIMITS.longText} />
            <StringList
              path="caseStudy.goals"
              label="Goals"
              itemName="Goal"
              values={values.caseStudy.goals}
              onChange={(next) => setField('caseStudy.goals', next)}
              errors={errors}
              max={LIMITS.listCount}
              maxLength={LIMITS.listItem}
              placeholder="e.g. Cut appointment booking time in half"
            />
            <TextArea {...bind('caseStudy.research')} label="Research" rows={4} maxLength={LIMITS.longText} />
            <TextArea {...bind('caseStudy.solution')} label="Solution" rows={4} maxLength={LIMITS.longText} />
          </Section>

          <Section id="features" title="Key features" description="The most important things the design does.">
            <RowList
              path="caseStudy.features"
              label="Features"
              itemName="Feature"
              rows={values.caseStudy.features}
              onChange={(next) => setField('caseStudy.features', next)}
              createRow={() => ({ title: '', description: '' })}
              errors={errors}
              max={LIMITS.listCount}
              renderRow={(row, index, update) => (
                <div className="grid gap-4">
                  <TextField
                    path={`caseStudy.features.${index}.title`}
                    label="Title"
                    value={row.title}
                    onChange={(value) => update('title', value)}
                    error={errors[`caseStudy.features.${index}.title`]}
                    maxLength={LIMITS.itemTitle}
                  />
                  <TextArea
                    path={`caseStudy.features.${index}.description`}
                    label="Description"
                    rows={3}
                    value={row.description}
                    onChange={(value) => update('description', value)}
                    error={errors[`caseStudy.features.${index}.description`]}
                    maxLength={LIMITS.itemBody}
                  />
                </div>
              )}
            />
          </Section>

          <Section id="process" title="Implementation process" description="The steps from research to delivery, in order.">
            <RowList
              path="caseStudy.process"
              label="Process steps"
              itemName="Step"
              rows={values.caseStudy.process}
              onChange={(next) => setField('caseStudy.process', next)}
              createRow={() => ({ title: '', description: '' })}
              errors={errors}
              max={LIMITS.listCount}
              renderRow={(row, index, update) => (
                <div className="grid gap-4">
                  <TextField
                    path={`caseStudy.process.${index}.title`}
                    label="Step"
                    value={row.title}
                    onChange={(value) => update('title', value)}
                    error={errors[`caseStudy.process.${index}.title`]}
                    maxLength={LIMITS.itemTitle}
                    placeholder="e.g. Discovery & interviews"
                  />
                  <TextArea
                    path={`caseStudy.process.${index}.description`}
                    label="What happened"
                    rows={3}
                    value={row.description}
                    onChange={(value) => update('description', value)}
                    error={errors[`caseStudy.process.${index}.description`]}
                    maxLength={LIMITS.itemBody}
                  />
                </div>
              )}
            />
          </Section>

          <Section id="screens" title="Screenshots" description="Shown as a gallery; visitors can open each one full size.">
            <RowList
              path="caseStudy.gallery"
              label="Gallery"
              itemName="Screenshot"
              rows={values.caseStudy.gallery}
              onChange={(next) => setField('caseStudy.gallery', next)}
              createRow={() => ({ url: '', alt: '', caption: '', width: null, height: null })}
              errors={errors}
              max={LIMITS.gallery}
              renderRow={(row, index) => (
                <ImageField
                  path={`caseStudy.gallery.${index}`}
                  label="Image"
                  value={row}
                  onChange={(next) => setField(`caseStudy.gallery.${index}`, next)}
                  errors={errors}
                  withCaption
                  onBusyChange={trackUpload}
                />
              )}
            />
          </Section>

          <Section id="outcomes" title="Outcomes" description="Results and impact. Start with a number (“40% faster…”) to show it as a metric.">
            <StringList
              path="caseStudy.outcomes"
              label="Outcomes"
              itemName="Outcome"
              values={values.caseStudy.outcomes}
              onChange={(next) => setField('caseStudy.outcomes', next)}
              errors={errors}
              max={LIMITS.listCount}
              maxLength={LIMITS.listItem}
              placeholder="e.g. 40% reduction in scheduling time"
            />
          </Section>
        </div>
      </div>

      {/* Mobile save bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-bg-primary/90 px-4 py-3 backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <p className={`flex-1 text-xs ${isDirty ? 'text-neon-pink' : 'text-text-muted'}`}>{statusNote}</p>
          <button type="submit" className="btn btn-primary" disabled={saveDisabled}>
            {saveLabel}
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        title={`Delete “${saved?.title}”?`}
        confirmLabel="Delete project"
        tone="danger"
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      >
        The project, its case study and its uploaded images are removed permanently. This can’t be undone.
      </ConfirmDialog>

      <ConfirmDialog
        open={blocker.state === 'blocked'}
        title="Leave without saving?"
        confirmLabel="Discard changes"
        tone="danger"
        onConfirm={() => blocker.proceed?.()}
        onCancel={() => blocker.reset?.()}
      >
        You have unsaved changes on this project. They will be lost if you leave now.
      </ConfirmDialog>
    </form>
  );
};

const ProjectEditor = ({ id }) => {
  const location = useLocation();
  // Right after creating a project, the editor receives it via navigation state.
  const handedOver = id && location.state?.project?.id === id ? location.state.project : null;
  const [project, setProject] = useState(handedOver);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);

  useEffect(() => {
    if (!id || handedOver) return;
    let active = true;
    adminApi.getProject(id).then(
      (result) => active && setProject(result),
      (problem) => active && setError(problem),
    );
    return () => {
      active = false;
    };
  }, [id, handedOver]);

  useEffect(() => {
    adminApi
      .listProjects()
      .then((list) => setCategories([...new Set([...list.map((item) => item.category).filter(Boolean), ...DEFAULT_CATEGORIES])]))
      .catch(() => {});
  }, []);

  if (error) {
    return (
      <div className="surface p-8 text-center">
        <h1 className="text-2xl font-bold">{error.status === 404 ? 'Project not found' : 'This project couldn’t be loaded'}</h1>
        <p className="mt-2 text-text-secondary">{error.message}</p>
        <Link to="/admin" className="btn btn-secondary mt-6">
          Back to projects
        </Link>
      </div>
    );
  }
  if (id && !project) return <EditorSkeleton />;
  return <ProjectForm initialProject={project} categories={categories} />;
};

/** /admin/projects/new and /admin/projects/:id. Keyed by id so each project gets a fresh form. */
const ProjectEditorPage = () => {
  const { id } = useParams();
  return <ProjectEditor key={id ?? 'new'} id={id} />;
};

export default ProjectEditorPage;
