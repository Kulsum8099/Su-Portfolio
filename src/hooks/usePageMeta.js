import { useEffect } from 'react';

export const SITE_NAME = 'Umme Kulsum Suriya';
const DEFAULT_TITLE = `${SITE_NAME} — UX/UI Designer Portfolio`;
const DEFAULT_DESCRIPTION =
  'Umme Kulsum Suriya — UX/UI designer crafting seamless, user-centered digital experiences that drive engagement and innovation.';

function setMeta(name, content) {
  let element = document.head.querySelector(`meta[name="${name}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute('name', name);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
  return element;
}

/** Sets the document title / description for a page and restores the defaults afterwards. */
export function usePageMeta({ title, description, noIndex = false } = {}) {
  useEffect(() => {
    document.title = title ? `${title} — ${SITE_NAME}` : DEFAULT_TITLE;
    setMeta('description', description || DEFAULT_DESCRIPTION);
    const robots = noIndex ? setMeta('robots', 'noindex') : null;
    return () => {
      document.title = DEFAULT_TITLE;
      setMeta('description', DEFAULT_DESCRIPTION);
      robots?.remove();
    };
  }, [title, description, noIndex]);
}
