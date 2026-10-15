import { useRef, useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router';
import { HiArrowLeft, HiOutlineEye, HiOutlineEyeSlash } from 'react-icons/hi2';
import PageLoader from '../../components/PageLoader';
import { usePageMeta } from '../../hooks/usePageMeta';
import { useAuth } from '../context';

// Only ever redirect back inside the admin panel.
const safeRedirect = (from) => (typeof from === 'string' && from.startsWith('/admin') && !from.startsWith('/admin/login') ? from : '/admin');

const LoginPage = () => {
  const { status, login } = useAuth();
  const location = useLocation();
  const passwordRef = useRef(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  usePageMeta({ title: 'Admin sign in', noIndex: true });

  if (status === 'loading') return <PageLoader label="Checking your session…" />;
  if (status === 'authenticated') return <Navigate to={safeRedirect(location.state?.from)} replace />;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await login(email.trim(), password);
    } catch (problem) {
      setError(
        problem.code === 'db_not_configured'
          ? 'The database is not configured yet. Set MONGODB_URI (see DATABASE_SETUP.md) and restart the server.'
          : problem.message,
      );
      setPassword('');
      passwordRef.current?.focus();
      setSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-svh items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm text-text-secondary transition-colors hover:text-white">
          <HiArrowLeft aria-hidden="true" /> Back to the site
        </Link>

        <div className="surface p-6 sm:p-8">
          <p className="text-xl font-bold">
            UK<span className="text-neon-green">.</span>{' '}
            <span className="text-xs font-semibold tracking-[0.18em] text-text-muted uppercase">Admin</span>
          </p>
          <h1 className="mt-6 text-2xl font-bold tracking-tight">Sign in</h1>
          <p className="mt-1 text-sm text-text-secondary">Manage projects, case studies and your profile.</p>

          <form onSubmit={handleSubmit} className="mt-8 grid gap-5" noValidate>
            <div>
              <label htmlFor="login-email" className="mb-1.5 block text-sm font-semibold">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                inputMode="email"
                autoComplete="username"
                className="input"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? 'login-error' : undefined}
                required
                autoFocus
              />
            </div>
            <div>
              <label htmlFor="login-password" className="mb-1.5 block text-sm font-semibold">
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  ref={passwordRef}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className="input pr-12"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? 'login-error' : undefined}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  className="absolute inset-y-0 right-1 my-auto grid size-10 place-items-center rounded-lg text-text-secondary transition-colors hover:text-white"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                >
                  {showPassword ? <HiOutlineEyeSlash aria-hidden="true" /> : <HiOutlineEye aria-hidden="true" />}
                </button>
              </div>
            </div>

            {error && (
              <p id="login-error" role="alert" className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2.5 text-sm text-white">
                {error}
              </p>
            )}

            <button type="submit" className="btn btn-primary w-full" disabled={submitting || !email || !password}>
              {submitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs leading-relaxed text-text-muted">
          Admin accounts are created from the command line (<code className="text-text-secondary">npm run admin:create</code>).
        </p>
      </div>
    </main>
  );
};

export default LoginPage;
