import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import FormField from '../components/ui/FormField';
import Badge from '../components/ui/Badge';
import { useToast } from '../components/ui/Toast';
import { validateName, validateEmail, validateRequired } from '../utils/validators';

const ContactPage = () => {
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    orderNumber: '',
    subject: 'Order Enquiry',
    message: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    const nameRes = validateName(form.name);
    const emailRes = validateEmail(form.email);
    const msgRes = validateRequired(form.message, 'Message');

    if (!nameRes.isValid) errs.name = nameRes.message;
    if (!emailRes.isValid) errs.email = emailRes.message;
    if (!msgRes.isValid) errs.message = msgRes.message;

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      toast.success('Your enquiry has been received! Ticket #NC-9821 created.');
    }, 1000);
  };

  return (
    <MainLayout>
      <div className="container" style={{ padding: 'var(--space-12) var(--space-4) var(--space-16)', maxWidth: '960px' }}>
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span aria-hidden="true">/</span>
          <span className="current">Contact Us</span>
        </nav>

        <div style={{ textAlign: 'center', marginBottom: 'var(--space-10)' }}>
          <Badge variant="info" style={{ marginBottom: '0.5rem' }}>We Are Here to Help</Badge>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, marginBottom: '0.75rem' }}>
            Get in Touch with NovaCart Support
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-base)', maxWidth: '580px', margin: '0 auto' }}>
            Have a question about an order, shipment, or refund? Our team in Bengaluru is available Monday to Saturday, 9:00 AM – 7:00 PM IST.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: 'var(--space-8)' }}>
          {/* ── LEFT: CONTACT DETAILS & CHANNELS ──────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <Card style={{ padding: 'var(--space-6)' }}>
              <span style={{ fontSize: '1.75rem', display: 'block', marginBottom: '0.5rem' }}>✉️</span>
              <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginBottom: '0.25rem' }}>Email Support</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)', marginBottom: '0.5rem' }}>
                Expect a response within 4-6 business hours.
              </p>
              <a href="mailto:support@novacart.in" style={{ color: 'var(--color-primary-400)', fontWeight: 600, fontSize: 'var(--text-sm)' }}>
                support@novacart.in
              </a>
            </Card>

            <Card style={{ padding: 'var(--space-6)' }}>
              <span style={{ fontSize: '1.75rem', display: 'block', marginBottom: '0.5rem' }}>📞</span>
              <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginBottom: '0.25rem' }}>Customer Care Helpline</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)', marginBottom: '0.5rem' }}>
                Toll-free across India • Mon-Sat, 9 AM - 7 PM IST
              </p>
              <strong style={{ color: 'var(--text-main)', fontSize: 'var(--text-sm)' }}>
                1800-419-NOVA (6682)
              </strong>
            </Card>

            <Card style={{ padding: 'var(--space-6)' }}>
              <span style={{ fontSize: '1.75rem', display: 'block', marginBottom: '0.5rem' }}>🏢</span>
              <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginBottom: '0.25rem' }}>Registered Office</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)', lineHeight: 1.6 }}>
                NovaCart India Technologies Pvt. Ltd.<br />
                EcoSpace Tech Park, Block 4B, Outer Ring Road, Bellandur,<br />
                Bengaluru, Karnataka — 560103, India
              </p>
            </Card>
          </div>

          {/* ── RIGHT: MESSAGE FORM ───────────────────────────── */}
          <Card style={{ padding: 'var(--space-6)' }}>
            <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: 'var(--space-4)' }}>
              Send Us a Message
            </h2>

            {submitted ? (
              <div style={{ padding: 'var(--space-6)', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid var(--color-emerald-500)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.5rem' }}>✓</span>
                <h3 style={{ fontSize: 'var(--text-lg)', color: 'var(--color-emerald-300)', marginBottom: '0.25rem' }}>
                  Message Sent Successfully
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginBottom: '1rem' }}>
                  Thank you! Our support team has logged ticket <strong>#NC-9821</strong> and will email you at <strong>{form.email}</strong> shortly.
                </p>
                <Button variant="secondary" size="sm" onClick={() => setSubmitted(false)}>
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                  <FormField
                    label="Your Name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    error={errors.name}
                    placeholder="Arjun Sharma"
                    required
                  />
                  <FormField
                    label="Email Address"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    error={errors.email}
                    placeholder="arjun@example.in"
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                  <FormField
                    label="Phone (Optional)"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="9876543210"
                  />
                  <FormField
                    label="Order Ref (Optional)"
                    name="orderNumber"
                    value={form.orderNumber}
                    onChange={handleChange}
                    placeholder="NC-20260301-3211"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <select
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    className="form-control"
                  >
                    <option value="Order Enquiry">Order Status / Delivery</option>
                    <option value="Return / Refund">Return or Refund Request</option>
                    <option value="Payment Issue">Payment or Razorpay Query</option>
                    <option value="Product Enquiry">Product Specifications</option>
                    <option value="Other">General Feedback</option>
                  </select>
                </div>

                <FormField
                  label="Message"
                  name="message"
                  as="textarea"
                  rows={4}
                  value={form.message}
                  onChange={handleChange}
                  error={errors.message}
                  placeholder="How can we assist you today? Please provide as much detail as possible."
                  required
                />

                <Button
                  type="submit"
                  variant="primary"
                  block
                  isLoading={isSubmitting}
                  style={{ marginTop: 'var(--space-4)' }}
                >
                  Submit Enquiry ✉️
                </Button>
              </form>
            )}
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default ContactPage;
