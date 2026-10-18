import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from './ui/Toast';
import { validateEmail } from '../utils/validators';

const FOOTER_NAV = {
  Shop: [
    { label: 'All Products', href: '/shop' },
    { label: 'Electronics', href: '/shop?category=electronics' },
    { label: 'Fashion & Apparel', href: '/shop?category=fashion' },
    { label: 'Home & Living', href: '/shop?category=home-living' },
    { label: 'Accessories', href: '/shop?category=accessories' },
  ],
  Account: [
    { label: 'My Account & Orders', href: '/profile' },
    { label: 'Shopping Cart', href: '/cart' },
    { label: 'Track Order', href: '/profile' },
    { label: 'Sign In / Register', href: '/login' },
  ],
  Help: [
    { label: 'About NovaCart', href: '/about' },
    { label: 'Contact & Support', href: '/contact' },
    { label: 'Frequently Asked Questions', href: '/faq' },
  ],
  Policies: [
    { label: 'Shipping & Delivery', href: '/shipping-policy' },
    { label: 'Returns & Refunds', href: '/refund-policy' },
    { label: 'Privacy Policy', href: '/privacy-policy' },
    { label: 'Terms & Conditions', href: '/terms' },
  ],
};

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const { toast } = useToast();
  const year = new Date().getFullYear();

  const handleSubscribe = (e) => {
    e.preventDefault();
    const res = validateEmail(email);
    if (!res.isValid) {
      toast.error(res.message);
      return;
    }
    setSubscribed(true);
    toast.success('Thank you for subscribing to NovaCart exclusive offers!');
    setEmail('');
  };

  return (
    <footer className="site-footer" role="contentinfo">
      <div className="container">
        {/* Newsletter Section */}
        <section
          aria-labelledby="newsletter-heading"
          style={{
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-8) var(--space-8)',
            marginBottom: 'var(--space-12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 'var(--space-6)',
          }}
        >
          <div style={{ maxWidth: '480px' }}>
            <span className="badge badge-warning" style={{ marginBottom: '0.5rem' }}>
              Special Offers & Updates
            </span>
            <h2
              id="newsletter-heading"
              style={{
                fontSize: 'var(--text-xl)',
                fontWeight: 700,
                color: 'var(--text-main)',
                marginBottom: '0.25rem',
              }}
            >
              Subscribe to the NovaCart Gazette
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
              Get ₹500 off coupon codes, early access to festive sales, and new tech drops. No spam, ever.
            </p>
          </div>

          <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: '0.5rem', flex: '1', maxWidth: '420px', minWidth: '280px' }}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="form-control"
              aria-label="Email for newsletter subscription"
              style={{ borderRadius: 'var(--radius-md)' }}
              disabled={subscribed}
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={subscribed}
              style={{ whiteSpace: 'nowrap' }}
            >
              {subscribed ? 'Subscribed ✓' : 'Subscribe'}
            </button>
          </form>
        </section>

        {/* 4-Column Navigation Grid */}
        <div className="footer-grid">
          {/* Brand Column */}
          <div className="footer-brand-col">
            <Link to="/" aria-label="NovaCart Home" className="footer-brand">
              <span
                style={{
                  background: 'linear-gradient(135deg, #2563eb, #f59e0b)',
                  borderRadius: '8px',
                  width: '32px',
                  height: '32px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1rem',
                  marginRight: '0.5rem',
                  verticalAlign: 'middle',
                }}
                aria-hidden="true"
              >
                ⚡
              </span>
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, color: '#fff' }}>
                Nova<span style={{ color: 'var(--color-primary-400)' }}>Cart</span>
              </span>
            </Link>
            <p className="footer-tagline">
              Modern shopping engineered for India. Curated quality electronics, apparel, and lifestyle goods delivered securely to your doorstep.
            </p>
            <div className="footer-trust-badges">
              <span className="badge badge-default badge-pill">🔒 256-bit SSL</span>
              <span className="badge badge-default badge-pill">🇮🇳 Pan-India Shipping</span>
              <span className="badge badge-default badge-pill">💳 Razorpay Secured</span>
            </div>
          </div>

          {/* Nav groups */}
          {Object.entries(FOOTER_NAV).map(([title, links]) => (
            <div className="footer-link-col" key={title}>
              <h3 className="footer-col-heading">{title}</h3>
              <ul role="list">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link to={href} className="footer-link">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <p>© {year} NovaCart India Technologies Pvt. Ltd. All rights reserved.</p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/shipping-policy" className="footer-link" style={{ fontSize: 'var(--text-xs)' }}>Shipping</Link>
            <Link to="/refund-policy" className="footer-link" style={{ fontSize: 'var(--text-xs)' }}>Returns</Link>
            <Link to="/privacy-policy" className="footer-link" style={{ fontSize: 'var(--text-xs)' }}>Privacy</Link>
            <Link to="/terms" className="footer-link" style={{ fontSize: 'var(--text-xs)' }}>Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
