import { HiPlus } from 'react-icons/hi2';
import { fieldId, moveItem, rowKey } from '../forms';
import ListControls from './ListControls';

/**
 * Repeatable group of fields (features, process steps, links, resume
 * entries…). `renderRow(row, index, update)` renders one row's inputs.
 */
const RowList = ({ path, label, hint, itemName, rows = [], onChange, createRow, renderRow, errors = {}, max = 20, addLabel }) => {
  const idPrefix = fieldId(path);

  const update = (index, field, value) =>
    onChange(rows.map((row, i) => (i === index ? { ...row, [field]: value } : row)));

  const add = () => {
    onChange([...rows, { ...createRow(), _key: rowKey() }]);
    // Focus the first input of the new row.
    requestAnimationFrame(() =>
      document.querySelector(`[data-row="${idPrefix}-${rows.length}"] input, [data-row="${idPrefix}-${rows.length}"] textarea`)?.focus(),
    );
  };

  return (
    <fieldset>
      <legend className="text-sm font-semibold text-white">{label}</legend>
      {hint && <p className="mt-1 text-xs leading-relaxed text-text-muted">{hint}</p>}

      {rows.length > 0 && (
        <ol className="mt-3 space-y-3">
          {rows.map((row, index) => (
            <li
              key={row._key ?? index}
              data-row={`${idPrefix}-${index}`}
              className="rounded-xl border border-white/10 bg-white/[0.02] p-4"
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="text-xs font-semibold tracking-wide text-text-muted uppercase">
                  {itemName} {index + 1}
                </span>
                <ListControls
                  idPrefix={idPrefix}
                  index={index}
                  count={rows.length}
                  itemName={itemName}
                  onMove={(from, step) => onChange(moveItem(rows, from, step, idPrefix))}
                  onRemove={(at) => onChange(rows.filter((_, i) => i !== at))}
                />
              </div>
              {renderRow(row, index, (field, value) => update(index, field, value))}
            </li>
          ))}
        </ol>
      )}

      {errors[path] && <p className="mt-2 text-xs font-medium text-danger">{errors[path]}</p>}
      <button type="button" className="btn btn-sm btn-secondary mt-3" disabled={rows.length >= max} onClick={add}>
        <HiPlus aria-hidden="true" /> {addLabel ?? `Add ${itemName}`}
      </button>
    </fieldset>
  );
};

export default RowList;
