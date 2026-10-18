import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import FormField from '../components/ui/FormField';
import Badge from '../components/ui/Badge';
import { useToast } from '../components/ui/Toast';
import { useAuth } from '../context/AuthContext';
import { validateEmail, validatePassword, validateName } from '../utils/validators';

const RegisterPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { register } = useAuth();
  const { toast } = useToast();

  const redirectTarget = searchParams.get('redirect') || '/profile';

  const [form, setForm] = useState({ fullName: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    const nameResult = validateName(form.fullName);
    const emailResult = validateEmail(form.email);
    const passwordResult = validatePassword(form.password);
    if (!nameResult.isValid) newErrors.fullName = nameResult.message;
    if (!emailResult.isValid) newErrors.email = emailResult.message;
    if (!passwordResult.isValid) newErrors.password = passwordResult.message;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      await register(form.fullName, form.email, form.password);
      setLoading(false);
      toast.success('Account created successfully! Welcome to NovaCart.');
      navigate(redirectTarget);
    } catch (err) {
      setLoading(false);
      toast.error('Registration failed. Please try again.');
    }
  };

  return (
    <MainLayout>
      <section
        aria-labelledby="register-heading"
        style={{ padding: 'var(--space-12) 0', display: 'flex', justifyContent: 'center' }}
      >
        <div style={{ width: '100%', maxWidth: '460px', padding: '0 var(--space-4)' }}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
            <Badge variant="info" style={{ marginBottom: '1rem' }}>
              Create Account
            </Badge>
            <h1 id="register-heading" style={{ fontSize: 'var(--text-3xl)', marginBottom: '0.5rem' }}>
              Join NovaCart
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
              Already have an account?{' '}
              <Link to={`/login?redirect=${encodeURIComponent(redirectTarget)}`} style={{ color: 'var(--color-primary-400)', fontWeight: 600 }}>
                Sign in
              </Link>
            </p>
          </div>

          <Card style={{ padding: 'var(--space-6)' }}>
            <form onSubmit={handleSubmit} noValidate aria-label="Create account form">
              <FormField
                label="Full Name"
                name="fullName"
                type="text"
                placeholder="Arjun Sharma"
                required
                value={form.fullName}
                onChange={handleChange}
                error={errors.fullName}
                icon="👤"
                autoComplete="name"
              />
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
                placeholder="Min 8 chars, 1 uppercase, 1 number"
                required
                value={form.password}
                onChange={handleChange}
                error={errors.password}
                icon="🔒"
                hint="At least 8 characters with one uppercase letter and one number."
                autoComplete="new-password"
              />
              <Button
                type="submit"
                variant="primary"
                block
                isLoading={loading}
                style={{ marginTop: 'var(--space-4)' }}
              >
                Create My Account →
              </Button>
            </form>
          </Card>
        </div>
      </section>
    </MainLayout>
  );
};

export default RegisterPage;
