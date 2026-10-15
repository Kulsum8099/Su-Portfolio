// Code-split pages. Kept in their own module so components can preload a
// page's code on intent (hover/focus) without importing the router.
export const loadProjectsPage = () => import('../pages/ProjectsPage');
export const loadCaseStudyPage = () => import('../pages/CaseStudyPage');
export const loadNotFoundPage = () => import('../pages/NotFoundPage');
