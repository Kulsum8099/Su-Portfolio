/** A titled card that groups related form fields. */
const Section = ({ id, title, description, children }) => (
  <section aria-labelledby={`${id}-title`} className="surface p-5 sm:p-7">
    <h2 id={`${id}-title`} className="text-lg font-bold text-white">
      {title}
    </h2>
    {description && <p className="mt-1 text-sm leading-relaxed text-text-secondary">{description}</p>}
    <div className="mt-6 grid gap-6">{children}</div>
  </section>
);

export default Section;
