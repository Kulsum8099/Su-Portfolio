// A tiny client-side cache for fetched data: one request per key at a time,
// cached results shared between pages, and stale-while-revalidate refreshes
// (cached data stays on screen while a fresh copy loads).
import { useCallback, useEffect, useSyncExternalStore } from 'react';

const entries = new Map();
const listeners = new Map();
const EMPTY = Object.freeze({ status: 'idle', data: undefined, error: null });

const read = (key) => entries.get(key) ?? EMPTY;

function write(key, entry) {
  entries.set(key, entry);
  listeners.get(key)?.forEach((listener) => listener());
}

/** Loads (or reuses) the data for `key`. Safe to call outside React, e.g. to prefetch. */
export function fetchResource(key, loader, { force = false } = {}) {
  const current = entries.get(key);
  if (current?.promise) return current.promise;
  if (current?.status === 'success' && !force) return Promise.resolve(current.data);

  const promise = loader().then(
    (data) => {
      write(key, { status: 'success', data, error: null, fetchedAt: Date.now() });
      return data;
    },
    (error) => {
      // Keep showing older data if a background refresh fails.
      const status = current?.data !== undefined ? 'success' : 'error';
      write(key, { status, data: current?.data, error, fetchedAt: Date.now() });
      throw error;
    },
  );
  write(key, {
    status: current?.data !== undefined ? 'success' : 'loading',
    data: current?.data,
    error: null,
    fetchedAt: current?.fetchedAt ?? 0,
    promise,
  });
  return promise;
}

/** Drops cached entries (all, or those whose key starts with `prefix`) so they refetch. */
export function invalidateResources(prefix = '') {
  for (const key of [...entries.keys()]) {
    if (key.startsWith(prefix) && !entries.get(key).promise) {
      entries.delete(key);
      listeners.get(key)?.forEach((listener) => listener());
    }
  }
}

/**
 * Subscribes a component to the data for `key`. `loader` must return the
 * same data for the same key; it is only called when the cache needs it.
 */
export function useResource(key, loader, { maxAgeMs = 60_000 } = {}) {
  const subscribe = useCallback(
    (listener) => {
      if (!listeners.has(key)) listeners.set(key, new Set());
      listeners.get(key).add(listener);
      return () => listeners.get(key)?.delete(listener);
    },
    [key],
  );
  const entry = useSyncExternalStore(subscribe, () => read(key), () => EMPTY);
  const isIdle = entry.status === 'idle';

  // Fetch on mount, when the key changes, and after invalidation — when the
  // cached copy is missing or older than `maxAgeMs`. A failed request is not
  // retried automatically (use `reload`). `loader` is intentionally not a
  // dependency: the data is identified by `key`.
  useEffect(() => {
    const current = entries.get(key);
    const fresh = current?.status === 'success' && Date.now() - current.fetchedAt < maxAgeMs;
    if (!current?.promise && !fresh) fetchResource(key, loader, { force: true }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, maxAgeMs, isIdle]);

  return {
    data: entry.data,
    error: entry.error,
    status: entry.status,
    isLoading: entry.data === undefined && entry.status !== 'error',
    reload: () => fetchResource(key, loader, { force: true }).catch(() => {}),
  };
}
