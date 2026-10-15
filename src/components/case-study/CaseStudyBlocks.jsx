import { useState } from 'react';
import { HiCheck } from 'react-icons/hi2';
import Lightbox from '../Lightbox';

/** Plain text from the admin panel: blank lines start new paragraphs. */
export const Prose = ({ text, className = '' }) => (
  <div className={`max-w-[68ch] space-y-4 text-base leading-relaxed text-text-secondary sm:text-lg ${className}`}>
    {text
      .split(/\n{2,}/)
      .filter(Boolean)
      .map((paragraph, index) => (
        <p key={index} className="whitespace-pre-line">
          {paragraph}
        </p>
      ))}
  </div>
);

export const Goals = ({ items, accent }) => (
  <ul className="grid gap-3 sm:grid-cols-2">
    {items.map((goal, index) => (
      <li key={index} className="surface flex items-start gap-3 p-5">
        <span className={`mt-0.5 grid size-7 shrink-0 place-items-center rounded-full ${accent.chip}`} aria-hidden="true">
          <HiCheck className="text-sm" />
        </span>
        <span className="leading-relaxed text-white/90">{goal}</span>
      </li>
    ))}
  </ul>
);

export const Features = ({ items, accent }) => (
  <ul className="grid gap-4 sm:grid-cols-2">
    {items.map((feature, index) => (
      <li key={index} className="surface p-6">
        <span className={`font-pixel text-[0.65rem] ${accent.text}`} aria-hidden="true">
          {String(index + 1).padStart(2, '0')}
        </span>
        <h3 className="mt-3 text-lg font-bold text-white sm:text-xl">{feature.title}</h3>
        {feature.description && (
          <p className="mt-2 leading-relaxed whitespace-pre-line text-text-secondary">{feature.description}</p>
        )}
      </li>
    ))}
  </ul>
);

export const Process = ({ steps, accent }) => (
  <ol>
    {steps.map((step, index) => {
      const last = index === steps.length - 1;
      return (
        <li key={index} className="grid grid-cols-[2.25rem_minmax(0,1fr)] gap-x-5">
          <div className="flex flex-col items-center">
            <span className={`grid size-9 shrink-0 place-items-center rounded-full text-sm font-bold ${accent.chip}`}>
              {index + 1}
            </span>
            {!last && <span className="mt-2 w-px flex-1 bg-white/15" aria-hidden="true" />}
          </div>
          <div className={last ? '' : 'pb-10'}>
            <h3 className="pt-1.5 text-lg font-bold text-white sm:text-xl">{step.title}</h3>
            {step.description && <Prose text={step.description} className="mt-2 sm:text-base" />}
          </div>
        </li>
      );
    })}
  </ol>
);

export const Gallery = ({ images }) => {
  const [openIndex, setOpenIndex] = useState(null);
  const oddCount = images.length % 2 === 1;

  return (
    <>
      <ul className="grid gap-4 sm:grid-cols-2 sm:gap-6">
        {images.map((shot, index) => (
          <li key={`${shot.url}-${index}`} className={oddCount && index === 0 ? 'sm:col-span-2' : undefined}>
            <figure>
              <button
                type="button"
                onClick={() => setOpenIndex(index)}
                className="group block w-full rounded-[16px] bg-white/95 p-2 text-left shadow-[0_18px_40px_rgb(0_0_0/0.3)] sm:p-2.5"
                aria-label={`Enlarge screenshot: ${shot.alt || shot.caption || `screenshot ${index + 1}`}`}
                data-cursor-text="Zoom"
              >
                <span className="block overflow-hidden rounded-[10px] bg-bg-secondary">
                  <img
                    src={shot.url}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="aspect-[4/3] w-full object-cover transition-transform duration-700 ease-out-expo group-hover:scale-[1.03]"
                  />
                </span>
              </button>
              {shot.caption && <figcaption className="mt-3 text-sm text-text-secondary">{shot.caption}</figcaption>}
            </figure>
          </li>
        ))}
      </ul>
      <Lightbox images={images} index={openIndex} onClose={() => setOpenIndex(null)} onChange={setOpenIndex} />
    </>
  );
};

// "40% reduction in scheduling time" → { metric: "40%", label: "reduction in scheduling time" }
const METRIC = /^([~≈+]?\d[\d.,]*\s?(?:%|x|×|k|K|M|B)?\+?)\s+(.+)$/;

export const Outcomes = ({ items, accent }) => (
  <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
    {items.map((outcome, index) => {
      const match = METRIC.exec(outcome);
      return (
        <li key={index} className="surface flex min-h-32 flex-col justify-center p-6">
          {match ? (
            <>
              <p className={`text-4xl leading-none font-bold tracking-tight sm:text-5xl ${accent.text}`}>{match[1]}</p>
              <p className="mt-3 leading-snug text-text-secondary">{match[2]}</p>
            </>
          ) : (
            <p className="text-lg leading-snug font-semibold text-white">{outcome}</p>
          )}
        </li>
      );
    })}
  </ul>
);
