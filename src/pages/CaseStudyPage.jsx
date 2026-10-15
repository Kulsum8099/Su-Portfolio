import { Link, useParams, useSearchParams } from 'react-router';
import CaseStudy from '../components/case-study/CaseStudy';
import CaseStudySkeleton from '../components/case-study/CaseStudySkeleton';
import { usePageMeta } from '../hooks/usePageMeta';
import { useCaseStudy } from '../lib/content';
import { NotFoundContent } from './NotFoundPage';

const Message = ({ title, children }) => (
  <div className="container-page flex min-h-[72svh] flex-col items-center justify-center pt-28 pb-16 text-center">
    <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
    <div className="mt-4 max-w-md text-text-secondary">{children}</div>
  </div>
);

const CaseStudyPage = () => {
  const { slug = '' } = useParams();
  const [searchParams] = useSearchParams();
  // ?preview=1 — admins can view drafts on the real page.
  const preview = searchParams.get('preview') === '1';
  const { data, error, reload } = useCaseStudy(slug, { preview });
  const project = data?.project;
  const status = project ? 'ready' : error ? (error.status === 404 ? 'missing' : error.status === 401 ? 'signin' : 'error') : 'loading';

  usePageMeta({
    title: project?.title ?? (status === 'missing' ? 'Project not found' : undefined),
    description: project?.summary,
    noIndex: preview || status === 'missing',
  });

  if (status === 'missing') {
    return (
      <NotFoundContent
        title="Project not found"
        message="This case study may have been renamed or unpublished. Browse the other projects instead."
      />
    );
  }
  if (status === 'signin') {
    return (
      <Message title="Sign in to preview">
        <p>Draft previews are only visible to admins.</p>
        <Link to="/admin/login" className="btn btn-primary mt-6">
          Sign in
        </Link>
      </Message>
    );
  }
  if (status === 'error') {
    return (
      <Message title="This case study didn’t load">
        <p>{error.message}</p>
        <button type="button" onClick={reload} className="btn btn-primary mt-6">
          Try again
        </button>
      </Message>
    );
  }
  if (status === 'loading') return <CaseStudySkeleton />;

  return <CaseStudy key={project.id} project={project} next={data.next} preview={preview} />;
};

export default CaseStudyPage;
