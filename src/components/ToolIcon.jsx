import {
  SiAffinitydesigner,
  SiBlender,
  SiCanva,
  SiCinema4D,
  SiClaude,
  SiCss,
  SiFigma,
  SiFramer,
  SiGooglegemini,
  SiHtml5,
  SiInvision,
  SiJira,
  SiLottiefiles,
  SiMaze,
  SiMiro,
  SiNotion,
  SiOpenai,
  SiReact,
  SiRive,
  SiSketch,
  SiSlack,
  SiWebflow,
  SiWordpress,
} from 'react-icons/si';

// Keys match TOOL_ICON_KEYS in shared/content.js.
const ICONS = {
  figma: SiFigma,
  sketch: SiSketch,
  framer: SiFramer,
  miro: SiMiro,
  notion: SiNotion,
  webflow: SiWebflow,
  canva: SiCanva,
  invision: SiInvision,
  maze: SiMaze,
  rive: SiRive,
  lottiefiles: SiLottiefiles,
  blender: SiBlender,
  cinema4d: SiCinema4D,
  affinitydesigner: SiAffinitydesigner,
  jira: SiJira,
  slack: SiSlack,
  html5: SiHtml5,
  css: SiCss,
  react: SiReact,
  wordpress: SiWordpress,
  openai: SiOpenai,
  claude: SiClaude,
  googlegemini: SiGooglegemini,
};

/** A tool's brand glyph, or an Adobe-style letter tile when there is none. */
const ToolIcon = ({ tool, size = 'size-8' }) => {
  const Icon = ICONS[tool.icon];
  if (Icon) return <Icon className={size} style={{ color: tool.color }} />;

  const label = (tool.abbr || tool.name || '?').slice(0, 3);
  return (
    <span
      className={`${size} flex items-center justify-center rounded-lg border text-xs font-bold`}
      style={{ color: tool.color, backgroundColor: `${tool.color}26`, borderColor: `${tool.color}66` }}
    >
      {label}
    </span>
  );
};

export default ToolIcon;
