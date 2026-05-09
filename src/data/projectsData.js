import mediconnectImg from '../assets/images/mediconnect.png';
import finwiseImg from '../assets/images/finwise.png';
import mytripmatesImg from '../assets/images/mytripmates.png';

export const projectImages = {
  1: mediconnectImg,
  2: finwiseImg,
  3: mytripmatesImg,
};

export const projectsData = [
  {
    id: 1,
    number: '01',
    title: 'Medi-Connect',
    subtitle: 'Healthcare Simplified',
    category: 'Web App',
    categoryColor: 'pink',
    description:
      'A comprehensive healthcare management dashboard platform that simplifies patient-doctor interactions, appointment scheduling, and medical record management.',
    details: {
      problem:
        'Healthcare management systems are often complex and difficult to navigate, leading to poor user experience for both patients and healthcare providers.',
      research:
        'Conducted extensive user research with 50+ healthcare professionals and patients to understand pain points in existing systems.',
      solution:
        'Designed an intuitive dashboard that centralizes all healthcare management functions with a clean, accessible interface.',
      results: [
        '40% reduction in appointment scheduling time',
        '85% user satisfaction rate',
        '60% decrease in support tickets',
      ],
    },
  },
  {
    id: 2,
    number: '02',
    title: 'Finwise',
    subtitle: 'Finance app',
    category: 'Mobile App',
    categoryColor: 'green',
    description:
      'A modern finance mobile application that helps users track expenses, manage budgets, and make smarter financial decisions with AI-powered insights.',
    details: {
      problem:
        'Most finance apps overwhelm users with data without providing actionable insights, leading to poor financial habits.',
      research:
        'Analyzed 30+ competing apps and conducted user interviews to identify the sweet spot between simplicity and functionality.',
      solution:
        'Created a mobile-first experience with AI-driven financial insights, beautiful data visualization, and gamified savings goals.',
      results: [
        '200K+ downloads in first month',
        '4.8 star rating on App Store',
        '35% increase in user savings',
      ],
    },
  },
  {
    id: 3,
    number: '03',
    title: 'My Trip Mates',
    subtitle: 'Travel platform',
    category: 'Website Design',
    categoryColor: 'purple',
    description:
      'A travel booking and discovery platform that connects travelers with unique experiences, local guides, and curated trip itineraries.',
    details: {
      problem:
        'Travel planning is fragmented across multiple platforms, making it time-consuming and stressful to plan cohesive trips.',
      research:
        'Surveyed 100+ frequent travelers to understand their booking habits, pain points, and desired features.',
      solution:
        'Built an all-in-one travel platform with smart recommendations, collaborative trip planning, and seamless booking integration.',
      results: [
        '3x increase in booking conversion',
        '92% user retention rate',
        'Featured in TechCrunch',
      ],
    },
  },
];
