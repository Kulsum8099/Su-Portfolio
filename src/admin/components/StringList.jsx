import { HiPlus } from 'react-icons/hi2';
import { fieldId, moveItem } from '../forms';
import ListControls from './ListControls';

/** Editable list of short texts (goals, outcomes). */
const StringList = ({ path, label, hint, itemName, values = [], onChange, errors = {}, max = 20, maxLength = 300, placeholder, addLabel }) => {
  const idPrefix = fieldId(path);
  const update = (index, value) => onChange(values.map((item, i) => (i === index ? value : item)));

  return (
    <fieldset>
      <legend className="text-sm font-semibold text-white">{label}</legend>
      {hint && <p className="mt-1 text-xs leading-relaxed text-text-muted">{hint}</p>}

      {values.length > 0 && (
        <ol className="mt-3 space-y-2">
          {values.map((value, index) => {
            const error = errors[`${path}.${index}`];
            const id = fieldId(`${path}.${index}`);
            return (
              <li key={index}>
                <div className="flex items-center gap-2">
                  <label htmlFor={id} className="sr-only">
                    {`${itemName} ${index + 1}`}
                  </label>
                  <input
                    id={id}
                    className="input"
                    value={value}
                    maxLength={maxLength}
                    placeholder={placeholder}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? `${id}-error` : undefined}
                    onChange={(event) => update(index, event.target.value)}
                  />
                  <ListControls
                    idPrefix={idPrefix}
                    index={index}
                    count={values.length}
                    itemName={itemName}
                    onMove={(from, step) => onChange(moveItem(values, from, step, idPrefix))}
                    onRemove={(at) => onChange(values.filter((_, i) => i !== at))}
                  />
                </div>
                {error && (
                  <p id={`${id}-error`} className="mt-1 text-xs font-medium text-danger">
                    {error}
                  </p>
                )}
              </li>
            );
          })}
        </ol>
      )}

      {errors[path] && <p className="mt-2 text-xs font-medium text-danger">{errors[path]}</p>}
      <button
        type="button"
        className="btn btn-sm btn-secondary mt-3"
        disabled={values.length >= max}
        onClick={() => {
          onChange([...values, '']);
          requestAnimationFrame(() => document.getElementById(fieldId(`${path}.${values.length}`))?.focus());
        }}
      >
        <HiPlus aria-hidden="true" /> {addLabel ?? `Add ${itemName}`}
      </button>
    </fieldset>
  );
};

export default StringList;
