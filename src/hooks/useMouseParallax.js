import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for mouse position tracking with parallax calculations
 * Returns normalized coordinates (-1 to 1) for parallax effects
 */
const useMouseParallax = (options = {}) => {
  const { sensitivity = 1, throttleMs = 16 } = options;
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback(
    (() => {
      let lastTime = 0;
      return (e) => {
        const now = Date.now();
        if (now - lastTime < throttleMs) return;
        lastTime = now;

        const x = (e.clientX / window.innerWidth - 0.5) * 2 * sensitivity;
        const y = (e.clientY / window.innerHeight - 0.5) * 2 * sensitivity;

        setMousePosition({ x, y });
      };
    })(),
    [sensitivity, throttleMs]
  );

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  return mousePosition;
};

export default useMouseParallax;
