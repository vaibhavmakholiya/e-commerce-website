import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import FormField from '../components/ui/FormField';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import { useToast } from '../components/ui/Toast';
import { useAuth } from '../context/AuthContext';
import { validateEmail, validateRequired } from '../utils/validators';

const LoginPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, loginAsDemo, requestPasswordReset } = useAuth();
  const { toast } = useToast();

  const redirectTarget = searchParams.get('redirect') || '/profile';

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Forgot password modal state
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    const emailRes = validateEmail(form.email);
    const passRes = validateRequired(form.password, 'Password');
    if (!emailRes.isValid) newErrors.email = emailRes.message;
    if (!passRes.isValid) newErrors.password = passRes.message;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      await login(form.email, form.password);
      setLoading(false);
      toast.success('Welcome back to NovaCart!');
      navigate(redirectTarget);
    } catch (err) {
      setLoading(false);
      toast.error('Invalid credentials. Please try again.');
    }
  };

  const handleDemoLogin = () => {
    loginAsDemo();
    toast.success('Logged in as Demo Customer (Arjun Sharma)!');
    navigate(redirectTarget);
  };

  const handleSendReset = async (e) => {
    e.preventDefault();
    const res = validateEmail(forgotEmail);
    if (!res.isValid) {
      toast.error(res.message);
      return;
    }
    await requestPasswordReset(forgotEmail);
    setResetSent(true);
    toast.success(`Reset link sent to ${forgotEmail}`);
  };

  return (
    <MainLayout>
      <section
        aria-labelledby="login-heading"
        style={{ padding: 'var(--space-12) 0', display: 'flex', justifyContent: 'center' }}
      >
        <div style={{ width: '100%', maxWidth: '440px', padding: '0 var(--space-4)' }}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
            <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.75rem' }} aria-hidden="true">
              ⚡
            </span>
            <h1 id="login-heading" style={{ fontSize: 'var(--text-3xl)', marginBottom: '0.5rem' }}>
              Welcome Back
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
              New to NovaCart?{' '}
              <Link to={`/register?redirect=${encodeURIComponent(redirectTarget)}`} style={{ color: 'var(--color-primary-400)', fontWeight: 600 }}>
                Create an account
              </Link>
            </p>
          </div>

          <Card style={{ padding: 'var(--space-6)' }}>
            {/* Quick 1-Click Demo Login */}
            <Button
              variant="secondary"
              block
              onClick={handleDemoLogin}
              style={{ marginBottom: 'var(--space-4)' }}
            >
              ⚡ 1-Click Sign In as Demo Customer
            </Button>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                margin: 'var(--space-4) 0',
                color: 'var(--text-dim)',
                fontSize: 'var(--text-xs)',
              }}
            >
              <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
              <span>OR EMAIL & PASSWORD</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
            </div>

            <form onSubmit={handleSubmit} noValidate aria-label="Sign in form">
              <FormField
                label="Email Address"
                name="email"
                type="email"
                placeholder="arjun@example.in"
                required
                value={form.email}
                onChange={handleChange}
                error={errors.email}
                icon="✉"
                autoComplete="email"
              />

              <FormField
                label="Password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                value={form.password}
                onChange={handleChange}
                error={errors.password}
                icon="🔒"
                autoComplete="current-password"
              />

              <div style={{ textAlign: 'right', marginTop: '-0.25rem', marginBottom: 'var(--space-4)' }}>
                <button
                  type="button"
                  onClick={() => {
                    setForgotEmail(form.email || '');
                    setForgotModalOpen(true);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-primary-400)',
                    fontSize: 'var(--text-xs)',
                    cursor: 'pointer',
                  }}
                >
                  Forgot password?
                </button>
              </div>

              <Button type="submit" variant="primary" block isLoading={loading}>
                Sign In →
              </Button>
            </form>
          </Card>
        </div>
      </section>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={forgotModalOpen}
        onClose={() => {
          setForgotModalOpen(false);
          setResetSent(false);
        }}
        title="Reset Account Password"
        size="sm"
      >
        {resetSent ? (
          <div>
            <p style={{ color: 'var(--color-emerald-300)', fontSize: 'var(--text-sm)', marginBottom: '1rem' }}>
              ✓ A secure password reset link has been dispatched to <strong>{forgotEmail}</strong>.
            </p>
            <Button variant="primary" block onClick={() => setForgotModalOpen(false)}>
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSendReset}>
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)', marginBottom: '1rem' }}>
              Enter your registered email address and we'll send you instructions to reset your password.
            </p>
            <FormField
              label="Email Address"
              type="email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: 'var(--space-4)' }}>
              <Button variant="ghost" type="button" onClick={() => setForgotModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Send Reset Link
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </MainLayout>
  );
};

export default LoginPage;
