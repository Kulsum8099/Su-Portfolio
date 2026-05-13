import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import BentoCard from '../components/BentoCard';
import { resumeData } from '../data/resumeData';
import { FaCheck } from 'react-icons/fa';
import { HiOutlineMail, HiOutlinePhone } from 'react-icons/hi';
import { RiGlobalLine, RiLinkedinFill } from 'react-icons/ri';
import { SiFigma, SiOpenai, SiMiro } from 'react-icons/si';

gsap.registerPlugin(ScrollTrigger);

const AiIcon = ({ color }) => (
  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background: color, color: '#fff' }}>Ai</div>
);
const PsIcon = ({ color }) => (
  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background: color, color: '#fff' }}>Ps</div>
);
const AeIcon = ({ color }) => (
  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background: color, color: '#fff' }}>Ae</div>
);
const PrIcon = ({ color }) => (
  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background: color, color: '#fff' }}>Pr</div>
);
const XdIcon = ({ color }) => (
  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background: color, color: '#fff' }}>Xd</div>
);

const toolIconMap = {
  SiFigma:             (color) => <SiFigma style={{ color }} className="text-2xl" />,
  SiAdobeillustrator:  (color) => <AiIcon color={color} />,
  SiAdobephotoshop:    (color) => <PsIcon color={color} />,
  SiMiro:              (color) => <SiMiro style={{ color }} className="text-2xl" />,
  SiAdobeaftereffects: (color) => <AeIcon color={color} />,
  SiAdobepremierepro:  (color) => <PrIcon color={color} />,
  SiAdobexd:           (color) => <XdIcon color={color} />,
  SiOpenai:            (color) => <SiOpenai style={{ color }} className="text-2xl" />,
};

/*
  SPACING CONTRACT (BentoCard ↔ Resume):
  ─────────────────────────────────────
  BentoCard owns ALL inner card padding:
    • Label:   px-6 pt-6         (24px left/right, 24px top)
    • Content: px-6 pt-4 pb-6    (24px left/right, 16px top gap after label, 24px bottom)

  Resume children must NOT add any px-* / py-* / p-* of their own.
  They only add layout spacing: space-y-*, gap-*, etc.

  Section x-axis padding is set via inline clamp() style to guarantee
  it overrides whatever `section-container` applies globally.
*/

const GAP = 'gap-8'; // 32px — uniform between columns AND between stacked cards

const Resume = () => {
  const sectionRef = useRef(null);

  const contactCards = [
    { icon: <HiOutlinePhone className="text-neon-pink" />,     text: '+91 866 844 7932'      },
    { icon: <HiOutlineMail className="text-neon-purple" />,    text: 'nemishzawar@gmail.com' },
    { icon: <RiGlobalLine className="text-neon-green" />,      text: 'www.nishfolio.com'     },
    { icon: <RiLinkedinFill className="text-electric-blue" />, text: 'Linkedin/nemishzawar/' },
  ];

  useGSAP(() => {
    gsap.fromTo('.bento-card', { y: 50, opacity: 0 }, {
      y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out',
      scrollTrigger: { trigger: sectionRef.current, start: 'top 70%', toggleActions: 'play none none none' },
    });
  }, { scope: sectionRef });

  return (
    <section
      id="resume"
      ref={sectionRef}
      style={{
        paddingLeft:  'clamp(2rem, 6vw, 6rem)',
        paddingRight: 'clamp(2rem, 6vw, 6rem)',
      }}
    >
      <div className="w-full max-w-[1400px] mx-auto text-left">

        <div className={`flex flex-col lg:flex-row ${GAP} items-start`}>

          {/* ══════════════════════════════
              LEFT COLUMN
              • Profile info (no BentoCard wrapper)
              • Experience card
              ══════════════════════════════ */}
          <div className={`flex flex-col ${GAP} w-full lg:w-[34%]`}>

            {/* Profile info — raw block, not a BentoCard */}
            <div className="flex flex-col gap-4">
              <div>
                <h2
                  className="text-4xl md:text-5xl font-bold text-white mb-1"
                  style={{ fontFamily: 'var(--font-family-primary)' }}
                >
                  Umme Kulsum Suriya
                </h2>
                <p className="text-text-secondary text-sm tracking-[0.15em] uppercase">
                  UX-UI Designer
                </p>
              </div>

              {/* 2×2 contact pill cards */}
              <div className="grid grid-cols-2 gap-3">
                {contactCards.map((item, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-dashed border-white/20 bg-[#0A0E28]/70 px-4 py-3 flex items-center gap-3 text-[0.92rem] text-white/90"
                  >
                    {item.icon}
                    <span className="truncate">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Experience — BentoCard handles all padding; children: layout only */}
            <div className="bento-card opacity-0">
              <BentoCard label="Experience" labelColor="pink">
                <div className="grid gap-3">
                  {resumeData.experience.map((exp, i) => (
                    <div key={i} className="border-b border-white/10 pt-4 pb-4 last:border-0 last:pt-0 last:pb-0">
                      <div className="px-3 py-3">
                        <h4 className="text-white font-semibold text-[1.02rem] leading-tight">{exp.title}</h4>
                        <p className="text-text-muted text-sm mt-2 leading-tight">{exp.period} | {exp.company}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </BentoCard>
            </div>

          </div>

          {/* ══════════════════════════════
              MIDDLE COLUMN
              • Education card
              • Certifications card
              ══════════════════════════════ */}
          <div className={`flex flex-col ${GAP} w-full lg:w-[37%]`}>

            {/* Education */}
            <div className="bento-card opacity-0">
              <BentoCard label="Education" labelColor="green">
                 <div className="grid gap-3">
                  {resumeData.education.map((edu, i) => (
                    <div key={i} className="border-b border-white/10 pt-4 pb-4 last:border-0 last:pt-0 last:pb-0">
                      <div className="px-6 py-3">
                        <p className="text-text-muted text-xs">{edu.period} | {edu.location}</p>
                        <h4 className="text-white font-semibold text-[1.08rem] mt-0.5 leading-tight">{edu.degree}</h4>
                        <p className="text-text-muted text-sm leading-tight">{edu.institution}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </BentoCard>
            </div>

            {/* Certifications */}
            <div className="bento-card opacity-0">
              <BentoCard label="Certifications" labelColor="purple">
                <div className="grid gap-3">
                  {resumeData.certifications.map((cert, i) => (
                    <div key={i} className="border-b border-white/10 pt-4 pb-4 last:border-0 last:pt-0 last:pb-0">
                      <div className="px-6 py-3">
                        <h4 className="text-white font-semibold text-[1.12rem] leading-tight">{cert.title}</h4>
                        <p className="text-text-muted text-sm mt-0.5 leading-tight">{cert.issuer}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </BentoCard>
            </div>

          </div>

          {/* ══════════════════════════════
              RIGHT COLUMN
              • Skills card
              • Tools card
              • About me card
              ══════════════════════════════ */}
          <div className={`flex flex-col ${GAP} w-full lg:w-[29%]`}>

            {/* Skills */}
            <div className="bento-card opacity-0">
              <BentoCard label="Skills" labelColor="lightpink">
                <div className="grid grid-cols-2 gap-x-3 gap-y-3">
                  {resumeData.skills.map((skill, i) => (
                    <div key={i} className="flex items-center gap-2 py-2 px-3 text-[0.92rem] text-text-secondary">
                      <FaCheck className="text-neon-green text-xs flex-shrink-0" />
                      <span>{skill}</span>
                    </div>
                  ))}
                </div>
              </BentoCard>
            </div>

            {/* Tools */}
            <div className="bento-card opacity-0">
              <BentoCard label="Tools" labelColor="pink">
                <div className="grid grid-cols-4 gap-x-3 gap-y-4">
                  {resumeData.tools.map((tool, i) => (
                    <div
                      key={i}
                      className="group flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-white/5 transition-colors"
                      data-cursor-text={tool.name}
                    >
                      <span className="transition-transform duration-300 group-hover:scale-125 group-hover:-translate-y-1 text-[1.9rem]">
                        {toolIconMap[tool.icon] ? toolIconMap[tool.icon](tool.color) : <span className="text-2xl">🔧</span>}
                      </span>
                    </div>
                  ))}
                </div>
              </BentoCard>
            </div>

            {/* About me */}
            <div className="bento-card opacity-0">
              <BentoCard label="About me!" labelColor="green">
                <div className="flex items-center gap-4 min-h-[120px]">
                  <div className="text-5xl">😍</div>
                  <div className="text-5xl">🐱</div>
                  <div className="flex-1">
                    <p className="text-text-secondary text-base italic">"If you hire me, you save two lives!"</p>
                  </div>
                </div>
              </BentoCard>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};

export default Resume;