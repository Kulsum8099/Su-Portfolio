import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

const CustomCursor = () => {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const auraRef = useRef(null);
  const textRef = useRef(null);
  const [cursorText, setCursorText] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const mousePos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
    if (!hasFinePointer) {
      setEnabled(false);
      return;
    }

    setEnabled(true);

    const handleMouseMove = (e) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      setIsVisible(true);

      gsap.to(dotRef.current, {
        x: e.clientX - 4.5,
        y: e.clientY - 4.5,
        duration: 0.12,
        ease: 'power2.out',
      });

      gsap.to(ringRef.current, {
        x: e.clientX - 19,
        y: e.clientY - 19,
        duration: 0.24,
        ease: 'power2.out',
      });

      gsap.to(auraRef.current, {
        x: e.clientX - 80,
        y: e.clientY - 80,
        duration: 0.55,
        ease: 'power2.out',
      });

      if (textRef.current) {
        gsap.to(textRef.current, {
          x: e.clientX + 25,
          y: e.clientY - 10,
          duration: 0.3,
          ease: 'power2.out',
        });
      }
    };

    const handleWindowLeave = () => {
      setIsVisible(false);
      setCursorText('');
    };

    const handleWindowEnter = () => setIsVisible(true);

    const interactiveSelector =
      'a, button, [data-cursor], [data-cursor-text], input, textarea, select';

    const handleMouseOver = (e) => {
      const el = e.target.closest(interactiveSelector);
      if (!el) return;

      const text = el.getAttribute('data-cursor-text') || '';
      setCursorText(text);

      gsap.to(ringRef.current, {
        width: 62,
        height: 62,
        x: mousePos.current.x - 31,
        y: mousePos.current.y - 31,
        borderColor: 'rgba(255, 107, 157, 0.95)',
        duration: 0.22,
      });

      gsap.to(dotRef.current, {
        width: 6,
        height: 6,
        background: '#FF6B9D',
        boxShadow: '0 0 14px rgba(255,107,157,0.9)',
        duration: 0.22,
      });

      gsap.to(auraRef.current, {
        opacity: 0.9,
        scale: 1.08,
        duration: 0.24,
      });
    };

    const handleMouseOut = (e) => {
      const toElement = e.relatedTarget;
      if (toElement && toElement.closest(interactiveSelector)) return;

      setCursorText('');

      gsap.to(ringRef.current, {
        width: 38,
        height: 38,
        borderColor: 'rgba(190, 255, 70, 0.9)',
        duration: 0.24,
      });

      gsap.to(dotRef.current, {
        width: 9,
        height: 9,
        background: '#BEFF46',
        boxShadow: '0 0 14px rgba(190,255,70,0.85)',
        duration: 0.24,
      });

      gsap.to(auraRef.current, {
        opacity: 0.58,
        scale: 1,
        duration: 0.24,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseenter', handleWindowEnter);
    window.addEventListener('mouseleave', handleWindowLeave);
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);

    gsap.set([dotRef.current, ringRef.current, auraRef.current], { x: -100, y: -100 });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseenter', handleWindowEnter);
      window.removeEventListener('mouseleave', handleWindowLeave);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
    };
  }, []);

  if (!enabled) return null;

  return (
    <div className="hide-mobile">
      <div
        ref={auraRef}
        className="cursor-aura"
        style={{
          opacity: isVisible ? 0.58 : 0,
          transition: 'opacity 0.2s',
        }}
      />
      <div
        ref={dotRef}
        className="cursor-dot"
        style={{
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 0.3s',
        }}
      />
      <div
        ref={ringRef}
        className="cursor-ring"
        style={{
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 0.3s',
        }}
      />
      {cursorText && (
        <div
          ref={textRef}
          className="cursor-text"
          style={{ opacity: isVisible ? 1 : 0 }}
        >
          {cursorText}
        </div>
      )}
    </div>
  );
};

export default CustomCursor;
