import { useId, useState } from 'react';
import { Link, Navigate, NavLink, Outlet, useLocation } from 'react-router';
import {
  HiOutlineArrowRightStartOnRectangle,
  HiOutlineArrowTopRightOnSquare,
  HiOutlineKey,
  HiOutlineSquares2X2,
  HiOutlineUserCircle,
} from 'react-icons/hi2';
import Dialog from '../components/Dialog';
import PageLoader from '../components/PageLoader';
import { useAuth } from './context';

const NAV = [
  { to: '/admin', label: 'Projects', icon: HiOutlineSquares2X2, end: true },
  { to: '/admin/profile', label: 'Profile & resume', short: 'Profile', icon: HiOutlineUserCircle },
  { to: '/admin/account', label: 'Account', icon: HiOutlineKey },
];

const navClass = ({ isActive }) =>
  `inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
    isActive ? 'bg-white/10 text-white' : 'text-text-secondary hover:bg-white/5 hover:text-white'
  }`;

/** Asks for the password again when the session expires mid-edit, keeping unsaved work on screen. */
const ReauthDialog = ({ open, email }) => {
  const { login } = useAuth();
  const id = useId();
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await login(email, password);
      setPassword('');
    } catch (problem) {
      setError(problem.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onClose={() => {}} labelledBy={`${id}-title`} className="w-[min(26rem,calc(100vw-2rem))]">
      <form onSubmit={submit} className="rounded-2xl border border-white/10 bg-bg-secondary p-6 shadow-2xl">
        <h2 id={`${id}-title`} className="text-lg font-bold">
          Your session expired
        </h2>
        <p className="mt-2 text-sm text-text-secondary">
          Sign in again as <strong className="text-white">{email}</strong> to keep working. Your unsaved changes are still here.
        </p>
        <label htmlFor={`${id}-password`} className="mt-5 block text-sm font-semibold">
          Password
        </label>
        <input
          id={`${id}-password`}
          type="password"
          autoComplete="current-password"
          className="input mt-1.5"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          required
        />
        {error && (
          <p id={`${id}-error`} className="mt-1.5 text-xs font-medium text-danger">
            {error}
          </p>
        )}
        <div className="mt-6 flex justify-end gap-2">
          <a href="/admin/login" className="btn btn-ghost">
            Go to sign-in page
          </a>
          <button type="submit" className="btn btn-primary" disabled={busy || !password}>
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </div>
      </form>
    </Dialog>
  );
};

const AdminLayout = () => {
  const { status, admin, expired, error, logout } = useAuth();
  const location = useLocation();

  if (status === 'loading') return <PageLoader label="Checking your session…" />;
  if (status === 'anonymous') {
    return <Navigate to="/admin/login" replace state={{ from: `${location.pathname}${location.search}` }} />;
  }
  if (status === 'error') {
    return (
      <div className="mx-auto flex min-h-svh max-w-lg flex-col items-center justify-center px-6 text-center">
        <h1 className="text-2xl font-bold">The admin panel can’t reach the server</h1>
        <p className="mt-3 text-text-secondary">{error?.message}</p>
        {error?.code === 'db_not_configured' && (
          <p className="mt-3 text-sm text-text-muted">Set MONGODB_URI as described in DATABASE_SETUP.md, then restart the server.</p>
        )}
        <button type="button" className="btn btn-primary mt-6" onClick={() => window.location.reload()}>
          Try again
        </button>
      </div>
    );
  }

  return (
    <>
      <a className="skip-link" href="#admin-main">
        Skip to content
      </a>
      <header className="sticky top-0 z-40 border-b border-white/10 bg-bg-primary/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2.5 sm:px-6">
          <Link to="/admin" className="mr-2 flex items-baseline gap-2 rounded-lg py-1 font-bold">
            <span className="text-lg">
              UK<span className="text-neon-green">.</span>
            </span>
            <span className="text-xs font-semibold tracking-[0.18em] text-text-muted uppercase">Admin</span>
          </Link>

          <nav aria-label="Admin sections" className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end} className={navClass}>
                <item.icon className="text-base" aria-hidden="true" />
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <span className="hidden max-w-48 truncate text-xs text-text-muted lg:inline" title={admin?.email}>
              {admin?.email}
            </span>
            <a href="/" target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-ghost" aria-label="View site (opens in a new tab)">
              <HiOutlineArrowTopRightOnSquare aria-hidden="true" />
              <span className="hidden sm:inline">View site</span>
            </a>
            <button type="button" className="btn btn-sm btn-secondary" onClick={logout} aria-label="Sign out">
              <HiOutlineArrowRightStartOnRectangle aria-hidden="true" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>

        {/* Mobile: section tabs on their own row (short labels so all fit) */}
        <nav aria-label="Admin sections" className="border-t border-white/5 md:hidden">
          <div className="flex gap-1 overflow-x-auto px-4 py-2">
            {NAV.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end} className={navClass}>
                <item.icon className="text-base" aria-hidden="true" />
                {item.short ?? item.label}
              </NavLink>
            ))}
          </div>
        </nav>
      </header>

      <main id="admin-main" tabIndex={-1} className="mx-auto max-w-6xl px-4 pt-8 pb-28 sm:px-6 sm:pt-10">
        <Outlet />
      </main>

      <ReauthDialog open={expired} email={admin?.email ?? ''} />
    </>
  );
};

export default AdminLayout;
