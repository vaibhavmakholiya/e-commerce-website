import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import FormField from '../components/ui/FormField';
import Badge from '../components/ui/Badge';
import { useToast } from '../components/ui/Toast';
import { useAuth } from '../context/AuthContext';
import { validatePassword, validatePasswordConfirm } from '../utils/validators';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const { updatePassword } = useAuth();
  const { toast } = useToast();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    const passRes = validatePassword(password);
    const confirmRes = validatePasswordConfirm(password, confirmPassword);

    if (!passRes.isValid) errs.password = passRes.message;
    if (!confirmRes.isValid) errs.confirmPassword = confirmRes.message;

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      await updatePassword(password);
      setLoading(false);
      setSuccess(true);
      toast.success('Your password has been successfully updated!');
    } catch (err) {
      setLoading(false);
      toast.error(err.message || 'Failed to update password. Reset link may have expired.');
    }
  };

  return (
    <MainLayout>
      <div
        className="container"
        style={{ padding: 'var(--space-12) var(--space-4) var(--space-16)', maxWidth: '440px' }}
      >
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
          <Badge variant="info" style={{ marginBottom: '0.75rem' }}>Security</Badge>
          <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, marginBottom: '0.5rem' }}>
            Set New Password
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
            Enter your new secure password below to regain access to NovaCart.
          </p>
        </div>

        <Card style={{ padding: 'var(--space-6)' }}>
          {success ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-4) 0' }}>
              <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.75rem' }}>✓</span>
              <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: '0.5rem' }}>
                Password Updated
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-6)' }}>
                You can now sign in using your new credentials.
              </p>
              <Button variant="primary" block onClick={() => navigate('/login')}>
                Sign In Now →
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <FormField
                label="New Password"
                type="password"
                placeholder="Min 8 characters, 1 uppercase, 1 digit"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrors((p) => ({ ...p, password: '' }));
                }}
                error={errors.password}
                required
                icon="🔒"
                autoComplete="new-password"
              />

              <FormField
                label="Confirm New Password"
                type="password"
                placeholder="Re-enter your new password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setErrors((p) => ({ ...p, confirmPassword: '' }));
                }}
                error={errors.confirmPassword}
                required
                icon="🔒"
                autoComplete="new-password"
              />

              <Button
                type="submit"
                variant="primary"
                block
                isLoading={loading}
                style={{ marginTop: 'var(--space-4)' }}
              >
                Update Password
              </Button>
            </form>
          )}
        </Card>
      </div>
    </MainLayout>
  );
};

export default ResetPasswordPage;
