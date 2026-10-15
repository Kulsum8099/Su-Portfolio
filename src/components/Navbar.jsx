import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router';
import gsap from 'gsap';
import { HiMenuAlt4, HiX } from 'react-icons/hi';
import { pauseSmoothScroll, resumeSmoothScroll, scrollToElement } from '../lib/smoothScroll';
import { hasFinePointer, prefersReducedMotion } from '../utils/motion';

const NAV_ITEMS = [
  { label: 'Home', section: 'hero' },
  { label: 'About', section: 'intro' },
  { label: 'Resume', section: 'resume' },
  { label: 'Projects', section: 'projects' },
];

const hrefFor = (section) => (section === 'hero' ? '/' : `/#${section}`);

// After an in-page jump, move keyboard / screen reader focus to the section too.
const focusSection = (id) => document.getElementById(id)?.focus({ preventScroll: true });

const Navbar = () => {
  const { pathname, key } = useLocation();
  const onHome = pathname === '/';
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolledDown, setScrolledDown] = useState(false);
  const [focusInside, setFocusInside] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const [routeKey, setRouteKey] = useState(key);
  const toggleRef = useRef(null);
  const menuRef = useRef(null);
  const itemRefs = useRef([]);

  // Close the mobile menu whenever the route changes (incl. back/forward).
  if (routeKey !== key) {
    setRouteKey(key);
    setMenuOpen(false);
  }

  const current = onHome ? activeSection : pathname.startsWith('/projects') ? 'projects' : null;
  const hidden = scrolledDown && !menuOpen && !focusInside;

  // Hide while scrolling down, show again on the way up.
  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (Math.abs(y - lastY) < 6) return;
      setScrolledDown(y > lastY && y > 120);
      lastY = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // A section is "active" while it crosses the middle of the viewport. This
  // works for sections of any height (a ratio threshold misses tall ones).
  useEffect(() => {
    if (!onHome) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActiveSection(entry.target.id);
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    for (const { section } of NAV_ITEMS) {
      const element = document.getElementById(section);
      if (element) observer.observe(element);
    }
    return () => observer.disconnect();
  }, [onHome]);

  // Open mobile menu: lock scrolling, keep focus inside, close on Escape.
  useEffect(() => {
    if (!menuOpen) return;
    const background = [document.getElementById('main-content'), document.getElementById('site-footer')];
    const toggle = toggleRef.current;
    const menu = menuRef.current;
    const links = menu ? [...menu.querySelectorAll('a')] : [];

    background.forEach((element) => element && (element.inert = true));
    document.documentElement.style.overflow = 'hidden';
    pauseSmoothScroll();
    links[0]?.focus();

    if (!prefersReducedMotion()) {
      gsap.fromTo(menu, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power2.out' });
      gsap.fromTo(links, { opacity: 0, x: -24 }, { opacity: 1, x: 0, duration: 0.45, stagger: 0.06, ease: 'power3.out' });
    }

    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      setMenuOpen(false);
      toggle?.focus();
    };
    document.addEventListener('keydown', onKeyDown);

    return () => {
      gsap.killTweensOf([menu, ...links]);
      background.forEach((element) => element && (element.inert = false));
      document.documentElement.style.overflow = '';
      resumeSmoothScroll();
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  const handleNavigate = (event, section) => {
    // Elsewhere, the router goes to "/#section" and the page scrolls itself.
    if (!onHome) return setMenuOpen(false);

    event.preventDefault();
    // Release the menu's scroll lock first, or the jump would be ignored.
    document.documentElement.style.overflow = '';
    resumeSmoothScroll();
    scrollToElement(`#${section}`, section === 'hero' ? { offset: 0 } : undefined);
    setMenuOpen(false);
    requestAnimationFrame(() => focusSection(section));
  };

  const handleMagnet = (event, index) => {
    const element = itemRefs.current[index];
    if (!element || !hasFinePointer() || prefersReducedMotion()) return;
    const rect = element.getBoundingClientRect();
    gsap.to(element, {
      x: (event.clientX - rect.left - rect.width / 2) * 0.2,
      y: (event.clientY - rect.top - rect.height / 2) * 0.2,
      duration: 0.3,
      ease: 'power2.out',
      overwrite: 'auto',
    });
  };

  const releaseMagnet = (index) => {
    const element = itemRefs.current[index];
    if (element) gsap.to(element, { x: 0, y: 0, duration: 0.5, ease: 'power3.out', overwrite: 'auto' });
  };

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 top-0 z-[100] transition-transform duration-500 ease-out-expo"
      style={{ transform: hidden ? 'translateY(-110%)' : 'none' }}
      onFocus={() => setFocusInside(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocusInside(false);
      }}
    >
      <div className="container-page py-3 sm:py-4">
        <div className="glass-strong flex items-center justify-between rounded-2xl px-3 py-1.5 shadow-[0_4px_30px_rgb(0_0_0/0.2)] sm:px-4 sm:py-2">
          <Link
            to="/"
            onClick={(event) => handleNavigate(event, 'hero')}
            className="rounded-lg px-2 py-2 text-base font-bold tracking-tight text-white transition-colors hover:text-neon-green"
            aria-label="Umme Kulsum Suriya, home"
          >
            UK<span className="text-neon-green">.</span>
          </Link>

          <ul className="hidden items-center gap-1 md:flex">
            {NAV_ITEMS.map((item, index) => {
              const isCurrent = current === item.section;
              return (
                <li key={item.section}>
                  <Link
                    ref={(element) => {
                      itemRefs.current[index] = element;
                    }}
                    to={hrefFor(item.section)}
                    onClick={(event) => handleNavigate(event, item.section)}
                    onMouseMove={(event) => handleMagnet(event, index)}
                    onMouseLeave={() => releaseMagnet(index)}
                    aria-current={isCurrent ? 'true' : undefined}
                    className={`relative block rounded-xl px-5 py-2.5 text-sm font-medium transition-colors duration-300 ${
                      isCurrent ? 'text-neon-green' : 'text-text-secondary hover:text-white'
                    }`}
                  >
                    {item.label}
                    {isCurrent && (
                      <span
                        className="absolute bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full bg-neon-green shadow-[0_0_8px_rgb(190_255_70/0.6)]"
                        aria-hidden="true"
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          <button
            ref={toggleRef}
            type="button"
            className="grid size-11 place-items-center rounded-xl text-2xl text-white transition-colors hover:bg-white/5 md:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <HiX aria-hidden="true" /> : <HiMenuAlt4 aria-hidden="true" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div
          id="mobile-menu"
          ref={menuRef}
          className="fixed inset-0 -z-10 flex items-center justify-center bg-bg-primary/95 backdrop-blur-xl md:hidden"
        >
          <ul className="w-full max-w-sm px-6">
            {NAV_ITEMS.map((item) => {
              const isCurrent = current === item.section;
              return (
                <li key={item.section}>
                  <Link
                    to={hrefFor(item.section)}
                    onClick={(event) => handleNavigate(event, item.section)}
                    aria-current={isCurrent ? 'true' : undefined}
                    className={`block rounded-xl px-5 py-4 text-3xl font-bold transition-colors duration-300 ${
                      isCurrent ? 'bg-white/10 text-neon-green' : 'text-white hover:bg-white/5 hover:text-neon-green'
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
