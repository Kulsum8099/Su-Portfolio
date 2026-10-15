import { useId } from 'react';
import Dialog from '../../components/Dialog';

/** Yes/no confirmation. The safe choice (Cancel) comes first and gets focus. */
const ConfirmDialog = ({ open, title, children, confirmLabel = 'Confirm', tone = 'primary', busy = false, onConfirm, onCancel }) => {
  const id = useId();
  return (
    <Dialog open={open} onClose={busy ? () => {} : onCancel} labelledBy={`${id}-title`} describedBy={`${id}-body`} className="w-[min(28rem,calc(100vw-2rem))]">
      <div className="rounded-2xl border border-white/10 bg-bg-secondary p-6 shadow-2xl">
        <h2 id={`${id}-title`} className="text-lg font-bold text-white">
          {title}
        </h2>
        <div id={`${id}-body`} className="mt-2 text-sm leading-relaxed text-text-secondary">
          {children}
        </div>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
          <button
            type="button"
            className={`btn ${tone === 'danger' ? 'btn-danger' : 'btn-primary'}`}
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? 'Working…' : confirmLabel}
          </button>
        </div>
      </div>
    </Dialog>
  );
};

export default ConfirmDialog;
