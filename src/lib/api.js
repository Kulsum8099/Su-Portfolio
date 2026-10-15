// Thin fetch wrapper for the /api routes. Errors carry the HTTP status, an
// error code and per-field validation messages from the server.

export class ApiError extends Error {
  constructor(message, { status = 0, code = 'error', fields = {}, kind = 'http' } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.fields = fields;
    // "network": no response, "not_json": something other than our API answered.
    this.kind = kind;
  }

  /** True when the API itself can't be reached (offline, not deployed, database down). */
  get isUnavailable() {
    return this.kind !== 'http' || this.status >= 500;
  }
}

const unauthorizedListeners = new Set();

/** Lets the admin panel react when a request reports an expired session. */
export function onUnauthorized(listener) {
  unauthorizedListeners.add(listener);
  return () => unauthorizedListeners.delete(listener);
}

export async function apiRequest(path, { method = 'GET', body, headers = {}, signal } = {}) {
  const isBlob = typeof Blob !== 'undefined' && body instanceof Blob;
  let response;
  try {
    response = await fetch(`/api${path}`, {
      method,
      signal,
      credentials: 'same-origin',
      headers: {
        Accept: 'application/json',
        ...(body !== undefined && !isBlob ? { 'Content-Type': 'application/json' } : {}),
        ...headers,
      },
      body: body === undefined ? undefined : isBlob ? body : JSON.stringify(body),
    });
  } catch (error) {
    if (error?.name === 'AbortError') throw error;
    throw new ApiError('Could not reach the server. Check your connection and try again.', {
      kind: 'network',
    });
  }

  if (response.status === 204) return null;

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json().catch(() => null) : null;
  if (!data) {
    throw new ApiError('The server sent an unexpected response.', {
      status: response.status,
      kind: 'not_json',
    });
  }

  if (!response.ok) {
    const error = new ApiError(data.error?.message ?? 'The request failed.', {
      status: response.status,
      code: data.error?.code,
      fields: data.error?.fields ?? {},
    });
    if (response.status === 401) unauthorizedListeners.forEach((listener) => listener(error));
    throw error;
  }
  return data;
}
