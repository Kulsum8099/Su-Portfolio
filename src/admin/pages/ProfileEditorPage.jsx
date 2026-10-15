import { useEffect, useRef, useState } from 'react';
import { HiOutlineInformationCircle } from 'react-icons/hi2';
import { HEX_COLOR_PATTERN, LIMITS, TOOL_ICON_KEYS } from '../../../shared/content';
import { normalizeProfileInput } from '../../../shared/normalize';
import ToolIcon from '../../components/ToolIcon';
import { fallbackProfile } from '../../data/profileData';
import { usePageMeta } from '../../hooks/usePageMeta';
import { adminApi } from '../api';
import ConfirmDialog from '../components/ConfirmDialog';
import { Field, SelectField, TextArea, TextField } from '../components/Field';
import RowList from '../components/RowList';
import Section from '../components/Section';
import TagInput from '../components/TagInput';
import { useToast } from '../context';
import { cleanRows, cleanStrings, focusFirstError, getIn, useFormState, useSaveShortcut, useUnsavedChangesGuard, withRowKeys } from '../forms';

const ICON_LABELS = {
  figma: 'Figma',
  sketch: 'Sketch',
  framer: 'Framer',
  miro: 'Miro',
  notion: 'Notion',
  webflow: 'Webflow',
  canva: 'Canva',
  invision: 'InVision',
  maze: 'Maze',
  rive: 'Rive',
  lottiefiles: 'LottieFiles',
  blender: 'Blender',
  cinema4d: 'Cinema 4D',
  affinitydesigner: 'Affinity Designer',
  jira: 'Jira',
  slack: 'Slack',
  html5: 'HTML5',
  css: 'CSS',
  react: 'React',
  wordpress: 'WordPress',
  openai: 'OpenAI / ChatGPT',
  claude: 'Claude',
  googlegemini: 'Google Gemini',
};

const ICON_OPTIONS = [
  { value: '', label: 'Letter tile (no brand icon)' },
  ...TOOL_ICON_KEYS.map((key) => ({ value: key, label: ICON_LABELS[key] ?? key })),
];

const ROW_GROUPS = ['socials', 'experience', 'education', 'certifications', 'tools'];

const toFormValues = (profile) => {
  const values = normalizeProfileInput(profile);
  return { ...values, ...Object.fromEntries(ROW_GROUPS.map((group) => [group, withRowKeys(values[group])])) };
};

const cleanForm = (values) => ({
  ...values,
  skills: cleanStrings(values.skills),
  ...Object.fromEntries(ROW_GROUPS.map((group) => [group, cleanRows(values[group])])),
});

const ProfileForm = ({ initialProfile, isSaved }) => {
  const notify = useToast();
  const formRef = useRef(null);
  const [saved, setSaved] = useState(isSaved);
  const { values, setValues, setField, isDirty, reset, errors, setErrors } = useFormState(() => toFormValues(initialProfile));
  const [saving, setSaving] = useState(false);
  const { blocker } = useUnsavedChangesGuard(isDirty);
  useSaveShortcut(formRef);

  const bind = (path) => ({ path, value: getIn(values, path), error: errors[path], onChange: (value) => setField(path, value) });
  const rowField = (group, index, name, update) => ({
    path: `${group}.${index}.${name}`,
    value: values[group][index][name],
    error: errors[`${group}.${index}.${name}`],
    onChange: (value) => update(name, value),
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (saving) return;
    const cleaned = cleanForm(values);
    setValues(cleaned);
    setSaving(true);
    try {
      const result = await adminApi.saveProfile(normalizeProfileInput(cleaned));
      reset(toFormValues(result));
      setSaved(true);
      notify('Profile saved. The site now shows these details.');
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

  const saveDisabled = saving || (saved && !isDirty);

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Profile &amp; resume</h1>
          <p className="mt-1 text-sm text-text-secondary">Your name, contact details and resume, shown on the home page and footer.</p>
        </div>
        <button type="submit" className="btn btn-primary hidden sm:inline-flex" disabled={saveDisabled}>
          {saving ? 'Saving…' : 'Save profile'}
        </button>
      </div>

      {!saved && (
        <p className="mt-6 flex items-start gap-3 rounded-xl border border-electric-blue/40 bg-electric-blue/10 px-4 py-3 text-sm" role="note">
          <HiOutlineInformationCircle className="mt-0.5 shrink-0 text-lg text-electric-blue" aria-hidden="true" />
          <span>
            Nothing is saved in the database yet, so the site shows the built-in content below. Review it — some resume
            entries may be placeholders — and save to make it yours.
          </span>
        </p>
      )}

      <div className="mt-8 grid gap-6">
        <Section id="identity" title="Identity">
          <div className="grid gap-6 sm:grid-cols-2">
            <TextField {...bind('name')} label="Full name" required maxLength={LIMITS.name} autoComplete="name" />
            <TextField {...bind('role')} label="Role" maxLength={LIMITS.role} placeholder="UX-UI Designer" />
          </div>
          <TextArea
            {...bind('aboutQuote')}
            label="“About me” quote"
            rows={2}
            maxLength={LIMITS.quote}
            hint="Shown in the About me card of the resume. Leave empty to hide the card."
          />
        </Section>

        <Section id="contact" title="Contact" description="Shown as buttons in the resume; the email also powers the footer call to action.">
          <div className="grid gap-6 sm:grid-cols-2">
            <TextField {...bind('email')} label="Email" type="email" inputMode="email" autoComplete="email" maxLength={LIMITS.email} />
            <TextField {...bind('phone')} label="Phone" type="tel" inputMode="tel" autoComplete="tel" maxLength={LIMITS.phone} placeholder="+88 01…" />
            <TextField {...bind('website')} label="Website" type="url" inputMode="url" maxLength={LIMITS.url} placeholder="https://" />
            <TextField {...bind('linkedin')} label="LinkedIn profile URL" type="url" inputMode="url" maxLength={LIMITS.url} placeholder="https://www.linkedin.com/in/…" />
          </div>
          <TextField {...bind('availability')} label="Availability note" maxLength={LIMITS.note} placeholder="Usually responds within 24 hours" />
          <RowList
            path="socials"
            label="Other profiles"
            hint="Behance, Dribbble, Instagram… shown as icons in the footer (LinkedIn is added automatically)."
            itemName="Profile link"
            rows={values.socials}
            onChange={(next) => setField('socials', next)}
            createRow={() => ({ label: '', url: '' })}
            errors={errors}
            max={LIMITS.socials}
            renderRow={(row, index, update) => (
              <div className="grid gap-4 sm:grid-cols-[minmax(0,12rem)_minmax(0,1fr)]">
                <TextField {...rowField('socials', index, 'label', update)} label="Label" maxLength={LIMITS.linkLabel} placeholder="Behance" />
                <TextField {...rowField('socials', index, 'url', update)} label="URL" type="url" inputMode="url" maxLength={LIMITS.url} placeholder="https://" />
              </div>
            )}
          />
        </Section>

        <Section id="experience" title="Experience">
          <RowList
            path="experience"
            label="Roles"
            itemName="Role"
            rows={values.experience}
            onChange={(next) => setField('experience', next)}
            createRow={() => ({ title: '', organization: '', period: '' })}
            errors={errors}
            max={LIMITS.listCount}
            renderRow={(row, index, update) => (
              <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_9rem]">
                <TextField {...rowField('experience', index, 'title', update)} label="Job title" maxLength={LIMITS.entryTitle} />
                <TextField {...rowField('experience', index, 'organization', update)} label="Company" maxLength={LIMITS.entryMeta} />
                <TextField {...rowField('experience', index, 'period', update)} label="Period" maxLength={LIMITS.period} placeholder="2022-2024" />
              </div>
            )}
          />
        </Section>

        <Section id="education" title="Education">
          <RowList
            path="education"
            label="Degrees and courses"
            itemName="Entry"
            rows={values.education}
            onChange={(next) => setField('education', next)}
            createRow={() => ({ degree: '', institution: '', location: '', period: '' })}
            errors={errors}
            max={LIMITS.listCount}
            renderRow={(row, index, update) => (
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField {...rowField('education', index, 'degree', update)} label="Degree or course" maxLength={LIMITS.entryTitle} />
                <TextField {...rowField('education', index, 'institution', update)} label="Institution" maxLength={LIMITS.entryMeta} />
                <TextField {...rowField('education', index, 'location', update)} label="Location" maxLength={LIMITS.entryMeta} />
                <TextField {...rowField('education', index, 'period', update)} label="Period" maxLength={LIMITS.period} placeholder="2019-2022" />
              </div>
            )}
          />
        </Section>

        <Section id="certifications" title="Certifications">
          <RowList
            path="certifications"
            label="Certificates"
            itemName="Certificate"
            rows={values.certifications}
            onChange={(next) => setField('certifications', next)}
            createRow={() => ({ title: '', issuer: '' })}
            errors={errors}
            max={LIMITS.listCount}
            renderRow={(row, index, update) => (
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField {...rowField('certifications', index, 'title', update)} label="Certification" maxLength={LIMITS.entryTitle} />
                <TextField {...rowField('certifications', index, 'issuer', update)} label="Issuer" maxLength={LIMITS.entryMeta} />
              </div>
            )}
          />
        </Section>

        <Section id="skills-tools" title="Skills & tools">
          <TagInput
            path="skills"
            label="Skills"
            values={values.skills}
            onChange={(next) => setField('skills', next)}
            error={errors.skills}
            max={LIMITS.skills}
            maxLength={LIMITS.skill}
            placeholder="UX Research, Prototyping…"
          />
          <RowList
            path="tools"
            label="Tools"
            hint="Pick a brand icon when one exists; otherwise a coloured tile with the short label is shown."
            itemName="Tool"
            rows={values.tools}
            onChange={(next) => setField('tools', next)}
            createRow={() => ({ name: '', icon: '', abbr: '', color: '#8B5CF6' })}
            errors={errors}
            max={LIMITS.tools}
            renderRow={(row, index, update) => {
              const colorValid = HEX_COLOR_PATTERN.test(row.color);
              return (
                <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_7rem_11rem_auto] lg:items-end">
                  <TextField {...rowField('tools', index, 'name', update)} label="Name" maxLength={LIMITS.toolName} placeholder="Figma" />
                  <SelectField {...rowField('tools', index, 'icon', update)} label="Icon" options={ICON_OPTIONS} />
                  <TextField {...rowField('tools', index, 'abbr', update)} label="Short label" maxLength={LIMITS.toolAbbr} placeholder="Ps" />
                  <Field path={`tools.${index}.color`} label="Colour" error={errors[`tools.${index}.color`]}>
                    {(aria) => (
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          aria-label={`Pick a colour for tool ${index + 1}`}
                          value={colorValid ? row.color.toLowerCase() : '#8b5cf6'}
                          onChange={(event) => update('color', event.target.value.toUpperCase())}
                          className="h-11 w-12 shrink-0 cursor-pointer rounded-lg border border-white/15 bg-transparent p-1"
                        />
                        <input {...aria} className="input font-mono" value={row.color} maxLength={7} onChange={(event) => update('color', event.target.value)} />
                      </div>
                    )}
                  </Field>
                  <div className="flex h-11 items-center gap-2 text-xs text-text-muted" aria-hidden="true">
                    <span>Preview</span>
                    <ToolIcon tool={{ ...row, color: colorValid ? row.color : '#8B5CF6' }} />
                  </div>
                </div>
              );
            }}
          />
        </Section>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-bg-primary/90 px-4 py-3 backdrop-blur-xl sm:hidden">
        <div className="flex items-center gap-3">
          <p className={`flex-1 text-xs ${isDirty ? 'text-neon-pink' : 'text-text-muted'}`}>{isDirty ? 'Unsaved changes' : 'All changes saved'}</p>
          <button type="submit" className="btn btn-primary" disabled={saveDisabled}>
            {saving ? 'Saving…' : 'Save profile'}
          </button>
        </div>
      </div>
      <div className="mt-8 hidden justify-end sm:flex">
        <button type="submit" className="btn btn-primary" disabled={saveDisabled}>
          {saving ? 'Saving…' : 'Save profile'}
        </button>
      </div>

      <ConfirmDialog
        open={blocker.state === 'blocked'}
        title="Leave without saving?"
        confirmLabel="Discard changes"
        tone="danger"
        onConfirm={() => blocker.proceed?.()}
        onCancel={() => blocker.reset?.()}
      >
        You have unsaved changes to your profile. They will be lost if you leave now.
      </ConfirmDialog>
    </form>
  );
};

const ProfileEditorPage = () => {
  const [state, setState] = useState({ status: 'loading' });
  usePageMeta({ title: 'Profile · Admin', noIndex: true });

  useEffect(() => {
    let active = true;
    adminApi.getProfile().then(
      (profile) => active && setState({ status: 'ready', profile: profile ?? fallbackProfile, isSaved: Boolean(profile) }),
      (error) => active && setState({ status: 'error', error }),
    );
    return () => {
      active = false;
    };
  }, []);

  if (state.status === 'loading') {
    return (
      <div aria-busy="true" aria-label="Loading profile" className="grid gap-6">
        <div className="skeleton h-10 w-64" />
        <div className="skeleton h-64" />
        <div className="skeleton h-80" />
      </div>
    );
  }
  if (state.status === 'error') {
    return (
      <div className="surface p-8 text-center" role="alert">
        <h1 className="text-2xl font-bold">The profile couldn’t be loaded</h1>
        <p className="mt-2 text-text-secondary">{state.error.message}</p>
      </div>
    );
  }
  return <ProfileForm initialProfile={state.profile} isSaved={state.isSaved} />;
};

export default ProfileEditorPage;
