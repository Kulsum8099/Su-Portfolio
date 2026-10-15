/** Shown while a page's code is loading (code-split routes). */
const PageLoader = ({ label = 'Loading…' }) => (
  <div className="flex min-h-[60svh] items-center justify-center px-6" role="status">
    <span className="size-8 animate-spin rounded-full border-2 border-white/15 border-t-neon-green" aria-hidden="true" />
    <span className="sr-only">{label}</span>
  </div>
);

export default PageLoader;
