import { useState } from 'react';
import { HiXMark } from 'react-icons/hi2';
import { Field } from './Field';

/** Chips editor: Enter or comma adds, Backspace on an empty box removes the last one. */
const TagInput = ({ path, label, hint, error, values = [], onChange, max = 30, maxLength = 40, placeholder }) => {
  const [draft, setDraft] = useState('');

  const add = (raw) => {
    const value = raw.trim().replace(/,+$/, '').trim();
    if (!value || values.length >= max) return;
    if (!values.some((existing) => existing.toLowerCase() === value.toLowerCase())) onChange([...values, value]);
    setDraft('');
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      add(draft);
    } else if (event.key === 'Backspace' && !draft && values.length) {
      onChange(values.slice(0, -1));
    }
  };

  return (
    <Field path={path} label={label} hint={hint ?? 'Press Enter or comma to add.'} error={error}>
      {(aria) => (
        <div className="input flex min-h-12 flex-wrap items-center gap-2 py-2 focus-within:border-neon-green focus-within:shadow-[0_0_0_3px_rgb(190_255_70/0.28)]">
          {values.length > 0 && (
            <ul className="contents" aria-label={`${label} added`}>
              {values.map((value) => (
                <li
                  key={value}
                  className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/[0.06] py-1 pr-1 pl-3 text-sm"
                >
                  {value}
                  <button
                    type="button"
                    onClick={() => onChange(values.filter((item) => item !== value))}
                    className="grid size-6 place-items-center rounded-full text-text-secondary transition-colors hover:bg-white/10 hover:text-white"
                    aria-label={`Remove ${value}`}
                  >
                    <HiXMark aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <input
            {...aria}
            value={draft}
            maxLength={maxLength}
            placeholder={values.length >= max ? `Limit of ${max} reached` : placeholder}
            disabled={values.length >= max}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => add(draft)}
            className="min-w-[8rem] flex-1 bg-transparent py-1 text-base text-white outline-none placeholder:text-text-muted"
          />
        </div>
      )}
    </Field>
  );
};

export default TagInput;
