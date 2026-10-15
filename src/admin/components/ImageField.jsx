import { useRef, useState } from 'react';
import { HiOutlineArrowUpTray, HiOutlineLink, HiOutlinePhoto } from 'react-icons/hi2';
import { isSafeUrl, LIMITS } from '../../../shared/content';
import { adminApi } from '../api';
import { fieldId } from '../forms';
import { altFromFilename, measureImage, prepareImage } from '../imageUpload';
import { TextField } from './Field';

/**
 * Image picker: upload (click or drag & drop) or paste a URL, plus alt text.
 * `onChange` receives an updater function so async uploads never overwrite
 * alt text typed while the file was uploading.
 */
const ImageField = ({ path, label, hint, value, onChange, errors = {}, withCaption = false, onBusyChange }) => {
  const image = value ?? {};
  const id = fieldId(path);
  const fileRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [showUrl, setShowUrl] = useState(false);

  const setBusyState = (next) => {
    setBusy(next);
    onBusyChange?.(next);
  };

  const upload = async (file) => {
    if (!file) return;
    setProblem(null);
    setBusyState(true);
    try {
      const { blob, width, height } = await prepareImage(file);
      const uploaded = await adminApi.uploadImage(blob, file.name);
      onChange((current = {}) => ({
        ...current,
        url: uploaded.url,
        width,
        height,
        alt: current.alt || altFromFilename(file.name),
      }));
    } catch (error) {
      setProblem(error.message);
    } finally {
      setBusyState(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  // Pasted links: read the image's size so pages can reserve its space.
  const measurePastedUrl = async () => {
    const url = image.url?.trim();
    if (!url || !isSafeUrl(url)) return;
    try {
      const size = await measureImage(url);
      onChange((current = {}) => (current.url === url ? { ...current, ...size } : current));
      setProblem(null);
    } catch (error) {
      setProblem(error.message);
    }
  };

  const urlError = errors[`${path}.url`];

  return (
    <div role="group" aria-labelledby={`${id}-label`}>
      <p id={`${id}-label`} className="text-sm font-semibold text-white">
        {label}
      </p>
      {hint && <p className="mt-1 text-xs leading-relaxed text-text-muted">{hint}</p>}

      <div
        className={`relative mt-2 overflow-hidden rounded-xl border transition-colors ${
          dragging ? 'border-neon-green bg-neon-green/5' : 'border-dashed border-white/20 bg-white/[0.02]'
        } ${urlError ? 'border-danger' : ''}`}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          upload(event.dataTransfer.files?.[0]);
        }}
      >
        {image.url ? (
          <img src={image.url} alt="" className="max-h-72 w-full bg-black/25 object-contain" />
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-10 text-center">
            <HiOutlinePhoto className="text-3xl text-text-muted" aria-hidden="true" />
            <p className="text-sm text-text-secondary">Drag an image here, or</p>
            <button type="button" className="btn btn-sm btn-primary" onClick={() => fileRef.current?.click()} disabled={busy}>
              <HiOutlineArrowUpTray aria-hidden="true" /> Upload image
            </button>
            <p className="text-xs text-text-muted">JPEG, PNG, WebP, GIF or AVIF · large images are resized automatically</p>
          </div>
        )}
        {busy && (
          <div className="absolute inset-0 grid place-items-center bg-bg-primary/75" role="status">
            <span className="size-7 animate-spin rounded-full border-2 border-white/20 border-t-neon-green" aria-hidden="true" />
            <span className="sr-only">Uploading image…</span>
          </div>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(event) => upload(event.target.files?.[0])}
      />

      <div className="mt-2 flex flex-wrap gap-2">
        {image.url && (
          <>
            <button type="button" className="btn btn-sm btn-secondary" onClick={() => fileRef.current?.click()} disabled={busy}>
              <HiOutlineArrowUpTray aria-hidden="true" /> Replace
            </button>
            <button
              type="button"
              className="btn btn-sm btn-ghost"
              disabled={busy}
              onClick={() => onChange((current = {}) => ({ ...current, url: '', width: null, height: null }))}
            >
              Remove image
            </button>
          </>
        )}
        <button type="button" className="btn btn-sm btn-ghost" aria-expanded={showUrl} onClick={() => setShowUrl((open) => !open)}>
          <HiOutlineLink aria-hidden="true" /> {showUrl ? 'Hide image URL' : 'Use an image URL'}
        </button>
      </div>

      {problem && (
        <p role="alert" className="mt-2 text-xs font-medium text-danger">
          {problem}
        </p>
      )}

      <div className="mt-4 grid gap-4">
        {(showUrl || urlError) && (
          <TextField
            path={`${path}.url`}
            label="Image URL"
            type="url"
            inputMode="url"
            placeholder="https://…"
            value={image.url}
            maxLength={LIMITS.url}
            error={urlError}
            hint="A direct link to an image file. Uploading is usually more reliable."
            onChange={(url) => onChange((current = {}) => ({ ...current, url, width: null, height: null }))}
            onBlur={measurePastedUrl}
          />
        )}
        <TextField
          path={`${path}.alt`}
          label="Alt text"
          value={image.alt}
          maxLength={LIMITS.alt}
          error={errors[`${path}.alt`]}
          hint="Describe what the image shows for people using screen readers."
          onChange={(alt) => onChange((current = {}) => ({ ...current, alt }))}
        />
        {withCaption && (
          <TextField
            path={`${path}.caption`}
            label="Caption"
            value={image.caption}
            maxLength={LIMITS.caption}
            error={errors[`${path}.caption`]}
            hint="Optional — shown under the screenshot."
            onChange={(caption) => onChange((current = {}) => ({ ...current, caption }))}
          />
        )}
      </div>
    </div>
  );
};

export default ImageField;
