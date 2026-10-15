// Built-in copy of the portfolio projects. The site falls back to this when
// the API/database is unreachable (for example before MongoDB is set up),
// and `npm run db:seed` copies it into MongoDB as the starting content.
// Plain data only — no asset imports — so Node scripts can import it too.

export const fallbackProjects = [
  {
    id: 'medi-connect',
    slug: 'medi-connect',
    title: 'Medi-Connect',
    subtitle: 'Healthcare Simplified',
    category: 'Web App',
    accent: 'pink',
    summary:
      'A comprehensive healthcare management dashboard platform that simplifies patient-doctor interactions, appointment scheduling, and medical record management.',
    coverImage: {
      url: '/images/projects/mediconnect.webp',
      width: 1024,
      height: 1024,
      alt: 'Medi-Connect patient management dashboard with patient statistics, appointment charts and an upcoming appointments table',
    },
    role: '',
    client: '',
    timeline: '',
    technologies: [],
    links: [],
    featured: true,
    status: 'published',
    order: 0,
    caseStudy: {
      overview: '',
      problem:
        'Healthcare management systems are often complex and difficult to navigate, leading to poor user experience for both patients and healthcare providers.',
      goals: [],
      research:
        'Conducted extensive user research with 50+ healthcare professionals and patients to understand pain points in existing systems.',
      solution:
        'Designed an intuitive dashboard that centralizes all healthcare management functions with a clean, accessible interface.',
      features: [],
      process: [],
      gallery: [],
      outcomes: [
        '40% reduction in appointment scheduling time',
        '85% user satisfaction rate',
        '60% decrease in support tickets',
      ],
    },
  },
  {
    id: 'finwise',
    slug: 'finwise',
    title: 'Finwise',
    subtitle: 'Finance app',
    category: 'Mobile App',
    accent: 'green',
    summary:
      'A modern finance mobile application that helps users track expenses, manage budgets, and make smarter financial decisions with AI-powered insights.',
    coverImage: {
      url: '/images/projects/finwise.webp',
      width: 1024,
      height: 1024,
      alt: 'Finwise mobile app on a phone showing the monthly budget, a spending breakdown chart and savings goals',
    },
    role: '',
    client: '',
    timeline: '',
    technologies: [],
    links: [],
    featured: true,
    status: 'published',
    order: 1,
    caseStudy: {
      overview: '',
      problem:
        'Most finance apps overwhelm users with data without providing actionable insights, leading to poor financial habits.',
      goals: [],
      research:
        'Analyzed 30+ competing apps and conducted user interviews to identify the sweet spot between simplicity and functionality.',
      solution:
        'Created a mobile-first experience with AI-driven financial insights, beautiful data visualization, and gamified savings goals.',
      features: [],
      process: [],
      gallery: [],
      outcomes: [
        '200K+ downloads in first month',
        '4.8 star rating on App Store',
        '35% increase in user savings',
      ],
    },
  },
  {
    id: 'my-trip-mates',
    slug: 'my-trip-mates',
    title: 'My Trip Mates',
    subtitle: 'Travel platform',
    category: 'Website Design',
    accent: 'purple',
    summary:
      'A travel booking and discovery platform that connects travelers with unique experiences, local guides, and curated trip itineraries.',
    coverImage: {
      url: '/images/projects/mytripmates.webp',
      width: 1024,
      height: 1024,
      alt: 'My Trip Mates travel website with a mountain hero banner, a trip search bar and featured destination cards',
    },
    role: '',
    client: '',
    timeline: '',
    technologies: [],
    links: [],
    featured: true,
    status: 'published',
    order: 2,
    caseStudy: {
      overview: '',
      problem:
        'Travel planning is fragmented across multiple platforms, making it time-consuming and stressful to plan cohesive trips.',
      goals: [],
      research:
        'Surveyed 100+ frequent travelers to understand their booking habits, pain points, and desired features.',
      solution:
        'Built an all-in-one travel platform with smart recommendations, collaborative trip planning, and seamless booking integration.',
      features: [],
      process: [],
      gallery: [],
      outcomes: ['3x increase in booking conversion', '92% user retention rate', 'Featured in TechCrunch'],
    },
  },
];
