import { useRef } from 'react';
import gsap from 'gsap';

const BentoCard = ({ children, label, labelColor = 'pink', className = '', span = '' }) => {
  const cardRef = useRef(null);

  const colors = {
    pink:      { bg: 'bg-neon-pink',      text: 'text-white',       shadow: '0 0 15px rgba(255,107,157,0.4)'  },
    green:     { bg: 'bg-neon-green',     text: 'text-bg-primary',  shadow: '0 0 15px rgba(190,255,70,0.4)'   },
    purple:    { bg: 'bg-neon-purple',    text: 'text-white',       shadow: '0 0 15px rgba(139,92,246,0.4)'   },
    blue:      { bg: 'bg-electric-blue',  text: 'text-white',       shadow: '0 0 15px rgba(59,130,246,0.4)'   },
    lightpink: { bg: 'bg-[#FFE2E8]',      text: 'text-[#1A1A1A]',   shadow: '0 0 15px rgba(255,226,232,0.4)'  },
  };
  const lc = colors[labelColor] || colors.pink;

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const rotateX =  (e.clientY - rect.top  - rect.height / 2) / 20;
    const rotateY =  (rect.width / 2 - (e.clientX - rect.left)) / 20;
    gsap.to(card, { rotateX, rotateY, y: -5, duration: 0.4, ease: 'power2.out' });
  };

  const handleMouseLeave = () => {
    gsap.to(cardRef.current, { rotateX: 0, rotateY: 0, y: 0, duration: 0.6, ease: 'elastic.out(1,0.5)' });
  };

  return (
    <div
      ref={cardRef}
      className={`relative rounded-2xl border border-dashed border-white/20 hover:border-white/30 transition-colors duration-300 will-change-transform ${span} ${className}`}
      style={{ background: 'rgba(8, 12, 33, 0.74)', backdropFilter: 'blur(8px)', perspective: '1000px' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      data-cursor-text="View"
    >
      {/* Label badge — sits above the top border */}
      {label && (
        <div className="px-6 pt-6 pb-0">
          <span
            className={`${lc.bg} ${lc.text} px-3.5 py-1 rounded-[8px] text-lg md:text-[1.65rem] leading-none font-bold inline-block`}
            style={{ boxShadow: lc.shadow }}
          >
            {label}
          </span>
        </div>
      )}

      {/* Content — padded on all sides, top padding tighter since label already adds space */}
      <div className="px-6 pt-4 pb-6">
        {children}
      </div>
    </div>
  );
};

export default BentoCard;