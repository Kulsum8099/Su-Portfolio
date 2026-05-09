import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import BentoCard from '../components/BentoCard';
import { resumeData } from '../data/resumeData';
import { FaCheck } from 'react-icons/fa';
import { HiOutlineMail, HiOutlinePhone } from 'react-icons/hi';
import { RiGlobalLine, RiLinkedinFill } from 'react-icons/ri';
import { SiFigma, SiOpenai } from 'react-icons/si';

gsap.registerPlugin(ScrollTrigger);

// Custom tool icon components for Adobe products
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
  SiFigma: (color) => <SiFigma style={{ color }} className="text-2xl" />,
  SiAdobeillustrator: (color) => <AiIcon color={color} />,
  SiAdobephotoshop: (color) => <PsIcon color={color} />,
  SiAdobeaftereffects: (color) => <AeIcon color={color} />,
  SiAdobepremierepro: (color) => <PrIcon color={color} />,
  SiAdobexd: (color) => <XdIcon color={color} />,
  SiOpenai: (color) => <SiOpenai style={{ color }} className="text-2xl" />,
};

const Resume = () => {
  const sectionRef = useRef(null);
  const contactCards = [
    { icon: <HiOutlinePhone className="text-neon-pink" />, text: '+91 866 844 7932' },
    { icon: <HiOutlineMail className="text-neon-purple" />, text: 'hello@suriya.design' },
    { icon: <RiGlobalLine className="text-neon-green" />, text: 'www.suriya.design' },
    { icon: <RiLinkedinFill className="text-electric-blue" />, text: 'linkedin.com/in/suriya' },
  ];

  useGSAP(() => {
    gsap.fromTo('.bento-card', { y: 50, opacity: 0 }, {
      y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out',
      scrollTrigger: { trigger: sectionRef.current, start: 'top 70%', toggleActions: 'play none none none' },
    });
  }, { scope: sectionRef });

  return (
    <section id="resume" ref={sectionRef} className="section-container py-16 md:py-20 px-5 md:px-12 lg:px-20">
      <div className="max-w-7xl mx-auto relative z-10 text-left">
        {/* Header */}
        <div className="mb-8 md:mb-10">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-1" style={{ fontFamily: 'var(--font-family-primary)' }}>
            Umme Kulsum Suriya
          </h2>
          <p className="text-text-secondary text-sm tracking-[0.15em] uppercase">UX-UI Designer</p>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {contactCards.map((item, i) => (
              <div key={i} className="rounded-xl border border-dashed border-white/20 bg-[#0A0E28]/70 px-4 py-3 flex items-center justify-start gap-3 text-sm text-white/90">
                {item.icon}
                <span className="truncate">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3.5 md:gap-4">
          {/* Experience */}
          <div className="bento-card lg:col-span-4 lg:row-span-2 opacity-0">
            <BentoCard label="Experience" labelColor="pink">
              <div className="space-y-3.5 text-left px-4 py-3">
                {resumeData.experience.map((exp, i) => (
                  <div key={i} className="border-b border-white/10 pb-3 last:border-0 last:pb-0">
                    <h4 className="text-white font-semibold text-[1.02rem] leading-tight">{exp.title}</h4>
                    <p className="text-text-muted text-sm mt-1 leading-tight">{exp.period} | {exp.company}</p>
                  </div>
                ))}
              </div>
            </BentoCard>
          </div>

          {/* Education */}
          <div className="bento-card lg:col-span-4 opacity-0">
            <BentoCard label="Education" labelColor="green">
              <div className="space-y-3 text-left px-4 py-3">
                {resumeData.education.map((edu, i) => (
                  <div key={i} className="border-b border-white/10 pb-2.5 last:border-0 last:pb-0">
                    <p className="text-text-muted text-xs">{edu.period} | {edu.location}</p>
                    <h4 className="text-white font-semibold text-[1.08rem] mt-0.5 leading-tight">{edu.degree}</h4>
                    <p className="text-text-muted text-sm leading-tight">{edu.institution}</p>
                  </div>
                ))}
              </div>
            </BentoCard>
          </div>

          {/* Skills */}
          <div className="bento-card lg:col-span-4 opacity-0">
            <BentoCard label="Skills" labelColor="purple">
              <div className="grid grid-cols-2 gap-2">
                  {resumeData.skills.map((skill, i) => (
                    <div key={i} className="flex items-center justify-start gap-2 py-1.5 text-[0.95rem] text-text-secondary">
                      <FaCheck className="text-neon-green text-xs flex-shrink-0" />
                      <span>{skill}</span>
                    </div>
                  ))}
                </div>
            </BentoCard>
          </div>

          {/* Certifications */}
          <div className="bento-card lg:col-span-4 opacity-0">
            <BentoCard label="Certifications" labelColor="purple">
              <div className="space-y-3 text-left">
                {resumeData.certifications.map((cert, i) => (
                  <div key={i} className="border-b border-white/10 pb-2.5 last:border-0 last:pb-0">
                    <h4 className="text-white font-semibold text-[1.12rem] leading-tight">{cert.title}</h4>
                    <p className="text-text-muted text-sm mt-0.5 leading-tight">{cert.issuer}</p>
                  </div>
                ))}
              </div>
            </BentoCard>
          </div>

          {/* Tools */}
          <div className="bento-card lg:col-span-4 opacity-0">
            <BentoCard label="Tools" labelColor="pink">
              <div className="flex flex-wrap justify-center gap-2.5 p-2">
                {resumeData.tools.map((tool, i) => (
                    <div key={i} className="group flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-white/5 transition-colors"
                    data-cursor-text={tool.name}>
                    <span className="transition-transform duration-300 group-hover:scale-125 group-hover:-translate-y-1 text-[1.9rem]">
                      {toolIconMap[tool.icon] ? toolIconMap[tool.icon](tool.color) : <span className="text-2xl">🔧</span>}
                    </span>
                  </div>
                ))}
              </div>
            </BentoCard>
          </div>

          {/* About Me */}
          <div className="bento-card lg:col-span-4 opacity-0">
            <BentoCard label="About me!" labelColor="green">
              <div className="flex items-center gap-4 min-h-[164px] px-4 py-3">
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
    </section>
  );
};

export default Resume;
