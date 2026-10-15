import { useCallback, useState } from 'react';
import { HiOutlineCheckCircle, HiOutlineExclamationTriangle, HiOutlineInformationCircle, HiXMark } from 'react-icons/hi2';
import { ToastContext } from './context';

const TONES = {
  success: { icon: HiOutlineCheckCircle, className: 'border-neon-green/40 text-neon-green' },
  error: { icon: HiOutlineExclamationTriangle, className: 'border-danger/50 text-danger' },
  info: { icon: HiOutlineInformationCircle, className: 'border-electric-blue/40 text-electric-blue' },
};

let nextId = 0;

/** Short confirmations ("Saved") announced politely to screen readers. */
const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => setToasts((list) => list.filter((toast) => toast.id !== id)), []);

  const notify = useCallback(
    (message, { tone = 'success', duration = tone === 'error' ? 7000 : 4000 } = {}) => {
      nextId += 1;
      const id = nextId;
      setToasts((list) => [...list.slice(-3), { id, message, tone }]);
      if (duration) setTimeout(() => dismiss(id), duration);
    },
    [dismiss],
  );

  return (
    <ToastContext value={notify}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[400] flex flex-col items-stretch gap-2 p-4 sm:items-end"
      >
        {toasts.map((toast) => {
          const tone = TONES[toast.tone] ?? TONES.info;
          const Icon = tone.icon;
          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex w-full items-start gap-3 rounded-xl border bg-bg-secondary/95 px-4 py-3 shadow-2xl backdrop-blur-md sm:max-w-sm ${tone.className}`}
            >
              <Icon className="mt-0.5 shrink-0 text-lg" aria-hidden="true" />
              <p className="flex-1 text-sm text-white">{toast.message}</p>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                className="-m-1 rounded-md p-1 text-text-secondary transition-colors hover:text-white"
                aria-label="Dismiss notification"
              >
                <HiXMark aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext>
  );
};

export default ToastProvider;
