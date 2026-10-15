/** Accessible on/off toggle (a button with role="switch"). */
const Switch = ({ id, label, description, checked, onChange, disabled = false }) => (
  <div className="flex items-start justify-between gap-4">
    <div>
      <p id={`${id}-label`} className="text-sm font-semibold text-white">
        {label}
      </p>
      {description && (
        <p id={`${id}-description`} className="mt-0.5 text-xs leading-relaxed text-text-muted">
          {description}
        </p>
      )}
    </div>
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-labelledby={`${id}-label`}
      aria-describedby={description ? `${id}-description` : undefined}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative mt-0.5 inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition-colors duration-200 disabled:opacity-50 ${
        checked ? 'border-neon-green bg-neon-green' : 'border-white/20 bg-white/10'
      }`}
    >
      <span
        aria-hidden="true"
        className={`inline-block size-5 rounded-full shadow transition-transform duration-200 ${
          checked ? 'translate-x-[1.375rem] bg-bg-primary' : 'translate-x-1 bg-white'
        }`}
      />
    </button>
  </div>
);

export default Switch;
