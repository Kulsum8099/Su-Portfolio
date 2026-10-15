// Accent colours a project or card can use. Chips always use dark ink: white
// text on the neon pink/purple/blue fails WCAG contrast, dark ink passes AA.
// Class names are written out in full so Tailwind can find them.
const ACCENTS = {
  pink: {
    chip: 'bg-neon-pink text-bg-primary',
    line: 'border-neon-pink',
    text: 'text-neon-pink',
    softBg: 'bg-neon-pink/10',
    border: 'border-neon-pink/30',
    glow: 'rgb(255 107 157 / 0.35)',
  },
  green: {
    chip: 'bg-neon-green text-bg-primary',
    line: 'border-neon-green',
    text: 'text-neon-green',
    softBg: 'bg-neon-green/10',
    border: 'border-neon-green/30',
    glow: 'rgb(190 255 70 / 0.35)',
  },
  purple: {
    chip: 'bg-neon-purple text-bg-primary',
    line: 'border-neon-purple',
    text: 'text-neon-purple',
    softBg: 'bg-neon-purple/10',
    border: 'border-neon-purple/30',
    glow: 'rgb(139 92 246 / 0.35)',
  },
  blue: {
    chip: 'bg-electric-blue text-bg-primary',
    line: 'border-electric-blue',
    text: 'text-electric-blue',
    softBg: 'bg-electric-blue/10',
    border: 'border-electric-blue/30',
    glow: 'rgb(59 130 246 / 0.35)',
  },
};

export const accentStyles = (accent) => ACCENTS[accent] ?? ACCENTS.pink;
