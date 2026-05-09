import { useRef } from 'react';
import gsap from 'gsap';
import { projectImages } from '../data/projectsData';

const ProjectCard = ({ project, onClick }) => {
  const cardRef = useRef(null);
  const imageRef = useRef(null);

  const categoryColors = {
    pink: { bg: 'bg-neon-pink', text: 'text-white' },
    green: { bg: 'bg-neon-green', text: 'text-bg-primary' },
    purple: { bg: 'bg-neon-purple', text: 'text-white' },
  };
  const cc = categoryColors[project.categoryColor] || categoryColors.pink;

  const handleMouseEnter = () => {
    gsap.to(cardRef.current, { y: -10, scale: 1.02, duration: 0.4, ease: 'power2.out' });
    gsap.to(imageRef.current, { scale: 1.05, duration: 0.5, ease: 'power2.out' });
  };

  const handleMouseLeave = () => {
    gsap.to(cardRef.current, { y: 0, scale: 1, duration: 0.5, ease: 'elastic.out(1,0.5)' });
    gsap.to(imageRef.current, { scale: 1, duration: 0.5, ease: 'power2.out' });
  };

  const imageSrc = projectImages[project.id];

  return (
    <article
      ref={cardRef}
      className="group relative flex-shrink-0 w-[min(100vw-2rem,320px)] md:w-[320px] cursor-pointer"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => onClick && onClick(project)}
      data-cursor-text="View"
    >
      {/* Card shell */}
      <div
        className="relative rounded-[14px] p-[10px] md:p-3"
        style={{
          background: 'rgba(255,255,255,0.96)',
          border: '1px solid rgba(255,255,255,0.55)',
          boxShadow: '0 22px 48px rgba(0,0,0,0.36)',
        }}
      >
        <div className="relative rounded-[10px] overflow-hidden bg-bg-secondary h-[470px] md:h-[520px]">
          <div ref={imageRef} className="w-full h-full will-change-transform">
            {imageSrc ? (
              <img src={imageSrc} alt={project.title} className="w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                <span className="text-white">No Image</span>
              </div>
            )}
          </div>

          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, rgba(5,8,24,0) 56%, rgba(5,8,24,0.82) 88%, rgba(5,8,24,0.96) 100%)',
            }}
          />

          {/* Category badge */}
          <div className="absolute top-4 left-4 z-10">
            <span className={`${cc.bg} ${cc.text} px-3 py-1 rounded-lg text-[11px] md:text-xs font-bold tracking-wide`}>
              {project.category}
            </span>
          </div>

          {/* Card corner mark */}
          <div className="absolute top-4 right-4 z-10 text-white text-2xl leading-none font-bold opacity-80">❝</div>

          {/* Bottom text */}
          <div className="absolute bottom-4 left-4 right-4 z-10">
            <h3 className="text-[33px] md:text-[44px] font-bold text-white/24 leading-none" style={{ fontFamily: 'var(--font-family-primary)' }}>
              {project.number}
            </h3>
            <h4 className="text-[31px] md:text-[36px] text-white font-bold leading-[1.05] tracking-tight -mt-2">
              {project.title}
            </h4>
            <p className="text-white/78 text-[14px] md:text-[15px] leading-tight">{project.subtitle}</p>
          </div>
        </div>
      </div>
    </article>
  );
};

export default ProjectCard;
