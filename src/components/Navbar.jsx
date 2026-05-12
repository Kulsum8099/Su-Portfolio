import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { HiMenuAlt4, HiX } from "react-icons/hi";

gsap.registerPlugin(ScrollToPlugin);

const navItems = [
  { label: "Home", target: "#hero" },
  { label: "Intro", target: "#intro" },
  { label: "Resume", target: "#resume" },
  { label: "Index", target: "#projects" },
];

const Navbar = () => {
  const navRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("Home");
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);
  const mobileMenuRef = useRef(null);
  const itemRefs = useRef([]);

  // Scroll direction detection
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setHidden(true);
      } else {
        setHidden(false);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Active section detection
  useEffect(() => {
    const sections = ["hero", "intro", "resume", "projects"];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = sections.indexOf(entry.target.id);
            if (idx !== -1) setActiveSection(navItems[idx].label);
          }
        });
      },
      { threshold: 0.3 }
    );

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Mobile menu animation
  useEffect(() => {
    if (isOpen && mobileMenuRef.current) {
      gsap.fromTo(
        mobileMenuRef.current,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" }
      );
      gsap.fromTo(
        ".mobile-nav-item",
        { opacity: 0, x: -30 },
        {
          opacity: 1,
          x: 0,
          duration: 0.5,
          stagger: 0.08,
          ease: "power3.out",
          delay: 0.15,
        }
      );
    }
  }, [isOpen]);

  const scrollToSection = (target) => {
    setIsOpen(false);
    gsap.to(window, {
      duration: 1.2,
      scrollTo: { y: target, offsetY: 80 },
      ease: "power3.inOut",
    });
  };

  // Magnetic hover
  const handleMouseMove = (e, index) => {
    const el = itemRefs.current[index];
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    gsap.to(el, { x: x * 0.2, y: y * 0.2, duration: 0.3, ease: "power2.out" });
  };

  const handleMouseLeave = (index) => {
    const el = itemRefs.current[index];
    if (!el) return;
    gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" });
  };

  return (
    <>
      <nav
        ref={navRef}
        className="fixed top-0 left-0 w-full z-[100] transition-transform duration-500"
        style={{ transform: hidden ? "translateY(-100%)" : "translateY(0)" }}
      >
        <div className="mx-auto   px-6 py-4">
          <div className="bg-[#0B1023]/70 backdrop-blur-xl border border-neon-purple/20 rounded-2xl px-6 py-3 flex items-center justify-between shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item, i) => (
                <button
                  key={item.label}
                  ref={(el) => (itemRefs.current[i] = el)}
                  onClick={() => scrollToSection(item.target)}
                  onMouseMove={(e) => handleMouseMove(e, i)}
                  onMouseLeave={() => handleMouseLeave(i)}
                  className={`relative px-5 py-2 text-sm font-medium rounded-xl transition-colors duration-300 ${
                    activeSection === item.label
                      ? "text-neon-green"
                      : "text-text-secondary hover:text-white"
                  }`}
                  data-cursor-text={item.label}
                >
                  {item.label}
                  {activeSection === item.label && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-neon-green shadow-[0_0_8px_rgba(190,255,70,0.6)]" />
                  )}
                </button>
              ))}
            </div>

            {/* Mobile hamburger */}
            <button
              className="md:hidden text-white text-2xl p-2"
              onClick={() => setIsOpen(!isOpen)}
              data-cursor-text="Menu"
            >
              {isOpen ? <HiX /> : <HiMenuAlt4 />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {isOpen && (
        <div
          ref={mobileMenuRef}
          className="fixed inset-0 z-[99] bg-bg-primary/95 backdrop-blur-xl flex flex-col items-center justify-center gap-8 md:hidden"
        >
          {navItems.map((item) => (
            <button
              key={item.label}
              className="mobile-nav-item text-3xl font-bold text-white hover:text-neon-green transition-colors duration-300"
              onClick={() => scrollToSection(item.target)}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </>
  );
};

export default Navbar;
