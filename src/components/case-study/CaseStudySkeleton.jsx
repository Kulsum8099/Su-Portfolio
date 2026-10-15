const CaseStudySkeleton = () => (
  <div className="container-page pt-28 pb-16 sm:pt-32" role="status">
    <span className="sr-only">Loading the case study…</span>
    <div aria-hidden="true">
      <div className="skeleton h-4 w-28" />
      <div className="skeleton mt-10 h-7 w-24" />
      <div className="skeleton mt-6 h-16 w-full max-w-3xl sm:h-24" />
      <div className="skeleton mt-5 h-6 w-64" />
      <div className="skeleton mt-8 h-20 w-full max-w-2xl" />
      <div className="skeleton mt-14 aspect-[16/9] w-full rounded-[20px]" />
    </div>
  </div>
);

export default CaseStudySkeleton;
