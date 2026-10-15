import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { FaCheck } from 'react-icons/fa';
import { HiOutlineMail, HiOutlinePhone } from 'react-icons/hi';
import { RiGlobalLine, RiLinkedinFill } from 'react-icons/ri';
import { revealOnScroll } from '../animations/reveal';
import BentoCard from '../components/BentoCard';
import ToolIcon from '../components/ToolIcon';

/*
  LAYOUT
  • Gutters/width come from the shared `container-page` utility.
  • Columns: 1 (mobile) → 2-col bento (md–lg) → 3 columns (xl+).
*/
const itemList = 'divide-y divide-white/10';
const item = 'py-3.5 first:pt-0 last:pb-0';
const itemTitle = 'text-base leading-snug font-semibold text-white md:text-[1.05rem]';
const itemMeta = 'text-sm leading-snug text-text-muted';

/** "https://www.linkedin.com/in/name/" → "linkedin.com/in/name" */
const displayUrl = (url) => {
  try {
    const { hostname, pathname } = new URL(url);
    return `${hostname.replace(/^www\./, '')}${pathname}`.replace(/\/+$/, '');
  } catch {
    return url;
  }
};

const contactLinks = (profile) =>
  [
    profile.phone && {
      key: 'phone',
      kind: 'Phone',
      icon: <HiOutlinePhone className="text-neon-pink" />,
      label: profile.phone,
      href: `tel:${profile.phone.replace(/[^\d+]/g, '')}`,
    },
    profile.email && {
      key: 'email',
      kind: 'Email',
      icon: <HiOutlineMail className="text-neon-purple" />,
      label: profile.email,
      href: `mailto:${profile.email}`,
    },
    profile.website && {
      key: 'website',
      kind: 'Website',
      icon: <RiGlobalLine className="text-neon-green" />,
      label: displayUrl(profile.website),
      href: profile.website,
      external: true,
    },
    profile.linkedin && {
      key: 'linkedin',
      kind: 'LinkedIn',
      icon: <RiLinkedinFill className="text-electric-blue" />,
      label: displayUrl(profile.linkedin),
      href: profile.linkedin,
      external: true,
    },
  ].filter(Boolean);

const ResumeSkeleton = () => (
  <div className="container-page grid grid-cols-1 gap-12 md:grid-cols-2 xl:grid-cols-3" aria-hidden="true">
    {[0, 1, 2].map((column) => (
      <div key={column} className="flex flex-col gap-5">
        <div className="skeleton h-10 w-2/3" />
        {[0, 1, 2, 3].map((row) => (
          <div key={row} className="skeleton h-14" />
        ))}
      </div>
    ))}
  </div>
);

const Resume = ({ profile }) => {
  const sectionRef = useRef(null);

  useGSAP(
    () => {
      if (profile) revealOnScroll(sectionRef.current.querySelectorAll('.resume-card'));
    },
    { scope: sectionRef, dependencies: [Boolean(profile)] },
  );

  return (
    <section id="resume" ref={sectionRef} tabIndex={-1} aria-labelledby="resume-heading" className="section-y">
      {!profile ? (
        <>
          <h2 id="resume-heading" className="sr-only">
            Resume
          </h2>
          <ResumeSkeleton />
        </>
      ) : (
        <div className="container-page grid grid-cols-1 items-start gap-x-8 gap-y-12 md:grid-cols-2 xl:grid-cols-[34fr_37fr_29fr] xl:gap-x-12">
          {/* ── Left: profile + experience ── */}
          <div className="flex min-w-0 flex-col gap-12">
            <div className="flex flex-col gap-5">
              <div>
                <h2 id="resume-heading" className="text-[clamp(2.25rem,5vw,3rem)] leading-[1.05] font-bold text-white">
                  <span className="sr-only">Resume: </span>
                  {profile.name}
                </h2>
                {profile.role && (
                  <p className="mt-2 text-sm tracking-[0.15em] text-text-secondary uppercase">{profile.role}</p>
                )}
              </div>

              {/* Contact pills — two per row only when each pill fits its text */}
              <ul className="grid grid-cols-[repeat(auto-fit,minmax(14.5rem,1fr))] gap-3" aria-label="Contact details">
                {contactLinks(profile).map((contact) => (
                  <li key={contact.key} className="min-w-0">
                    <a
                      href={contact.href}
                      {...(contact.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                      className="flex min-h-12 items-center gap-3 rounded-xl border border-dashed border-white/20 bg-surface/70 px-4 py-3 text-sm text-white/90 transition-colors duration-300 hover:border-white/40 hover:bg-white/5 hover:text-white"
                    >
                      <span className="shrink-0 text-base" aria-hidden="true">
                        {contact.icon}
                      </span>
                      <span className="sr-only">{contact.kind}: </span>
                      <span className="min-w-0 [overflow-wrap:anywhere]">{contact.label}</span>
                      {contact.external && <span className="sr-only"> (opens in a new tab)</span>}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {profile.experience?.length > 0 && (
              <div className="resume-card">
                <BentoCard label="Experience" labelColor="pink">
                  <ul className={itemList}>
                    {profile.experience.map((entry, index) => (
                      <li key={`${entry.title}-${index}`} className={item}>
                        <h4 className={itemTitle}>{entry.title}</h4>
                        <p className={`${itemMeta} mt-1`}>{[entry.period, entry.organization].filter(Boolean).join(' | ')}</p>
                      </li>
                    ))}
                  </ul>
                </BentoCard>
              </div>
            )}
          </div>

          {/* ── Middle: education + certifications ── */}
          <div className="flex min-w-0 flex-col gap-12">
            {profile.education?.length > 0 && (
              <div className="resume-card">
                <BentoCard label="Education" labelColor="green">
                  <ul className={itemList}>
                    {profile.education.map((entry, index) => (
                      <li key={`${entry.degree}-${index}`} className={item}>
                        <p className="text-xs text-text-muted">{[entry.period, entry.location].filter(Boolean).join(' | ')}</p>
                        <h4 className={`${itemTitle} mt-1`}>{entry.degree}</h4>
                        {entry.institution && <p className={`${itemMeta} mt-0.5`}>{entry.institution}</p>}
                      </li>
                    ))}
                  </ul>
                </BentoCard>
              </div>
            )}

            {profile.certifications?.length > 0 && (
              <div className="resume-card">
                <BentoCard label="Certifications" labelColor="purple">
                  <ul className={itemList}>
                    {profile.certifications.map((entry, index) => (
                      <li key={`${entry.title}-${index}`} className={item}>
                        <h4 className={itemTitle}>{entry.title}</h4>
                        {entry.issuer && <p className={`${itemMeta} mt-1`}>{entry.issuer}</p>}
                      </li>
                    ))}
                  </ul>
                </BentoCard>
              </div>
            )}
          </div>

          {/* ── Right: skills, tools, about ──
              md–lg: spans both columns as its own 2-col bento; xl+: a normal column */}
          <div className="grid min-w-0 grid-cols-1 gap-12 md:col-span-2 md:grid-cols-2 md:gap-x-8 xl:col-span-1 xl:grid-cols-1">
            {profile.skills?.length > 0 && (
              <div className="resume-card md:row-span-2 xl:row-span-1">
                <BentoCard label="Skills" labelColor="lightpink">
                  <ul className="grid grid-cols-[repeat(auto-fill,minmax(9rem,1fr))] gap-x-4 gap-y-3">
                    {profile.skills.map((skill) => (
                      <li key={skill} className="flex items-start gap-2 text-sm leading-snug text-text-secondary">
                        <FaCheck className="mt-[0.3em] shrink-0 text-xs text-neon-green" aria-hidden="true" />
                        <span>{skill}</span>
                      </li>
                    ))}
                  </ul>
                </BentoCard>
              </div>
            )}

            {profile.tools?.length > 0 && (
              <div className="resume-card">
                <BentoCard label="Tools" labelColor="pink">
                  <ul className="grid grid-cols-4 gap-2">
                    {profile.tools.map((tool, index) => (
                      <li
                        key={`${tool.name}-${index}`}
                        title={tool.name}
                        className="group flex h-14 items-center justify-center rounded-xl transition-colors hover:bg-white/5"
                      >
                        <span
                          className="flex size-8 items-center justify-center transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-125"
                          aria-hidden="true"
                        >
                          <ToolIcon tool={tool} />
                        </span>
                        <span className="sr-only">{tool.name}</span>
                      </li>
                    ))}
                  </ul>
                </BentoCard>
              </div>
            )}

            {profile.aboutQuote && (
              <div className="resume-card">
                <BentoCard label="About me!" labelColor="green">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex gap-3 text-5xl" aria-hidden="true">
                      <span>😍</span>
                      <span>🐱</span>
                    </div>
                    <p className="min-w-[10rem] flex-1 text-base text-text-secondary italic">
                      &ldquo;{profile.aboutQuote}&rdquo;
                    </p>
                  </div>
                </BentoCard>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default Resume;
