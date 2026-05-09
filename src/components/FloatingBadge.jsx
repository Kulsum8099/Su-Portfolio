import { useEffect, useRef } from "react";
import gsap from "gsap";

const colorMap = {
  pink: {
    bg: "rgba(255, 107, 157, 0.9)",
    glow: "0 0 20px rgba(255, 107, 157, 0.4), 0 4px 15px rgba(0,0,0,0.3)",
    text: "#fff",
  },
  green: {
    bg: "rgba(190, 255, 70, 0.9)",
    glow: "0 0 20px rgba(190, 255, 70, 0.4), 0 4px 15px rgba(0,0,0,0.3)",
    text: "#070816",
  },
  purple: {
    bg: "rgba(139, 92, 246, 0.9)",
    glow: "0 0 20px rgba(139, 92, 246, 0.4), 0 4px 15px rgba(0,0,0,0.3)",
    text: "#fff",
  },
  blue: {
    bg: "rgba(59, 130, 246, 0.9)",
    glow: "0 0 20px rgba(59, 130, 246, 0.4), 0 4px 15px rgba(0,0,0,0.3)",
    text: "#fff",
  },
};

const FloatingBadge = ({
  text,
  color = "pink",
  className = "",
  delay = 0,
  floatRange = 15,
  duration = 3,
  icon = null,
}) => {
  const badgeRef = useRef(null);
  const colors = colorMap[color] || colorMap.pink;

  useEffect(() => {
    if (!badgeRef.current) return;

    // Floating animation
    const float = gsap.to(badgeRef.current, {
      y: -floatRange,
      rotation: gsap.utils.random(-3, 3),
      duration: duration + gsap.utils.random(-0.5, 0.5),
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
      delay,
    });

    // Magnetic hover
    const el = badgeRef.current;
    const handleMove = (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      gsap.to(el, {
        x: x * 0.25,
        y: y * 0.25,
        duration: 0.3,
        ease: "power2.out",
      });
    };

    const handleLeave = () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.3)" });
    };

    el.addEventListener("mousemove", handleMove);
    el.addEventListener("mouseleave", handleLeave);

    return () => {
      float.kill();
      el.removeEventListener("mousemove", handleMove);
      el.removeEventListener("mouseleave", handleLeave);
    };
  }, [delay, floatRange, duration]);

  return (
    <div
      ref={badgeRef}
      className={`inline-flex items-center gap-2 md:gap-3 px-4 md:px-6 py-2 md:py-3 rounded-[14px] text-sm md:text-[1.55rem] leading-none font-semibold select-none will-change-transform ${className}`}
      style={{
        background: colors.bg,
        color: colors.text,
        boxShadow: colors.glow,
        backdropFilter: "blur(10px)",
      }}
      data-cursor-text="✦"
    >
      {icon && (
        <span className="text-base md:text-[1.3rem] leading-none">{icon}</span>
      )}
      {text}
    </div>
  );
};

export default FloatingBadge;
