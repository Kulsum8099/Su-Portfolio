import { Link } from 'react-router';
import { usePageMeta } from '../hooks/usePageMeta';

export const NotFoundContent = ({
  title = 'Page not found',
  message = 'The page you are looking for doesn’t exist or has moved.',
}) => (
  <div className="container-page flex min-h-[72svh] flex-col items-center justify-center pt-28 pb-16 text-center">
    <p className="font-pixel text-[clamp(3rem,14vw,7rem)] leading-none text-neon-green" aria-hidden="true">
      404
    </p>
    <h1 className="mt-8 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
    <p className="mt-3 max-w-md text-text-secondary">{message}</p>
    <div className="mt-8 flex flex-wrap justify-center gap-3">
      <Link to="/" className="btn btn-primary">
        Back to home
      </Link>
      <Link to="/projects" className="btn btn-secondary">
        See all projects
      </Link>
    </div>
  </div>
);

const NotFoundPage = () => {
  usePageMeta({ title: 'Page not found', noIndex: true });
  return <NotFoundContent />;
};

export default NotFoundPage;
