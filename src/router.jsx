import { createBrowserRouter } from 'react-router';
import PageLoader from './components/PageLoader';
import PublicLayout from './layouts/PublicLayout';
import HomePage from './pages/HomePage';
import RouteError from './pages/RouteError';
import { loadCaseStudyPage, loadNotFoundPage, loadProjectsPage } from './routes/lazyPages';

// Route-level code splitting: a page's code downloads only when visited, so
// visitors never download the admin panel.
const lazyPage = (load) => async () => ({ Component: (await load()).default });

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    errorElement: <RouteError />,
    hydrateFallbackElement: <PageLoader />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'projects', lazy: lazyPage(loadProjectsPage) },
      { path: 'projects/:slug', lazy: lazyPage(loadCaseStudyPage) },
      { path: '*', lazy: lazyPage(loadNotFoundPage) },
    ],
  },
  {
    path: 'admin',
    lazy: lazyPage(() => import('./admin/AdminRoot')),
    errorElement: <RouteError />,
    hydrateFallbackElement: <PageLoader />,
    children: [
      { path: 'login', lazy: lazyPage(() => import('./admin/pages/LoginPage')) },
      {
        // Everything below requires a signed-in admin (AdminLayout checks).
        lazy: lazyPage(() => import('./admin/AdminLayout')),
        children: [
          { index: true, lazy: lazyPage(() => import('./admin/pages/ProjectsListPage')) },
          { path: 'projects/new', lazy: lazyPage(() => import('./admin/pages/ProjectEditorPage')) },
          { path: 'projects/:id', lazy: lazyPage(() => import('./admin/pages/ProjectEditorPage')) },
          { path: 'profile', lazy: lazyPage(() => import('./admin/pages/ProfileEditorPage')) },
          { path: 'account', lazy: lazyPage(() => import('./admin/pages/AccountPage')) },
          { path: '*', lazy: lazyPage(() => import('./admin/pages/AdminNotFound')) },
        ],
      },
    ],
  },
]);
