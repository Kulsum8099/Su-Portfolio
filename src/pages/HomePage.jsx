import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Loader from '../components/Loader';
import { fallbackProfile } from '../data/profileData';
import { usePageMeta } from '../hooks/usePageMeta';
import { useProfile, useProjects } from '../lib/content';
import { markIntroPlayed, shouldPlayIntro } from '../lib/intro';
import { scrollToElement } from '../lib/smoothScroll';
import Hero from '../sections/Hero';
import Intro from '../sections/Intro';
import ProjectIndex from '../sections/ProjectIndex';
import Resume from '../sections/Resume';

const HomePage = () => {
  const location = useLocation();
  const [loaderVisible, setLoaderVisible] = useState(shouldPlayIntro);
  const [heroReady, setHeroReady] = useState(() => !shouldPlayIntro());
  const { data: projects, isLoading: projectsLoading } = useProjects();
  const { data: profile } = useProfile();
  const hashSettledFor = useRef(null);
  usePageMeta();

  // Featured projects lead on the home page; with none featured, show all.
  const published = projects ?? [];
  const featured = published.filter((project) => project.featured);
  const shown = featured.length > 0 ? featured : published;
  const contentReady = !projectsLoading && Boolean(profile);

  // Content above the pinned project strip changes height when data arrives,
  // so ScrollTrigger re-measures its start/end positions.
  useEffect(() => {
    if (!contentReady) return;
    const frame = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(frame);
  }, [contentReady, profile, projects]);

  // Arriving at "/#section" before the content loaded: land on it once settled.
  useEffect(() => {
    if (!location.hash || !contentReady || hashSettledFor.current === location.key) return;
    hashSettledFor.current = location.key;
    const frame = requestAnimationFrame(() => scrollToElement(location.hash, { immediate: true }));
    return () => cancelAnimationFrame(frame);
  }, [location.hash, location.key, contentReady]);

  const name = profile?.name ?? fallbackProfile.name;

  return (
    <>
      {loaderVisible && (
        <Loader
          name={name}
          role={profile?.role || fallbackProfile.role}
          onReveal={() => {
            markIntroPlayed();
            setHeroReady(true);
          }}
          onComplete={() => setLoaderVisible(false)}
        />
      )}
      <Hero ready={heroReady} name={name} />
      <Intro />
      <Resume profile={profile} />
      <ProjectIndex projects={shown} totalCount={published.length} isLoading={projectsLoading} />
    </>
  );
};

export default HomePage;
