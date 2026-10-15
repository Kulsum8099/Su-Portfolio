import {
  RiBehanceLine,
  RiDribbbleLine,
  RiFacebookFill,
  RiGithubFill,
  RiGlobalLine,
  RiInstagramLine,
  RiLinkedinFill,
  RiMediumFill,
  RiPinterestLine,
  RiTwitterXLine,
  RiYoutubeFill,
} from 'react-icons/ri';

const BY_HOST = [
  ['linkedin.com', RiLinkedinFill],
  ['behance.net', RiBehanceLine],
  ['dribbble.com', RiDribbbleLine],
  ['instagram.com', RiInstagramLine],
  ['github.com', RiGithubFill],
  ['x.com', RiTwitterXLine],
  ['twitter.com', RiTwitterXLine],
  ['medium.com', RiMediumFill],
  ['youtube.com', RiYoutubeFill],
  ['facebook.com', RiFacebookFill],
  ['pinterest.com', RiPinterestLine],
];

/** Picks an icon from a profile link's domain (falls back to a globe). */
const SocialIcon = ({ url, className }) => {
  let host = '';
  try {
    host = new URL(url).hostname.replace(/^www\./, '');
  } catch {
    // not an absolute URL — use the generic icon
  }
  const Icon = BY_HOST.find(([domain]) => host === domain || host.endsWith(`.${domain}`))?.[1] ?? RiGlobalLine;
  return <Icon className={className} aria-hidden="true" />;
};

export default SocialIcon;
