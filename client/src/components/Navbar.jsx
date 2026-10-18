import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '../utils/helpers';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Shop All', href: '/shop' },
  { label: 'Electronics', href: '/shop?category=electronics' },
  { label: 'Fashion', href: '/shop?category=fashion' },
  { label: 'Home & Living', href: '/shop?category=home-living' },
  { label: 'Accessories', href: '/shop?category=accessories' },
];

const BrandLogo = () => (
  <Link to="/" aria-label="NovaCart – Go to homepage" className="brand-logo-link">
    <span className="brand-logo" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <span
        style={{
          background: 'linear-gradient(135deg, #2563eb, #f59e0b)',
          borderRadius: '8px',
          width: '34px',
          height: '34px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.1rem',
          flexShrink: 0,
          boxShadow: '0 2px 10px rgba(37, 99, 235, 0.4)',
        }}
        aria-hidden="true"
      >
        ⚡
      </span>
      <span
        style={{
          fontFamily: 'var(--font-heading)',
          fontWeight: 800,
          fontSize: '1.35rem',
          letterSpacing: '-0.02em',
          color: '#ffffff',
        }}
      >
        Nova<span style={{ color: 'var(--color-primary-400)' }}>Cart</span>
      </span>
    </span>
  </Link>
);

/* ── Mobile Drawer ─────────────────────────────────────── */
const MobileDrawer = ({ isOpen, onClose, cartCount, user, onLogout }) => {
  const [mobileSearch, setMobileSearch] = useState('');
  const navigate = useNavigate();

  const handleMobileSearch = (e) => {
    e.preventDefault();
    if (mobileSearch.trim()) {
      navigate(`/shop?search=${encodeURIComponent(mobileSearch.trim())}`);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="mobile-nav-backdrop" onClick={onClose} aria-hidden="true" />
      <nav className="mobile-nav-drawer" aria-label="Mobile navigation">
        <div className="mobile-nav-header">
          <BrandLogo />
          <button
            className="btn btn-ghost btn-sm tap-target"
            onClick={onClose}
            aria-label="Close navigation menu"
          >
            ✕
          </button>
        </div>

        {/* Mobile Search */}
        <form onSubmit={handleMobileSearch} style={{ marginBottom: '1.25rem' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="search"
              placeholder="Search products, brands…"
              value={mobileSearch}
              onChange={(e) => setMobileSearch(e.target.value)}
              className="form-control"
              style={{ paddingLeft: '2.4rem', height: '42px', borderRadius: 'var(--radius-full)' }}
            />
            <span style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
              🔍
            </span>
          </div>
        </form>

        <ul className="mobile-nav-links" role="list">
          {NAV_LINKS.map(({ label, href }) => (
            <li key={href}>
              <Link to={href} className="mobile-nav-link" onClick={onClose}>
                {label}
              </Link>
            </li>
          ))}
          <li>
            <Link to="/about" className="mobile-nav-link" onClick={onClose}>
              About Us
            </Link>
          </li>
          <li>
            <Link to="/contact" className="mobile-nav-link" onClick={onClose}>
              Contact & Support
            </Link>
          </li>
          <li>
            <Link to="/faq" className="mobile-nav-link" onClick={onClose}>
              FAQs
            </Link>
          </li>
        </ul>

        <div
          style={{
            marginTop: 'auto',
            paddingTop: 'var(--space-6)',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-3)',
          }}
        >
          {user ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.25rem 0' }}>
                <span style={{ fontSize: '1.5rem' }}>{user.avatar || '👤'}</span>
                <div>
                  <p style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text-main)' }}>
                    {user.name}
                  </p>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                    {user.email}
                  </p>
                </div>
              </div>
              <Link to="/profile" className="btn btn-secondary btn-block" onClick={onClose}>
                My Account & Orders
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="btn btn-outline btn-block" style={{ borderColor: 'var(--color-amber-400)', color: 'var(--color-amber-400)' }} onClick={onClose}>
                  🛡 Admin Dashboard
                </Link>
              )}
              <Link to="/cart" className="btn btn-primary btn-block" onClick={onClose}>
                🛒 Cart {cartCount > 0 && `(${cartCount})`}
              </Link>
              <button
                className="btn btn-ghost btn-block"
                style={{ color: 'var(--color-rose-400)' }}
                onClick={() => {
                  onLogout();
                  onClose();
                }}
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/cart" className="btn btn-outline btn-block" onClick={onClose}>
                🛒 Cart {cartCount > 0 && `(${cartCount})`}
              </Link>
              <Link to="/login" className="btn btn-secondary btn-block" onClick={onClose}>
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-block" onClick={onClose}>
                Create Account
              </Link>
            </>
          )}
        </div>
      </nav>
    </>
  );
};

/* ── Main Navbar ───────────────────────────────────────── */
const Navbar = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userDropdown, setUserDropdown] = useState(false);

  const { cartCount } = useCart();
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setDrawerOpen(false);
    setUserDropdown(false);
  }, [pathname]);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 15);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      <header
        className={cn('site-header', scrolled && 'site-header--scrolled')}
        role="banner"
      >
        <div className="container">
          <nav className="site-nav" aria-label="Primary navigation">
            {/* Brand Logo */}
            <BrandLogo />

            {/* Desktop Navigation Links */}
            <ul className="site-nav__links" role="list">
              <li>
                <Link
                  to="/"
                  className={cn('site-nav__link', pathname === '/' && 'active')}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/shop"
                  className={cn('site-nav__link', pathname === '/shop' && 'active')}
                >
                  Shop
                </Link>
              </li>
            </ul>

            {/* Integrated Search Bar */}
            <form onSubmit={handleSearchSubmit} className="nav-search-form" role="search">
              <span className="nav-search-icon" aria-hidden="true">
                🔍
              </span>
              <input
                type="search"
                className="nav-search-input"
                placeholder="Search phones, sneakers, decor, tools…"
                aria-label="Search catalog"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="nav-search-clear"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </form>

            {/* Right Side Actions */}
            <div className="site-nav__actions">
              {/* Shopping Cart Icon with Live Count */}
              <Link
                to="/cart"
                className="icon-btn tap-target"
                aria-label={`Shopping cart with ${cartCount} items`}
              >
                <span aria-hidden="true" style={{ fontSize: '1.25rem' }}>
                  🛒
                </span>
                {cartCount > 0 && (
                  <span className="cart-badge" aria-hidden="true">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>

              {/* User Authentication Menu */}
              {user ? (
                <div style={{ position: 'relative' }}>
                  <button
                    className="user-avatar tap-target"
                    onClick={() => setUserDropdown((prev) => !prev)}
                    aria-expanded={userDropdown}
                    aria-label="Open user profile menu"
                    style={{ border: 'none', cursor: 'pointer' }}
                  >
                    {user.avatar || user.name?.[0]?.toUpperCase() || '👤'}
                  </button>

                  {userDropdown && (
                    <div
                      style={{
                        position: 'absolute',
                        right: 0,
                        top: '110%',
                        width: '220px',
                        background: 'var(--bg-surface-elevated)',
                        border: '1px solid var(--border-medium)',
                        borderRadius: 'var(--radius-md)',
                        boxShadow: 'var(--shadow-xl)',
                        padding: '0.75rem 0',
                        zIndex: 300,
                      }}
                    >
                      <div
                        style={{
                          padding: '0.5rem 1rem 0.75rem',
                          borderBottom: '1px solid var(--border-subtle)',
                        }}
                      >
                        <p style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text-main)' }}>
                          {user.name}
                        </p>
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {user.email}
                        </p>
                      </div>

                      <Link
                        to="/profile"
                        className="mobile-nav-link"
                        style={{ padding: '0.5rem 1rem', fontSize: 'var(--text-sm)' }}
                        onClick={() => setUserDropdown(false)}
                      >
                        👤 My Account & Orders
                      </Link>

                      <Link
                        to="/cart"
                        className="mobile-nav-link"
                        style={{ padding: '0.5rem 1rem', fontSize: 'var(--text-sm)' }}
                        onClick={() => setUserDropdown(false)}
                      >
                        🛒 Cart ({cartCount})
                      </Link>

                      {user.role === 'admin' && (
                        <Link
                          to="/admin"
                          className="mobile-nav-link"
                          style={{ padding: '0.5rem 1rem', fontSize: 'var(--text-sm)', color: 'var(--color-amber-400)', fontWeight: 700 }}
                          onClick={() => setUserDropdown(false)}
                        >
                          🛡 Admin Dashboard
                        </Link>
                      )}

                      <button
                        onClick={() => {
                          logout();
                          setUserDropdown(false);
                        }}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          background: 'none',
                          border: 'none',
                          padding: '0.5rem 1rem',
                          color: 'var(--color-rose-400)',
                          fontSize: 'var(--text-sm)',
                          cursor: 'pointer',
                        }}
                      >
                        🚪 Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="auth-actions">
                  <Link to="/login" className="btn btn-ghost btn-sm">
                    Sign In
                  </Link>
                  <Link to="/register" className="btn btn-primary btn-sm">
                    Sign Up
                  </Link>
                </div>
              )}

              {/* Hamburger Button for Mobile Drawer */}
              <button
                className="hamburger tap-target btn btn-ghost btn-sm"
                onClick={() => setDrawerOpen(true)}
                aria-label="Open mobile navigation menu"
                aria-expanded={drawerOpen}
              >
                <span className="hamburger__bar" aria-hidden="true" />
                <span className="hamburger__bar" aria-hidden="true" />
                <span className="hamburger__bar" aria-hidden="true" />
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile Drawer */}
      <MobileDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        cartCount={cartCount}
        user={user}
        onLogout={logout}
      />
    </>
  );
};

export default Navbar;
