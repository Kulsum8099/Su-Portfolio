import { Outlet, ScrollRestoration } from 'react-router';
import AuthProvider from './AuthProvider';
import ToastProvider from './ToastProvider';

/** Everything under /admin: auth + notifications. The public site's cursor,
    smooth scrolling and loader are intentionally absent here. */
const AdminRoot = () => (
  <AuthProvider>
    <ToastProvider>
      <div className="grid-overlay opacity-50" aria-hidden="true" />
      <div className="relative z-10 min-h-svh">
        <Outlet />
      </div>
      <ScrollRestoration />
    </ToastProvider>
  </AuthProvider>
);

export default AdminRoot;
