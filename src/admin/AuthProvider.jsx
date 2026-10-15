import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { apiRequest, onUnauthorized } from '../lib/api';
import { AuthContext } from './context';

/**
 * Admin session state. The session itself lives in an httpOnly cookie the
 * page can't read; this asks the API who is signed in. If a request later
 * reports an expired session, `expired` flips to true so the open editor can
 * ask for the password again without losing unsaved work.
 */
const AuthProvider = ({ children }) => {
  const [state, setState] = useState({ status: 'loading', admin: null, error: null });
  const [expired, setExpired] = useState(false);
  const statusRef = useRef(state.status);

  useEffect(() => {
    statusRef.current = state.status;
  });

  useEffect(() => {
    let active = true;
    apiRequest('/auth/me').then(
      ({ admin }) => active && setState({ status: admin ? 'authenticated' : 'anonymous', admin, error: null }),
      (error) =>
        active && setState({ status: error.status === 401 ? 'anonymous' : 'error', admin: null, error }),
    );
    return () => {
      active = false;
    };
  }, []);

  useEffect(
    () =>
      onUnauthorized(() => {
        if (statusRef.current === 'authenticated') setExpired(true);
      }),
    [],
  );

  const login = useCallback(async (email, password) => {
    const { admin } = await apiRequest('/auth/login', { method: 'POST', body: { email, password } });
    setState({ status: 'authenticated', admin, error: null });
    setExpired(false);
    return admin;
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } finally {
      setState({ status: 'anonymous', admin: null, error: null });
      setExpired(false);
    }
  }, []);

  const value = useMemo(() => ({ ...state, expired, login, logout }), [state, expired, login, logout]);
  return <AuthContext value={value}>{children}</AuthContext>;
};

export default AuthProvider;
