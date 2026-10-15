import { useEffect } from 'react';
import { Outlet, useNavigation } from 'react-router';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Background from '../components/Background';
import CustomCursor from '../components/CustomCursor';
import Navbar from '../components/Navbar';
import { useRouteScroll } from '../hooks/useRouteScroll';
import { useProfile } from '../lib/content';
import { startSmoothScroll } from '../lib/smoothScroll';
import Footer from '../sections/Footer';

/** Thin progress bar while a code-split page downloads. */
const RouteProgress = () => {
  const navigation = useNavigation();
  if (navigation.state === 'idle') return null;
  return (
    <div className="fixed inset-x-0 top-0 z-[300] h-0.5 overflow-hidden" role="progressbar" aria-label="Loading page">
      <div className="h-full w-1/3 animate-route-progress bg-neon-green" />
    </div>
  );
};

const skipToContent = (event) => {
  event.preventDefault();
  document.getElementById('main-content')?.focus();
};

/** Shell shared by every public page: background, cursor, navigation, footer. */
const PublicLayout = () => {
  const { data: profile } = useProfile();
  useRouteScroll();

  useEffect(() => startSmoothScroll(), []);

  // Web fonts change text heights once they arrive; re-measure scroll animations.
  useEffect(() => {
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
  }, []);

  return (
    <>
      <a className="skip-link" href="#main-content" onClick={skipToContent}>
        Skip to content
      </a>
      <CustomCursor />
      <Background />
      <Navbar />
      {/* z-10 keeps content above the fixed grid overlay. Pages own their spacing. */}
      <main id="main-content" tabIndex={-1} className="relative z-10">
        <Outlet />
      </main>
      <Footer profile={profile} />
      <RouteProgress />
    </>
  );
};

export default PublicLayout;
