import { useEffect, useRef } from 'react';

const Background = () => {
  const spotlightRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (spotlightRef.current) {
        spotlightRef.current.style.background = `radial-gradient(600px circle at ${e.clientX}px ${e.clientY}px, rgba(139, 92, 246, 0.06), transparent 40%)`;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <>
      {/* Grid overlay */}
      <div className="grid-overlay" />

      {/* Cursor spotlight */}
      <div
        ref={spotlightRef}
        className="fixed inset-0 pointer-events-none z-[3] transition-opacity duration-300"
      />

      {/* Ambient gradients */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Bottom-right violet glow */}
        <div
          className="absolute -bottom-1/3 -right-1/4 w-[62vw] h-[62vw] rounded-full opacity-30"
          style={{
            background: 'radial-gradient(circle, rgba(84, 52, 210, 0.24) 0%, rgba(40, 30, 116, 0.12) 45%, transparent 75%)',
            animation: 'float-slow 8s ease-in-out infinite',
          }}
        />

        {/* Top-left indigo haze */}
        <div
          className="absolute -top-1/3 -left-1/4 w-[56vw] h-[56vw] rounded-full opacity-22"
          style={{
            background: 'radial-gradient(circle, rgba(58, 76, 192, 0.18) 0%, transparent 70%)',
            animation: 'float-slow 12s ease-in-out infinite reverse',
          }}
        />
      </div>
    </>
  );
};

export default Background;
