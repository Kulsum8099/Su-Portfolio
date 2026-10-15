import { useEffect, useRef } from 'react';
import { pauseSmoothScroll, resumeSmoothScroll } from '../lib/smoothScroll';

/**
 * Accessible modal on top of the native <dialog>. The browser provides the
 * focus trap, Esc handling, an inert page behind it and focus restoration
 * on close. Content only mounts while open.
 */
const Dialog = ({ open, onClose, labelledBy, label, describedBy, className = '', children }) => {
  const ref = useRef(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // Keep the page behind the dialog from scrolling while it is open.
  useEffect(() => {
    if (!open) return;
    pauseSmoothScroll();
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = 'hidden';
    return () => {
      root.style.overflow = previous;
      resumeSmoothScroll();
    };
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={labelledBy}
      aria-label={labelledBy ? undefined : label}
      aria-describedby={describedBy}
      data-lenis-prevent
      className={`m-auto max-h-[calc(100svh-2rem)] max-w-[calc(100vw-2rem)] overflow-auto border-0 bg-transparent p-0 text-white ${className}`}
      onCancel={(event) => {
        event.preventDefault(); // let React state decide when to close
        onClose();
      }}
      onClick={(event) => {
        if (event.target === ref.current) onClose(); // click on the backdrop
      }}
    >
      {open && children}
    </dialog>
  );
};

export default Dialog;
