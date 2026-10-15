import { HiChevronLeft, HiChevronRight, HiXMark } from 'react-icons/hi2';
import Dialog from './Dialog';

/** Full-screen screenshot viewer: arrow keys / buttons to browse, Esc to close. */
const Lightbox = ({ images, index, onClose, onChange }) => {
  const open = index !== null;
  const image = open ? images[index] : null;
  const count = images.length;
  const go = (step) => onChange((index + step + count) % count);

  const handleKeyDown = (event) => {
    if (count < 2) return;
    if (event.key === 'ArrowRight') go(1);
    if (event.key === 'ArrowLeft') go(-1);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      label="Screenshot viewer"
      className="h-[calc(100svh-2rem)] w-[calc(100vw-2rem)] max-w-6xl"
    >
      {image && (
        <div className="flex h-full flex-col" onKeyDown={handleKeyDown}>
          <div className="flex items-center justify-between gap-4 pb-3">
            <p className="text-sm text-text-secondary" aria-live="polite">
              {count > 1 ? `Screenshot ${index + 1} of ${count}` : 'Screenshot'}
            </p>
            <button type="button" onClick={onClose} className="btn btn-icon btn-secondary" aria-label="Close viewer">
              <HiXMark className="text-xl" aria-hidden="true" />
            </button>
          </div>

          <figure className="relative flex min-h-0 flex-1 flex-col items-center justify-center gap-3">
            <img
              key={image.url}
              src={image.url}
              alt={image.alt || image.caption || `Screenshot ${index + 1}`}
              className="min-h-0 max-w-full flex-1 rounded-xl object-contain"
            />
            {image.caption && <figcaption className="text-center text-sm text-text-secondary">{image.caption}</figcaption>}

            {count > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => go(-1)}
                  className="btn btn-icon btn-secondary absolute top-1/2 left-0 -translate-y-1/2 bg-bg-primary/70 sm:left-2"
                  aria-label="Previous screenshot"
                >
                  <HiChevronLeft className="text-xl" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  className="btn btn-icon btn-secondary absolute top-1/2 right-0 -translate-y-1/2 bg-bg-primary/70 sm:right-2"
                  aria-label="Next screenshot"
                >
                  <HiChevronRight className="text-xl" aria-hidden="true" />
                </button>
              </>
            )}
          </figure>
        </div>
      )}
    </Dialog>
  );
};

export default Lightbox;
