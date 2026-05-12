const Footer = () => {
  return (
    <div>
      <footer className="relative z-10 px-4 sm:px-8 md:px-12 lg:px-20 pb-10 md:pb-14 pt-12 md:pt-16">
        <div className="mx-auto rounded-2xl border border-dashed border-white/20 bg-[#090D25]/80 backdrop-blur-sm overflow-hidden">

          {/* Top CTA section */}
          <div className="px-8 md:px-14 pt-12 md:pt-14 pb-10 md:pb-12">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10">

              {/* Left: text */}
              <div className="max-w-xl">
                <p className="text-neon-green text-xs md:text-sm tracking-[0.22em] uppercase mb-3 font-medium">
                  Let&apos;s Collaborate
                </p>
                <h3
                  className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-[1.1] mb-4"
                  style={{ fontFamily: 'var(--font-family-primary)' }}
                >
                  Build your next
                  <br />
                  <span className="text-neon-pink">standout product</span>
                </h3>
                <p className="text-text-secondary text-sm md:text-base leading-relaxed max-w-md">
                  Open for product design, UX strategy, and end-to-end UI systems.
                </p>
              </div>

              {/* Right: CTA + subtle info */}
              <div className="flex flex-col items-start lg:items-end gap-4">
                <a
                  href="mailto:uxwithkulsumr@gmail.com"
                  className="group inline-flex items-center gap-3 px-7 py-4 rounded-xl bg-neon-green text-bg-primary text-sm md:text-base font-bold shadow-[0_8px_24px_rgba(190,255,70,0.35)] hover:shadow-[0_14px_36px_rgba(190,255,70,0.5)] hover:-translate-y-0.5 transition-all duration-300"
                  data-cursor-text="Email"
                >
                  <span>uxwithkulsumr@gmail.com</span>
                  <svg
                    className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7v10" />
                  </svg>
                </a>
                <p className="text-text-secondary text-xs tracking-wide">
                  Usually responds within 24 hours
                </p>
              </div>

            </div>
          </div>

          {/* Divider */}
          <div className="mx-8 md:mx-14 border-t border-white/10" />

          {/* Bottom bar */}
          <div className="px-8 md:px-14 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-secondary">

            {/* Name / brand */}
            <p className="font-medium tracking-wide text-white/50">
              © 2025 <span className="text-white/80">Umme Kulsum Suriya</span>
            </p>

            {/* Nav links */}
            {/* <nav className="flex items-center gap-6">
              {['Home', 'Projects', 'Resume'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="hover:text-white transition-colors duration-200 tracking-wide"
                >
                  {item}
                </a>
              ))}
            </nav> */}

            {/* Role tag */}
            <p className="tracking-wide text-white/40">UX · UI · Product Design</p>

          </div>

        </div>
      </footer>
    </div>
  );
};

export default Footer;