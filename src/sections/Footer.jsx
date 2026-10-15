import { RiArrowUpLine } from 'react-icons/ri';
import SocialIcon from '../components/SocialIcon';
import { smoothScrollToTop } from '../lib/smoothScroll';

const scrollToTop = () => {
  smoothScrollToTop();
  document.getElementById('main-content')?.focus({ preventScroll: true });
};

const Footer = ({ profile }) => {
  const email = profile?.email;
  const links = [
    profile?.linkedin && { label: 'LinkedIn', url: profile.linkedin },
    ...(profile?.socials ?? []),
  ].filter(Boolean);

  return (
    <footer id="site-footer" className="relative z-10 pt-8 pb-10 md:pt-12 md:pb-14">
      <div className="container-page">
        <div className="rounded-2xl border border-dashed border-white/20 bg-surface/80 p-6 backdrop-blur-sm sm:p-10 lg:p-12">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
            <div className="max-w-xl">
              <p className="eyebrow mb-3 text-neon-green md:text-sm">Let&apos;s Collaborate</p>
              <h2 className="mb-4 text-[clamp(1.875rem,5vw,3rem)] leading-[1.1] font-bold text-white">
                Build your next
                <br />
                <span className="text-neon-pink">standout product</span>
              </h2>
              <p className="max-w-md text-sm leading-relaxed text-text-secondary md:text-base">
                Open for product design, UX strategy, and end-to-end UI systems.
              </p>
            </div>

            <div className="flex min-w-0 flex-col items-start gap-3 lg:items-end">
              {email ? (
                <a
                  href={`mailto:${email}`}
                  className="group inline-flex max-w-full items-center gap-3 rounded-xl bg-neon-green px-5 py-3.5 text-sm font-bold text-bg-primary shadow-[0_8px_24px_rgb(190_255_70/0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgb(190_255_70/0.5)] sm:px-7 sm:py-4 md:text-base"
                  data-cursor-text="Email"
                >
                  {/* <wbr> lets the address break after "@" on very narrow screens */}
                  <span className="min-w-0 [overflow-wrap:anywhere]">
                    {email.split('@')[0]}@<wbr />
                    {email.split('@')[1]}
                  </span>
                  <svg
                    className="size-4 shrink-0 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7v10" />
                  </svg>
                </a>
              ) : (
                <div className="skeleton h-13 w-64" aria-hidden="true" />
              )}
              {profile?.availability && <p className="text-xs tracking-wide text-text-secondary">{profile.availability}</p>}

              {links.length > 0 && (
                <ul className="mt-1 flex flex-wrap gap-2" aria-label="Elsewhere">
                  {links.map((link) => (
                    <li key={link.url}>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="grid size-11 place-items-center rounded-xl border border-white/15 text-lg text-white/80 transition-colors duration-300 hover:border-neon-green/50 hover:text-neon-green"
                        data-cursor-text={link.label}
                      >
                        <SocialIcon url={link.url} />
                        <span className="sr-only">{link.label} (opens in a new tab)</span>
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-6 text-xs text-text-secondary sm:flex-row sm:items-center md:mt-12">
            <p className="font-medium tracking-wide text-white/60">
              © {new Date().getFullYear()} <span className="text-white/85">{profile?.name ?? 'Umme Kulsum Suriya'}</span>
            </p>
            <div className="flex items-center gap-4">
              <p className="tracking-wide text-white/60">UX · UI · Product Design</p>
              <button
                type="button"
                onClick={scrollToTop}
                className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 font-semibold text-white/80 transition-colors hover:text-neon-green"
                data-cursor-text="Top"
              >
                <RiArrowUpLine aria-hidden="true" className="text-sm" />
                Back to top
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
