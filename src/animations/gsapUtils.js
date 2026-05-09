// GSAP Animation Utilities
// Reusable animation presets for the portfolio

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Fade up animation triggered on scroll
 */
export const fadeUp = (element, options = {}) => {
  const defaults = {
    y: 60,
    opacity: 0,
    duration: 1,
    ease: 'power3.out',
    delay: 0,
    stagger: 0,
    scrollTrigger: null,
  };
  const config = { ...defaults, ...options };

  return gsap.from(element, {
    y: config.y,
    opacity: config.opacity,
    duration: config.duration,
    ease: config.ease,
    delay: config.delay,
    stagger: config.stagger,
    scrollTrigger: config.scrollTrigger
      ? {
          trigger: config.scrollTrigger.trigger || element,
          start: config.scrollTrigger.start || 'top 85%',
          end: config.scrollTrigger.end || 'bottom 20%',
          toggleActions: config.scrollTrigger.toggleActions || 'play none none none',
          ...config.scrollTrigger,
        }
      : undefined,
  });
};

/**
 * Staggered reveal for child elements
 */
export const staggerReveal = (parent, childSelector, options = {}) => {
  const defaults = {
    y: 40,
    opacity: 0,
    duration: 0.8,
    stagger: 0.1,
    ease: 'power3.out',
  };
  const config = { ...defaults, ...options };

  return gsap.from(`${parent} ${childSelector}`, {
    y: config.y,
    opacity: config.opacity,
    duration: config.duration,
    stagger: config.stagger,
    ease: config.ease,
    scrollTrigger: {
      trigger: parent,
      start: 'top 80%',
      toggleActions: 'play none none none',
    },
  });
};

/**
 * Infinite floating animation
 */
export const floatAnimation = (element, options = {}) => {
  const defaults = {
    y: -15,
    duration: 3,
    rotation: 2,
    ease: 'sine.inOut',
  };
  const config = { ...defaults, ...options };

  return gsap.to(element, {
    y: config.y,
    rotation: config.rotation,
    duration: config.duration,
    ease: config.ease,
    repeat: -1,
    yoyo: true,
  });
};

/**
 * Magnetic hover effect
 */
export const magneticHover = (element, strength = 0.3) => {
  const el = typeof element === 'string' ? document.querySelector(element) : element;
  if (!el) return;

  const handleMove = (e) => {
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    gsap.to(el, {
      x: x * strength,
      y: y * strength,
      duration: 0.4,
      ease: 'power2.out',
    });
  };

  const handleLeave = () => {
    gsap.to(el, {
      x: 0,
      y: 0,
      duration: 0.6,
      ease: 'elastic.out(1, 0.3)',
    });
  };

  el.addEventListener('mousemove', handleMove);
  el.addEventListener('mouseleave', handleLeave);

  return () => {
    el.removeEventListener('mousemove', handleMove);
    el.removeEventListener('mouseleave', handleLeave);
  };
};

/**
 * Split text into spans for character animation
 */
export const splitTextToSpans = (element) => {
  const el = typeof element === 'string' ? document.querySelector(element) : element;
  if (!el) return [];

  const text = el.textContent;
  el.innerHTML = '';

  return [...text].map((char) => {
    const span = document.createElement('span');
    span.textContent = char === ' ' ? '\u00A0' : char;
    span.style.display = 'inline-block';
    el.appendChild(span);
    return span;
  });
};

/**
 * Split text reveal animation
 */
export const splitTextReveal = (element, options = {}) => {
  const spans = splitTextToSpans(element);
  const defaults = {
    y: 50,
    opacity: 0,
    duration: 0.6,
    stagger: 0.03,
    ease: 'power3.out',
    delay: 0,
  };
  const config = { ...defaults, ...options };

  return gsap.from(spans, {
    y: config.y,
    opacity: config.opacity,
    duration: config.duration,
    stagger: config.stagger,
    ease: config.ease,
    delay: config.delay,
  });
};

/**
 * Mask reveal (clip-path animation)
 */
export const maskReveal = (element, options = {}) => {
  const defaults = {
    duration: 1.2,
    ease: 'power4.inOut',
    direction: 'up', // up, down, left, right
  };
  const config = { ...defaults, ...options };

  const clipPaths = {
    up: { from: 'inset(100% 0 0 0)', to: 'inset(0% 0 0 0)' },
    down: { from: 'inset(0 0 100% 0)', to: 'inset(0 0 0% 0)' },
    left: { from: 'inset(0 100% 0 0)', to: 'inset(0 0% 0 0)' },
    right: { from: 'inset(0 0 0 100%)', to: 'inset(0 0 0 0%)' },
  };

  const clip = clipPaths[config.direction];

  return gsap.fromTo(
    element,
    { clipPath: clip.from },
    {
      clipPath: clip.to,
      duration: config.duration,
      ease: config.ease,
      scrollTrigger: config.scrollTrigger || undefined,
    }
  );
};

/**
 * Horizontal scroll setup
 */
export const horizontalScroll = (container, panels, options = {}) => {
  const defaults = {
    ease: 'none',
    snap: false,
  };
  const config = { ...defaults, ...options };

  const panelElements =
    typeof panels === 'string' ? document.querySelectorAll(panels) : panels;
  const totalWidth = Array.from(panelElements).reduce(
    (acc, el) => acc + el.offsetWidth,
    0
  );

  return gsap.to(panelElements, {
    x: () => -(totalWidth - window.innerWidth),
    ease: config.ease,
    scrollTrigger: {
      trigger: container,
      pin: true,
      scrub: 1,
      end: () => `+=${totalWidth}`,
      snap: config.snap
        ? {
            snapTo: 1 / (panelElements.length - 1),
            duration: { min: 0.2, max: 0.5 },
            ease: 'power1.inOut',
          }
        : false,
      invalidateOnRefresh: true,
    },
  });
};
