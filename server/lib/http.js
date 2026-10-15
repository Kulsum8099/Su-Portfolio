/** An error that maps directly onto an HTTP response. */
export class HttpError extends Error {
  constructor(status, message, { code, fields, headers } = {}) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.code = code;
    this.fields = fields;
    this.headers = headers;
  }
}

export const badRequest = (message, fields) =>
  new HttpError(400, message, { code: 'invalid_request', fields });

export const notFound = (message = 'Not found.') => new HttpError(404, message, { code: 'not_found' });

export const unauthorized = (message = 'Please sign in to continue.') =>
  new HttpError(401, message, { code: 'unauthorized' });
