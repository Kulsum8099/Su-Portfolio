import { fieldId } from '../forms';

/**
 * Label + control + hint + error, wired together with ids and ARIA so screen
 * readers announce the hint and any error with the field.
 */
export const Field = ({ path, label, hint, error, required = false, counter, children, className = '' }) => {
  const id = fieldId(path);
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined;

  return (
    <div className={className}>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-semibold text-white">
          {label}
          {required && (
            <span className="text-danger" aria-hidden="true">
              {' '}
              *
            </span>
          )}
        </label>
        {counter}
      </div>
      {children({ id, 'aria-describedby': describedBy, 'aria-invalid': error ? true : undefined, required })}
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1.5 text-xs leading-relaxed text-text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
};

/** "120 / 600" — turns amber close to the limit. */
export const CharCount = ({ value = '', max }) => {
  const length = value.length;
  return (
    <span className={`text-xs tabular-nums ${length > max * 0.9 ? 'text-neon-pink' : 'text-text-muted'}`} aria-hidden="true">
      {length} / {max}
    </span>
  );
};

export const TextField = ({ path, label, value, onChange, error, hint, required, maxLength, showCount, className, ...inputProps }) => (
  <Field
    path={path}
    label={label}
    hint={hint}
    error={error}
    required={required}
    className={className}
    counter={showCount && maxLength ? <CharCount value={value} max={maxLength} /> : null}
  >
    {(aria) => (
      <input
        {...aria}
        {...inputProps}
        className="input"
        value={value ?? ''}
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value)}
      />
    )}
  </Field>
);

export const TextArea = ({ path, label, value, onChange, error, hint, required, maxLength, rows = 4, className, ...inputProps }) => (
  <Field
    path={path}
    label={label}
    hint={hint}
    error={error}
    required={required}
    className={className}
    counter={maxLength ? <CharCount value={value} max={maxLength} /> : null}
  >
    {(aria) => (
      <textarea
        {...aria}
        {...inputProps}
        className="input"
        rows={rows}
        value={value ?? ''}
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value)}
      />
    )}
  </Field>
);

export const SelectField = ({ path, label, value, onChange, error, hint, options, className }) => (
  <Field path={path} label={label} hint={hint} error={error} className={className}>
    {(aria) => (
      <select {...aria} className="input" value={value ?? ''} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    )}
  </Field>
);
