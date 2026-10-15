import { useRef } from 'react';
import gsap from 'gsap';
import { hasFinePointer, prefersReducedMotion } from '../utils/motion';

const LABEL_STYLES = {
  pink: { chip: 'bg-neon-pink text-bg-primary', glow: '0 0 15px rgb(255 107 157 / 0.4)' },
  green: { chip: 'bg-neon-green text-bg-primary', glow: '0 0 15px rgb(190 255 70 / 0.4)' },
  purple: { chip: 'bg-neon-purple text-bg-primary', glow: '0 0 15px rgb(139 92 246 / 0.4)' },
  blue: { chip: 'bg-electric-blue text-bg-primary', glow: '0 0 15px rgb(59 130 246 / 0.4)' },
  lightpink: { chip: 'bg-[#FFE2E8] text-[#1A1A1A]', glow: '0 0 15px rgb(255 226 232 / 0.4)' },
};

let tiltAllowed;
const canTilt = () => (tiltAllowed ??= hasFinePointer() && !prefersReducedMotion());

/** Resume card with a coloured label heading and a subtle 3D tilt on hover. */
const BentoCard = ({ children, label, labelColor = 'pink', className = '' }) => {
  const cardRef = useRef(null);
  const style = LABEL_STYLES[labelColor] ?? LABEL_STYLES.pink;

  const handleMouseMove = (event) => {
    const card = cardRef.current;
    if (!card || !canTilt()) return;
    const rect = card.getBoundingClientRect();
    gsap.to(card, {
      rotateX: (event.clientY - rect.top - rect.height / 2) / 30,
      rotateY: (rect.width / 2 - (event.clientX - rect.left)) / 30,
      y: -4,
      transformPerspective: 900,
      duration: 0.4,
      ease: 'power2.out',
      overwrite: 'auto',
    });
  };

  const handleMouseLeave = () => {
    if (!canTilt()) return;
    gsap.to(cardRef.current, { rotateX: 0, rotateY: 0, y: 0, duration: 0.6, ease: 'power3.out', overwrite: 'auto' });
  };

  return (
    <div ref={cardRef} className={`relative ${className}`} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      {label && (
        <h3 className="mb-5 leading-none md:mb-6">
          <span
            className={`${style.chip} inline-block rounded-lg px-3 py-1.5 text-xl font-bold md:text-[1.65rem]`}
            style={{ boxShadow: style.glow }}
          >
            {label}
          </span>
        </h3>
      )}
      <div>{children}</div>
    </div>
  );
};

export default BentoCard;
