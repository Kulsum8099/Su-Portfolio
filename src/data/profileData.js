// Built-in profile, contact details and resume. Used when the API/database
// is unreachable and as the seed for `npm run db:seed`. Edit the live copy
// from the admin panel (Admin → Profile) once MongoDB is connected.
//
// NOTE: the experience, education and certification entries below were
// carried over from the previous hard-coded resume — review them in the
// admin panel and replace anything that is not yours.

export const fallbackProfile = {
  name: 'Umme Kulsum Suriya',
  role: 'UX-UI Designer',
  email: 'kulsumsuraiya44@gmail.com',
  phone: '+88 01904711808',
  website: 'https://uxwithkulsum.vercel.app',
  linkedin: 'https://www.linkedin.com/in/umme-kulsum-suraiya/',
  availability: 'Usually responds within 24 hours',
  aboutQuote: 'If you hire me, you save two lives!',
  socials: [],

  experience: [
    { title: 'Product Designer', organization: 'Swift Money - Hogobie tech pvt. ltd.', period: '2022-2024' },
    { title: 'Design Lead (UX/UI and Branding)', organization: 'Uplifters Design Studio', period: '2022-2024' },
    {
      title: '50+ Freelance Projects as UI/UX Brand Designer Globally',
      organization: 'For multiple startups and Businesses',
      period: '2018-2022',
    },
    { title: 'Product Designer - Savart', organization: 'AD square media', period: '2021' },
    { title: 'Branding and Advertising', organization: 'AD square media', period: '2019-2020' },
    { title: 'Specialov (Date organiser)', organization: 'Founder', period: '2021' },
  ],

  education: [
    {
      degree: 'B.sc Media Graphics and Animation',
      institution: 'Yahwantrao Chavan University',
      location: 'Pune, Maharashtra',
      period: '2019-2022',
    },
    {
      degree: 'Advanced Diploma in Visual Communication Design',
      institution: 'Design media and Edutalment School',
      location: 'Pune, Maharashtra',
      period: '2019-2022',
    },
    {
      degree: 'Product Design Foundation',
      institution: 'Unitedworld Institute Of Design (UID)',
      location: 'Ahmedabad, Gujrat',
      period: '2018-2019',
    },
  ],

  certifications: [
    { title: 'HFI - Certified Usability Analyst (CUA)', issuer: 'HFI (Human Factor International)' },
    { title: 'User experience and Interface Design', issuer: 'Midas Multimedia, Pune' },
    { title: 'Google UX Design Professional Certificate', issuer: 'Coursera | Google' },
  ],

  skills: [
    'UX Research',
    'Interface Design',
    'Usability',
    'Design Systems',
    'Wireframing',
    'Prototyping',
    'User Testing',
    'Identity Design',
    'Basic HTML & CSS',
  ],

  // `icon` picks a brand glyph (see TOOL_ICON_KEYS); tools without one show
  // a coloured tile with the short label instead.
  tools: [
    { name: 'Figma', icon: 'figma', abbr: '', color: '#A259FF' },
    { name: 'Illustrator', icon: '', abbr: 'Ai', color: '#FF9A00' },
    { name: 'Photoshop', icon: '', abbr: 'Ps', color: '#31A8FF' },
    { name: 'Miro', icon: 'miro', abbr: '', color: '#FFD02F' },
    { name: 'After Effects', icon: '', abbr: 'Ae', color: '#9999FF' },
    { name: 'Premiere Pro', icon: '', abbr: 'Pr', color: '#9999FF' },
    { name: 'XD', icon: '', abbr: 'Xd', color: '#FF61F6' },
    { name: 'ChatGPT', icon: 'openai', abbr: '', color: '#10A37F' },
  ],
};
