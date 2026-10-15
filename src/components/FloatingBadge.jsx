import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { hasFinePointer, prefersReducedMotion } from '../utils/motion';

// Dark ink on every colour keeps the badge text above WCAG AA contrast.
const COLORS = {
  pink: { bg: 'rgb(255 107 157 / 0.92)', glow: '0 0 20px rgb(255 107 157 / 0.4), 0 4px 15px rgb(0 0 0 / 0.3)' },
  green: { bg: 'rgb(190 255 70 / 0.92)', glow: '0 0 20px rgb(190 255 70 / 0.4), 0 4px 15px rgb(0 0 0 / 0.3)' },
  purple: { bg: 'rgb(139 92 246 / 0.95)', glow: '0 0 20px rgb(139 92 246 / 0.4), 0 4px 15px rgb(0 0 0 / 0.3)' },
  blue: { bg: 'rgb(59 130 246 / 0.95)', glow: '0 0 20px rgb(59 130 246 / 0.4), 0 4px 15px rgb(0 0 0 / 0.3)' },
};

const FloatingBadge = ({ text, color = 'pink', className = '', delay = 0, floatRange = 15, duration = 3, icon = null }) => {
  const badgeRef = useRef(null);
  const colors = COLORS[color] ?? COLORS.pink;

  useEffect(() => {
    const element = badgeRef.current;
    if (!element || prefersReducedMotion()) return;

    const float = gsap.to(element, {
      y: -floatRange,
      rotation: gsap.utils.random(-3, 3),
      duration: duration + gsap.utils.random(-0.5, 0.5),
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
      delay,
    });

    if (!hasFinePointer()) return () => float.kill();

    // Magnetic hover for mouse users. Uses x so it never fights the y float.
    const xTo = gsap.quickTo(element, 'x', { duration: 0.35, ease: 'power2.out' });
    const handleMove = (event) => {
      const rect = element.getBoundingClientRect();
      xTo((event.clientX - rect.left - rect.width / 2) * 0.25);
    };
    const handleLeave = () => xTo(0);
    element.addEventListener('mousemove', handleMove);
    element.addEventListener('mouseleave', handleLeave);

    return () => {
      float.kill();
      gsap.killTweensOf(element);
      element.removeEventListener('mousemove', handleMove);
      element.removeEventListener('mouseleave', handleLeave);
    };
  }, [delay, floatRange, duration]);

  return (
    <div
      ref={badgeRef}
      className={`inline-flex w-fit items-center gap-2 rounded-md px-3.5 py-1.5 text-sm font-semibold whitespace-nowrap text-bg-primary select-none sm:text-base md:gap-2.5 md:px-5 md:py-2 md:text-lg lg:text-xl ${className}`}
      style={{ background: colors.bg, boxShadow: colors.glow }}
      data-cursor-text="✦"
    >
      {icon && <span className="text-base leading-none md:text-xl">{icon}</span>}
      {text}
    </div>
  );
};

export default FloatingBadge;
