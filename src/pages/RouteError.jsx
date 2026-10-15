import { isRouteErrorResponse, Link, useRouteError } from 'react-router';

/** Last-resort screen for unexpected errors (e.g. a page's code failed to download). */
const RouteError = () => {
  const error = useRouteError();
  const notFound = isRouteErrorResponse(error) && error.status === 404;
  if (import.meta.env.DEV) console.error(error);

  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-bg-primary px-6 text-center">
      <p className="font-pixel text-4xl text-neon-pink" aria-hidden="true">
        {notFound ? '404' : 'Oops'}
      </p>
      <h1 className="mt-6 text-3xl font-bold">{notFound ? 'Page not found' : 'Something went wrong'}</h1>
      <p className="mt-3 max-w-md text-text-secondary">
        {notFound
          ? 'The page you are looking for doesn’t exist.'
          : 'Please reload the page. If this keeps happening, try again a little later.'}
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>
          Reload
        </button>
        <Link to="/" className="btn btn-secondary" reloadDocument>
          Back to home
        </Link>
      </div>
    </main>
  );
};

export default RouteError;
