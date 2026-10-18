import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';
import RatingStars from '../components/ui/RatingStars';
import { useToast } from '../components/ui/Toast';
import { useCart } from '../context/CartContext';
import { formatPrice, formatDiscount } from '../utils/formatters';
import { productService } from '../services/productService';
import { PRODUCTS, CATEGORIES as STATIC_CATEGORIES } from '../data/products';

const STATIC_FEATURED = PRODUCTS.filter((p) => p.isFeatured);
const STATIC_TRENDING = PRODUCTS.filter((p) => p.isTrending);

const HomePage = () => {
  const { toast } = useToast();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [heroSearch, setHeroSearch] = useState('');
  const [featuredProducts, setFeaturedProducts] = useState(STATIC_FEATURED);
  const [trendingProducts, setTrendingProducts] = useState(STATIC_TRENDING);
  const [categories, setCategories] = useState(STATIC_CATEGORIES);
  const [productsLoading, setProductsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    // Fetch categories
    productService.getCategories()
      .then((res) => {
        if (cancelled) return;
        const cats = res?.data || res;
        if (Array.isArray(cats) && cats.length > 0) setCategories(cats);
      })
      .catch(() => { /* keep static fallback */ });

    // Fetch featured products
    productService.getProducts({ featured: true, limit: 6, sort: 'featured' })
      .then((res) => {
        if (cancelled) return;
        const data = res?.data || res;
        const items = Array.isArray(data) ? data : (data?.products || []);
        if (items.length > 0) setFeaturedProducts(items);
      })
      .catch(() => { /* keep static fallback */ })
      .finally(() => { if (!cancelled) setProductsLoading(false); });

    // Fetch trending products (sort by popular/newest)
    productService.getProducts({ sort: 'popular', limit: 4 })
      .then((res) => {
        if (cancelled) return;
        const data = res?.data || res;
        const items = Array.isArray(data) ? data : (data?.products || []);
        if (items.length > 0) setTrendingProducts(items);
      })
      .catch(() => { /* keep static fallback */ });

    return () => { cancelled = true; };
  }, []);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      navigate(`/shop?search=${encodeURIComponent(heroSearch.trim())}`);
    }
  };

  const handleAddToCart = (product, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock === 0) {
      toast.error('Sorry, this product is currently out of stock!');
      return;
    }
    addToCart(product, 1, product.variants?.[0] ? { [product.variants[0].name]: product.variants[0].options[0] } : null);
    toast.success(`Added "${product.name}" to your cart!`);
  };

  const copyCoupon = (code) => {
    navigator.clipboard.writeText(code);
    toast.success(`Coupon "${code}" copied to clipboard! Use at checkout.`);
  };

  return (
    <MainLayout>
      {/* ── 1. PROMOTIONAL HERO SECTION ──────────────────────── */}
      <section
        aria-labelledby="hero-title"
        style={{
          position: 'relative',
          padding: 'var(--space-16) 0 var(--space-12)',
          overflow: 'hidden',
          background: 'radial-gradient(ellipse at 50% -20%, rgba(37, 99, 235, 0.25) 0%, transparent 70%)',
        }}
      >
        <div className="container" style={{ textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: 'var(--space-4)' }}>
            <span className="badge badge-warning badge-pill">
              ✨ Great Indian Festive Deals Live
            </span>
          </div>

          <h1
            id="hero-title"
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(2.5rem, 6vw, 4.2rem)',
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              marginBottom: 'var(--space-4)',
              background: 'linear-gradient(180deg, #ffffff 10%, #cbd5e1 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Curated Quality.<br />
            <span style={{ WebkitTextFillColor: 'var(--color-primary-400)' }}>
              Delivered Across India.
            </span>
          </h1>

          <p
            style={{
              fontSize: 'var(--text-lg)',
              color: 'var(--text-muted)',
              maxWidth: '640px',
              margin: '0 auto var(--space-8)',
              lineHeight: 1.6,
            }}
          >
            Discover handpicked Electronics, contemporary Fashion, Home & Living essentials, and Accessories — all priced in ₹ INR with verified fast dispatch.
          </p>

          {/* Prominent Hero Search Form */}
          <form
            onSubmit={handleHeroSearch}
            style={{
              maxWidth: '540px',
              margin: '0 auto var(--space-8)',
              display: 'flex',
              gap: '0.5rem',
              background: 'var(--bg-surface-elevated)',
              padding: '6px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-medium)',
              boxShadow: 'var(--shadow-xl)',
            }}
          >
            <input
              type="search"
              value={heroSearch}
              onChange={(e) => setHeroSearch(e.target.value)}
              placeholder="Search by product name, category, or keyword…"
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                padding: '0 1.25rem',
                color: 'var(--text-main)',
                fontSize: 'var(--text-sm)',
                outline: 'none',
              }}
              aria-label="Hero search catalog"
            />
            <Button type="submit" variant="primary" style={{ borderRadius: 'var(--radius-full)' }}>
              Search 🔍
            </Button>
          </form>

          {/* Quick CTA Actions */}
          <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/shop" className="btn btn-primary btn-lg">
              Explore All Products →
            </Link>
            <Link to="/shop?category=electronics" className="btn btn-secondary btn-lg">
              Shop Electronics
            </Link>
          </div>

          {/* Trust Value Props Strip */}
          <div
            style={{
              display: 'flex',
              gap: 'var(--space-4)',
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginTop: 'var(--space-12)',
            }}
          >
            {[
              { icon: '🚚', text: 'Free Delivery over ₹499' },
              { icon: '🔒', text: 'Razorpay Secure Payments' },
              { icon: '↩', text: '7-Day Hassle-Free Returns' },
              { icon: '⭐', text: '4.8/5 Customer Rating' },
            ].map(({ icon, text }) => (
              <span
                key={text}
                className="badge badge-default badge-pill"
                style={{ padding: '0.45rem 1rem', fontSize: 'var(--text-xs)', gap: '0.4rem' }}
              >
                <span aria-hidden="true">{icon}</span> {text}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── 2. CATEGORY CARDS SHOWCASE ───────────────────────── */}
      <section aria-labelledby="cat-heading" style={{ padding: 'var(--space-12) 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
            <h2 id="cat-heading" style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: '0.5rem' }}>
              Shop by Category
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
              Browse our catalog curated across 4 core departments
            </p>
          </div>

          <div className="category-cards-grid">
            {categories.map((cat) => {
              const catId = cat.id || cat.slug;
              return (
                <Link
                  key={catId}
                  to={`/shop?category=${catId}`}
                  className="category-card"
                  style={{
                    backgroundImage: cat.image
                      ? `linear-gradient(180deg, rgba(15, 23, 42, 0.75) 0%, rgba(15, 23, 42, 0.95) 100%), url(${cat.image})`
                      : 'linear-gradient(135deg, rgba(37, 99, 235, 0.4) 0%, rgba(15, 23, 42, 0.95) 100%)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  <div>
                    <span className="category-card-icon" aria-hidden="true">{cat.icon}</span>
                    <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginTop: '0.5rem', color: '#fff' }}>
                      {cat.name}
                    </h3>
                    {cat.description && (
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        {cat.description}
                      </p>
                    )}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--space-4)' }}>
                    {cat.count != null && <span className="category-card-count">{cat.count} Products</span>}
                    <span style={{ color: 'var(--color-primary-400)', fontWeight: 600, fontSize: 'var(--text-sm)', marginLeft: 'auto' }}>
                      Explore →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 3. PROMOTIONAL COUPON BANNER ────────────────────── */}
      <section style={{ padding: 'var(--space-4) 0' }}>
        <div className="container">
          <div className="promo-banner">
            <div>
              <span className="promo-tag">Festive Special</span>
              <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, margin: '0.5rem 0 0.25rem' }}>
                Flat 15% OFF on orders above ₹1,999!
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
                Apply coupon code <strong style={{ color: 'var(--color-amber-400)' }}>FESTIVE15</strong> at checkout.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyCoupon('FESTIVE15')}
              >
                Copy Code: FESTIVE15 📋
              </Button>
              <Link to="/shop" className="btn btn-primary btn-sm">
                Shop the Sale →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. FEATURED PRODUCTS GRID ───────────────────────── */}
      <section aria-labelledby="featured-title" style={{ padding: 'var(--space-12) 0' }}>
        <div className="container">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              marginBottom: 'var(--space-8)',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <span className="badge badge-info" style={{ marginBottom: '0.5rem' }}>
                Handpicked Selections
              </span>
              <h2 id="featured-title" style={{ fontSize: 'var(--text-2xl)', fontWeight: 800 }}>
                Featured Products
              </h2>
            </div>
            <Link to="/shop" className="btn btn-outline btn-sm">
              View All Catalog →
            </Link>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: 'var(--space-6)',
            }}
          >
            {featuredProducts.map((product) => {
              const pid = product._id || product.id;
              const slug = product.slug || pid;
              const image = product.images?.[0] || product.image || 'https://via.placeholder.com/400x400?text=No+Image';
              const hasDiscount = product.salePrice && product.salePrice < product.price;
              const discountText = hasDiscount ? formatDiscount(product.price, product.salePrice) : null;
              const stock = product.stock ?? product.inventory ?? 0;
              const rating = product.rating?.average ?? product.rating ?? 0;
              const ratingCount = product.rating?.count ?? product.ratingCount ?? 0;

              return (
                <Card
                  key={pid}
                  variant="interactive"
                  style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
                >
                  <Link to={`/product/${slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div style={{ position: 'relative', height: '210px', background: 'var(--bg-surface-elevated)', overflow: 'hidden' }}>
                      <img
                        src={image}
                        alt={product.name}
                        loading="lazy"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform var(--transition-normal)' }}
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/400x400?text=No+Image'; }}
                      />
                      {product.badge && (
                        <Badge variant={product.badgeVariant || 'primary'} style={{ position: 'absolute', top: '0.75rem', left: '0.75rem' }}>
                          {product.badge}
                        </Badge>
                      )}
                      {discountText && (
                        <Badge variant="danger" style={{ position: 'absolute', top: '0.75rem', right: '0.75rem' }}>
                          {discountText}
                        </Badge>
                      )}
                    </div>

                    <div style={{ padding: 'var(--space-4)', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary-400)', fontWeight: 600, marginBottom: '0.25rem', textTransform: 'capitalize' }}>
                        {product.categoryLabel || product.category}
                      </p>
                      <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, lineHeight: 1.35, marginBottom: '0.4rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {product.name}
                      </h3>
                      {rating > 0 && <RatingStars rating={rating} count={ratingCount} size={14} />}
                      <div style={{ marginTop: 'auto', paddingTop: 'var(--space-3)', display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                        <span style={{ fontSize: 'var(--text-xl)', fontWeight: 700, fontFamily: 'var(--font-heading)', color: 'var(--text-main)' }}>
                          {formatPrice(product.salePrice || product.price)}
                        </span>
                        {hasDiscount && (
                          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-dim)', textDecoration: 'line-through' }}>
                            {formatPrice(product.price)}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>

                  <div style={{ padding: '0 var(--space-4) var(--space-4)' }}>
                    <Button
                      variant={stock === 0 ? 'ghost' : 'primary'}
                      size="sm"
                      block
                      disabled={stock === 0}
                      onClick={(e) => handleAddToCart({ ...product, id: pid, stock }, e)}
                    >
                      {stock === 0 ? 'Out of Stock' : 'Add to Cart 🛒'}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 5. SECOND PROMOTIONAL BANNER ────────────────────── */}
      <section style={{ padding: 'var(--space-6) 0' }}>
        <div className="container">
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(37, 99, 235, 0.15) 100%)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-8)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 'var(--space-6)',
              alignItems: 'center',
            }}
          >
            <div>
              <span className="badge badge-success badge-pill" style={{ marginBottom: '0.5rem' }}>
                Bank & UPI Privilege
              </span>
              <h3 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: '0.5rem' }}>
                Instant ₹100 Off on First Order
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', lineHeight: 1.6 }}>
                New to NovaCart? Use coupon code <strong>WELCOME100</strong> at checkout on any order over ₹499. Instant discount verified on trusted server calculation.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-start' }}>
              <Button variant="secondary" onClick={() => copyCoupon('WELCOME100')}>
                Copy Code: WELCOME100 📋
              </Button>
              <Link to="/register" className="btn btn-primary">
                Join Free →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. TRENDING PRODUCTS SECTION ────────────────────── */}
      <section aria-labelledby="trending-title" style={{ padding: 'var(--space-12) 0 var(--space-16)' }}>
        <div className="container">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              marginBottom: 'var(--space-8)',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <span className="badge badge-warning" style={{ marginBottom: '0.5rem' }}>
                🔥 What Others Are Buying
              </span>
              <h2 id="trending-title" style={{ fontSize: 'var(--text-2xl)', fontWeight: 800 }}>
                Trending This Week
              </h2>
            </div>
            <Link to="/shop?sort=popular" className="btn btn-outline btn-sm">
              See All Trending →
            </Link>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: 'var(--space-6)',
            }}
          >
            {trendingProducts.map((product) => {
              const pid = product._id || product.id;
              const slug = product.slug || pid;
              const image = product.images?.[0] || product.image || 'https://via.placeholder.com/400x400?text=No+Image';
              const hasDiscount = product.salePrice && product.salePrice < product.price;
              const stock = product.stock ?? product.inventory ?? 0;
              const rating = product.rating?.average ?? product.rating ?? 0;
              const ratingCount = product.rating?.count ?? product.ratingCount ?? 0;

              return (
                <Card
                  key={pid}
                  variant="interactive"
                  style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
                >
                  <Link to={`/product/${slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div style={{ position: 'relative', height: '210px', background: 'var(--bg-surface-elevated)', overflow: 'hidden' }}>
                      <img
                        src={image}
                        alt={product.name}
                        loading="lazy"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/400x400?text=No+Image'; }}
                      />
                      {product.badge && (
                        <Badge variant={product.badgeVariant || 'warning'} style={{ position: 'absolute', top: '0.75rem', left: '0.75rem' }}>
                          {product.badge}
                        </Badge>
                      )}
                    </div>

                    <div style={{ padding: 'var(--space-4)', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary-400)', fontWeight: 600, marginBottom: '0.25rem', textTransform: 'capitalize' }}>
                        {product.categoryLabel || product.category}
                      </p>
                      <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, lineHeight: 1.35, marginBottom: '0.4rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {product.name}
                      </h3>
                      {rating > 0 && <RatingStars rating={rating} count={ratingCount} size={14} />}
                      <div style={{ marginTop: 'auto', paddingTop: 'var(--space-3)', display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                        <span style={{ fontSize: 'var(--text-xl)', fontWeight: 700, fontFamily: 'var(--font-heading)', color: 'var(--text-main)' }}>
                          {formatPrice(product.salePrice || product.price)}
                        </span>
                        {hasDiscount && (
                          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-dim)', textDecoration: 'line-through' }}>
                            {formatPrice(product.price)}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>

                  <div style={{ padding: '0 var(--space-4) var(--space-4)' }}>
                    <Button
                      variant={stock === 0 ? 'ghost' : 'primary'}
                      size="sm"
                      block
                      disabled={stock === 0}
                      onClick={(e) => handleAddToCart({ ...product, id: pid, stock }, e)}
                    >
                      {stock === 0 ? 'Out of Stock' : 'Add to Cart 🛒'}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default HomePage;
