import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useBlocker } from 'react-router';

// ── Path helpers: "caseStudy.features.2.title" ─────────────────────────────

const splitPath = (path) => path.split('.').map((part) => (/^\d+$/.test(part) ? Number(part) : part));

export function getIn(source, path) {
  return splitPath(path).reduce((value, key) => (value == null ? value : value[key]), source);
}

export function setIn(source, path, value) {
  const [key, ...rest] = splitPath(path);
  const copy = Array.isArray(source) ? [...source] : { ...source };
  copy[key] = rest.length ? setIn(source?.[key] ?? (typeof rest[0] === 'number' ? [] : {}), rest.join('.'), value) : value;
  return copy;
}

/** DOM id for the input editing `path` (matches the API's error paths). */
export const fieldId = (path) => `field-${path.replace(/\./g, '-')}`;

let keySeed = 0;
/** Stable React key for a list row (stripped again by the shared normalizer). */
export const rowKey = () => {
  keySeed += 1;
  return `row-${keySeed}`;
};
export const withRowKeys = (rows = []) => rows.map((row) => ({ ...row, _key: rowKey() }));

/**
 * Copy of `items` with one entry moved by `step`. Focus follows the moved
 * row's matching arrow button (ids from ListControls) for keyboard users.
 */
export function moveItem(items, index, step, idPrefix) {
  const target = index + step;
  if (target < 0 || target >= items.length) return items;
  const next = [...items];
  const [item] = next.splice(index, 1);
  next.splice(target, 0, item);
  requestAnimationFrame(() => {
    const same = document.getElementById(`${idPrefix}-${target}-${step < 0 ? 'up' : 'down'}`);
    const other = document.getElementById(`${idPrefix}-${target}-${step < 0 ? 'down' : 'up'}`);
    (same && !same.disabled ? same : other)?.focus();
  });
  return next;
}

// ── Form state ─────────────────────────────────────────────────────────────

/**
 * Values + dirty tracking + per-field errors. `init` is a value or a function
 * (called once). `setField(path, value)` accepts an updater function too, and
 * clears that field's error.
 */
export function useFormState(init) {
  const [state, setState] = useState(() => {
    const values = typeof init === 'function' ? init() : init;
    return { values, baseline: JSON.stringify(values) };
  });
  const [errors, setErrors] = useState({});

  const setValues = useCallback((values) => setState((current) => ({ ...current, values })), []);

  const setField = useCallback((path, value) => {
    setState((current) => ({
      ...current,
      values: setIn(current.values, path, typeof value === 'function' ? value(getIn(current.values, path)) : value),
    }));
    setErrors((current) => {
      if (!Object.keys(current).some((key) => key === path || key.startsWith(`${path}.`))) return current;
      return Object.fromEntries(Object.entries(current).filter(([key]) => key !== path && !key.startsWith(`${path}.`)));
    });
  }, []);

  const reset = useCallback((values) => {
    setState({ values, baseline: JSON.stringify(values) });
    setErrors({});
  }, []);

  const isDirty = useMemo(() => JSON.stringify(state.values) !== state.baseline, [state]);

  return { values: state.values, setValues, setField, isDirty, reset, errors, setErrors };
}

// ── Cleaning before save ───────────────────────────────────────────────────
// Mirrors shared/normalize.js (trim, drop empty rows, de-duplicate) while
// keeping row keys, so the rows on screen match the API's error paths.

const isBlank = (value) => value == null || (typeof value === 'string' && value.trim() === '');

export const cleanStrings = (list = []) => [...new Set(list.map((item) => item.trim()).filter(Boolean))];

export const cleanRows = (rows = []) =>
  rows.filter((row) => Object.entries(row).some(([key, value]) => key !== '_key' && !isBlank(value)));

/** Moves focus to the first field the API flagged, so it is easy to fix. */
export function focusFirstError() {
  requestAnimationFrame(() => {
    const field = document.querySelector('[aria-invalid="true"]');
    field?.focus();
    field?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  });
}

// ── Unsaved changes ────────────────────────────────────────────────────────

/**
 * Warns before leaving with unsaved edits (in-app navigation and closing the
 * tab). Returns the router blocker plus `allowNextNavigation()` for saves
 * that navigate on purpose.
 */
export function useUnsavedChangesGuard(isDirty) {
  const bypass = useRef(false);
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isDirty && !bypass.current && currentLocation.pathname !== nextLocation.pathname,
  );

  useEffect(() => {
    if (!isDirty) return;
    const warn = (event) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [isDirty]);

  const allowNextNavigation = useCallback(() => {
    bypass.current = true;
  }, []);

  return { blocker, allowNextNavigation };
}

/** Ctrl/Cmd + S submits the form. */
export function useSaveShortcut(formRef) {
  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();
        formRef.current?.requestSubmit();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [formRef]);
}
