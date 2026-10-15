import { useState } from 'react';
import { PASSWORD_MIN_LENGTH, passwordProblem } from '../../../shared/content';
import { usePageMeta } from '../../hooks/usePageMeta';
import { adminApi } from '../api';
import { TextField } from '../components/Field';
import Section from '../components/Section';
import { useAuth, useToast } from '../context';

const EMPTY = { currentPassword: '', newPassword: '', confirmPassword: '' };

const AccountPage = () => {
  const { admin, logout } = useAuth();
  const notify = useToast();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  usePageMeta({ title: 'Account · Admin', noIndex: true });

  const update = (name) => (value) => {
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const problems = {};
    const weakness = passwordProblem(form.newPassword, admin?.email);
    if (!form.currentPassword) problems.currentPassword = 'Enter your current password.';
    if (weakness) problems.newPassword = weakness;
    if (form.confirmPassword !== form.newPassword) problems.confirmPassword = 'The passwords don’t match.';
    if (Object.keys(problems).length > 0) {
      setErrors(problems);
      return;
    }

    setSaving(true);
    try {
      await adminApi.changePassword(form.currentPassword, form.newPassword);
      setForm(EMPTY);
      notify('Password updated. Other devices were signed out.');
    } catch (error) {
      setErrors(error.fields ?? {});
      notify(error.message, { tone: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Account</h1>
      <p className="mt-1 text-sm text-text-secondary">Signed in as {admin?.email}.</p>

      <div className="mt-8 grid max-w-2xl gap-6">
        <Section id="password" title="Change password" description={`Use at least ${PASSWORD_MIN_LENGTH} characters. A passphrase of a few words works well.`}>
          <form onSubmit={handleSubmit} noValidate className="grid gap-5">
            {/* Lets password managers attach the new password to the right account. */}
            <input type="text" name="username" autoComplete="username" value={admin?.email ?? ''} readOnly hidden />
            <TextField
              path="currentPassword"
              label="Current password"
              type="password"
              autoComplete="current-password"
              value={form.currentPassword}
              onChange={update('currentPassword')}
              error={errors.currentPassword}
            />
            <TextField
              path="newPassword"
              label="New password"
              type="password"
              autoComplete="new-password"
              value={form.newPassword}
              onChange={update('newPassword')}
              error={errors.newPassword}
            />
            <TextField
              path="confirmPassword"
              label="Repeat the new password"
              type="password"
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={update('confirmPassword')}
              error={errors.confirmPassword}
            />
            <div>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Updating…' : 'Update password'}
              </button>
            </div>
          </form>
        </Section>

        <Section id="sessions" title="Sign out" description="Ends this session on this device.">
          <div>
            <button type="button" className="btn btn-secondary" onClick={logout}>
              Sign out
            </button>
          </div>
        </Section>
      </div>
    </>
  );
};

export default AccountPage;
