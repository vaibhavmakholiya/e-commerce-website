import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';
import RatingStars from '../components/ui/RatingStars';
import Modal from '../components/ui/Modal';
import FormField from '../components/ui/FormField';
import { useToast } from '../components/ui/Toast';
import { useCart } from '../context/CartContext';
import { formatPrice, formatDiscount } from '../utils/formatters';
import { productService } from '../services/productService';
import { SkeletonProductCard } from '../components/ui/Spinner';

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Gallery & variant state (set after product loads)
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState({});

  // Review modal state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewName, setReviewName] = useState('');
  const [localReviews, setLocalReviews] = useState([]);

  // Fetch product from backend (try slug first, then by id)
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setSelectedImage(0);
    setQuantity(1);

    const tryFetch = async () => {
      try {
        let res;
        // Try slug endpoint first
        try {
          res = await productService.getProductBySlug(id);
        } catch {
          // Fallback to ID lookup
          res = await productService.getProductById(id);
        }
        if (cancelled) return;

        const p = res?.data || res;
        if (!p || !p.name) throw new Error('Product not found');

        setProduct(p);
        setLocalReviews(p.reviews || []);

        // Initialize variants
        const initial = {};
        (p.variants || []).forEach((v) => { initial[v.name] = v.options[0]; });
        setSelectedVariants(initial);

        // Fetch related products by category
        if (p.category) {
          productService.getProducts({ category: p.category, limit: 4 })
            .then((catRes) => {
              const catData = catRes?.data || catRes;
              const all = Array.isArray(catData) ? catData : (catData?.products || []);
              const pid = p._id || p.id;
              setRelatedProducts(all.filter((r) => (r._id || r.id) !== pid).slice(0, 4));
            })
            .catch(() => {});
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Product not found');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    tryFetch();
    return () => { cancelled = true; };
  }, [id]);

  if (loading) {
    return (
      <MainLayout>
        <div className="container" style={{ padding: 'var(--space-8) var(--space-4) var(--space-16)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-8)', marginBottom: 'var(--space-8)' }}>
            <div style={{ height: 480, background: 'var(--surface-hover)', borderRadius: 'var(--radius-lg)', animation: 'pulse 1.5s ease-in-out infinite' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} style={{ height: i === 0 ? 36 : 20, background: 'var(--surface-hover)', borderRadius: 'var(--radius-md)', animation: 'pulse 1.5s ease-in-out infinite', width: i === 0 ? '70%' : '90%' }} />
              ))}
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !product) {
    return (
      <MainLayout>
        <div className="container" style={{ padding: 'var(--space-16) 0', textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: 'var(--space-4)' }}>😕</div>
          <h2>Product Not Found</h2>
          <p style={{ color: 'var(--text-muted)', margin: '1rem 0 2rem' }}>
            {error || 'The item you are looking for does not exist or has been discontinued.'}
          </p>
          <Link to="/shop" className="btn btn-primary">Back to Shop</Link>
        </div>
      </MainLayout>
    );
  }

  const pid = product._id || product.id;
  const hasDiscount = product.salePrice && product.salePrice < product.price;
  const discountText = hasDiscount ? formatDiscount(product.price, product.salePrice) : null;
  const effectivePrice = hasDiscount ? product.salePrice : product.price;
  const stock = product.stock ?? product.inventory ?? 0;
  const images = product.images?.length ? product.images : ['https://via.placeholder.com/800x800?text=No+Image'];
  const rating = product.rating?.average ?? product.rating ?? 0;
  const ratingCount = product.rating?.count ?? product.ratingCount ?? 0;

  const handleVariantSelect = (variantName, option) => {
    setSelectedVariants((prev) => ({ ...prev, [variantName]: option }));
  };

  const handleQuantityChange = (delta) => {
    setQuantity((prev) => {
      const next = prev + delta;
      if (next < 1) return 1;
      if (next > stock) return stock;
      return next;
    });
  };

  const handleAddToCart = () => {
    if (stock === 0) {
      toast.error('Sorry, this product is out of stock.');
      return;
    }
    addToCart(
      { ...product, id: pid, stock },
      quantity,
      Object.keys(selectedVariants).length ? selectedVariants : null
    );
    toast.success(`"${product.name}" (×${quantity}) added to cart!`);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/checkout');
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!reviewComment.trim() || !reviewName.trim()) {
      toast.error('Please fill in your name and review.');
      return;
    }
    const newReview = {
      id: 'r_' + Date.now(),
      user: reviewName,
      rating: reviewRating,
      date: new Date().toISOString().split('T')[0],
      title: reviewTitle || 'Customer Review',
      comment: reviewComment,
      verified: false,
    };
    setLocalReviews((prev) => [newReview, ...prev]);
    setReviewModalOpen(false);
    setReviewTitle('');
    setReviewComment('');
    setReviewName('');
    setReviewRating(5);
    toast.success('Review submitted successfully!');
  };

  return (
    <MainLayout>
      <div className="container" style={{ padding: 'var(--space-8) var(--space-4) var(--space-16)' }}>
        {/* Breadcrumbs */}
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/shop">Shop</Link>
          <span>/</span>
          {product.category && (
            <>
              <Link to={`/shop?category=${product.category}`} style={{ textTransform: 'capitalize' }}>
                {product.categoryLabel || product.category}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="current">{product.name}</span>
        </nav>

        {/* Product Detail Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-10)', marginBottom: 'var(--space-12)' }}>
          {/* Left: Images */}
          <div>
            <div style={{ position: 'relative', borderRadius: 'var(--radius-xl)', overflow: 'hidden', marginBottom: 'var(--space-4)', background: 'var(--surface-elevated)', aspectRatio: '1/1' }}>
              <img
                src={images[selectedImage]}
                alt={`${product.name} image ${selectedImage + 1}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => { e.target.src = 'https://via.placeholder.com/800x800?text=No+Image'; }}
              />
              {hasDiscount && (
                <Badge variant="danger" style={{ position: 'absolute', top: 'var(--space-3)', left: 'var(--space-3)', fontSize: 'var(--text-sm)', padding: '0.4rem 0.8rem' }}>
                  {discountText}
                </Badge>
              )}
              {stock === 0 && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Badge variant="danger" style={{ fontSize: 'var(--text-lg)', padding: '0.5rem 1.5rem' }}>Out of Stock</Badge>
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    style={{
                      width: 70, height: 70,
                      borderRadius: 'var(--radius-md)',
                      overflow: 'hidden',
                      border: `2.5px solid ${selectedImage === idx ? 'var(--color-primary-500)' : 'var(--border-color)'}`,
                      cursor: 'pointer',
                      padding: 0,
                      transition: 'border-color 0.2s',
                    }}
                    aria-label={`View image ${idx + 1}`}
                  >
                    <img src={img} alt={`Thumbnail ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/80x80'; }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {product.badge && <Badge variant={product.badgeVariant || 'primary'} style={{ alignSelf: 'flex-start' }}>{product.badge}</Badge>}
            <div>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', textTransform: 'capitalize', marginBottom: '0.25rem' }}>
                {product.brand && `${product.brand} · `}{product.categoryLabel || product.category}
              </p>
              <h1 style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 800, lineHeight: 1.3 }}>{product.name}</h1>
            </div>

            {rating > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <RatingStars rating={rating} />
                <span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
                  {rating.toFixed(1)} ({ratingCount.toLocaleString('en-IN')} reviews)
                </span>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
              <span style={{ fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', fontWeight: 800, color: 'var(--color-primary-400)' }}>
                {formatPrice(effectivePrice)}
              </span>
              {hasDiscount && (
                <>
                  <span style={{ fontSize: 'var(--text-lg)', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                    {formatPrice(product.price)}
                  </span>
                  <Badge variant="success">{discountText}</Badge>
                </>
              )}
            </div>

            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              {product.shortDescription || product.description?.slice(0, 200)}
            </p>

            {/* Variants */}
            {product.variants?.map((variant) => (
              <div key={variant.name}>
                <p style={{ fontWeight: 600, marginBottom: 'var(--space-2)', fontSize: 'var(--text-sm)' }}>
                  {variant.name}: <span style={{ color: 'var(--color-primary-400)' }}>{selectedVariants[variant.name]}</span>
                </p>
                <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                  {variant.options.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => handleVariantSelect(variant.name, opt)}
                      style={{
                        padding: '0.4rem 1rem',
                        borderRadius: 'var(--radius-full)',
                        border: `2px solid ${selectedVariants[variant.name] === opt ? 'var(--color-primary-500)' : 'var(--border-color)'}`,
                        background: selectedVariants[variant.name] === opt ? 'var(--color-primary-500)' : 'transparent',
                        color: selectedVariants[variant.name] === opt ? '#fff' : 'var(--text-primary)',
                        cursor: 'pointer',
                        fontSize: 'var(--text-sm)',
                        fontWeight: 600,
                        transition: 'all 0.18s ease',
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Stock & Quantity */}
            <div>
              <p style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--space-2)', fontWeight: 600 }}>
                Stock:
                {stock > 0
                  ? <span style={{ color: 'var(--color-success-400)', marginLeft: '0.5rem' }}>✅ In Stock {stock <= 5 && `(Only ${stock} left!)`}</span>
                  : <span style={{ color: 'var(--color-danger-400)', marginLeft: '0.5rem' }}>❌ Out of Stock</span>
                }
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid var(--border-color)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                  <button onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1}
                    style={{ padding: '0.5rem 1rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', color: 'var(--text-primary)' }}>−</button>
                  <span style={{ padding: '0.5rem 1rem', fontWeight: 700, minWidth: 40, textAlign: 'center' }}>{quantity}</span>
                  <button onClick={() => handleQuantityChange(1)} disabled={quantity >= stock}
                    style={{ padding: '0.5rem 1rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', color: 'var(--text-primary)' }}>+</button>
                </div>
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>Max: {stock}</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
              <Button variant="primary" size="lg" onClick={handleAddToCart} disabled={stock === 0} style={{ flex: 1, minWidth: 160 }}>
                🛒 Add to Cart
              </Button>
              <Button variant="secondary" size="lg" onClick={handleBuyNow} disabled={stock === 0} style={{ flex: 1, minWidth: 160 }}>
                ⚡ Buy Now
              </Button>
            </div>

            {/* Features */}
            {product.features?.length > 0 && (
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 'var(--space-4)' }}>
                <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginBottom: 'var(--space-3)' }}>Key Features</h3>
                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  {product.features.map((f, i) => (
                    <li key={i} style={{ display: 'flex', gap: 'var(--space-2)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                      <span style={{ color: 'var(--color-primary-400)', flexShrink: 0 }}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Specifications */}
        {product.specifications && Object.keys(product.specifications).length > 0 && (
          <section aria-labelledby="specs-title" style={{ marginBottom: 'var(--space-12)' }}>
            <h2 id="specs-title" style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: 'var(--space-4)' }}>Specifications</h2>
            <Card>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  {Object.entries(product.specifications).map(([key, val], i) => (
                    <tr key={key} style={{ background: i % 2 === 0 ? 'var(--surface-elevated)' : 'transparent' }}>
                      <td style={{ padding: 'var(--space-3) var(--space-4)', fontWeight: 600, color: 'var(--text-secondary)', width: '35%', fontSize: 'var(--text-sm)' }}>{key}</td>
                      <td style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--text-primary)', fontSize: 'var(--text-sm)' }}>{val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </section>
        )}

        {/* Reviews */}
        <section aria-labelledby="reviews-title" style={{ marginBottom: 'var(--space-12)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
            <h2 id="reviews-title" style={{ fontSize: 'var(--text-xl)', fontWeight: 700 }}>
              Customer Reviews ({localReviews.length})
            </h2>
            <Button variant="outline" onClick={() => setReviewModalOpen(true)}>Write a Review</Button>
          </div>
          {localReviews.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No reviews yet. Be the first to review this product!</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {localReviews.map((review) => (
                <Card key={review.id || review._id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-2)' }}>
                    <div>
                      <strong>{review.user}</strong>
                      {review.verified && <Badge variant="success" style={{ marginLeft: '0.5rem', fontSize: '0.65rem' }}>✓ Verified</Badge>}
                    </div>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{review.date}</span>
                  </div>
                  <RatingStars rating={review.rating} size="sm" />
                  {review.title && <p style={{ fontWeight: 600, marginTop: 'var(--space-2)' }}>{review.title}</p>}
                  <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-1)', fontSize: 'var(--text-sm)' }}>{review.comment}</p>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section aria-labelledby="related-title">
            <h2 id="related-title" style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: 'var(--space-6)' }}>You May Also Like</h2>
            <div className="product-grid">
              {relatedProducts.map((rp) => {
                const rpid = rp._id || rp.id;
                const rpSlug = rp.slug || rpid;
                const rpImg = rp.images?.[0] || rp.image || 'https://via.placeholder.com/400x400';
                const rpPrice = rp.salePrice || rp.price;
                return (
                  <Link key={rpid} to={`/product/${rpSlug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <Card hoverable className="product-card">
                      <div className="product-card-image-wrapper">
                        <img src={rpImg} alt={rp.name} className="product-card-image" loading="lazy"
                          onError={(e) => { e.target.src = 'https://via.placeholder.com/400x400'; }} />
                      </div>
                      <div className="product-card-body">
                        <h3 className="product-card-title">{rp.name}</h3>
                        <p className="price-current">{formatPrice(rpPrice)}</p>
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>

      {/* Review Modal */}
      <Modal isOpen={reviewModalOpen} onClose={() => setReviewModalOpen(false)} title="Write a Review">
        <form onSubmit={handleSubmitReview} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <FormField label="Your Name" required>
            <input className="form-input" value={reviewName} onChange={(e) => setReviewName(e.target.value)} placeholder="e.g. Rahul Sharma" required />
          </FormField>
          <div>
            <label style={{ fontWeight: 600, fontSize: 'var(--text-sm)', marginBottom: 'var(--space-2)', display: 'block' }}>Rating</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} type="button" onClick={() => setReviewRating(star)}
                  style={{ fontSize: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', color: star <= reviewRating ? '#f59e0b' : 'var(--border-color)' }}>
                  ★
                </button>
              ))}
            </div>
          </div>
          <FormField label="Review Title">
            <input className="form-input" value={reviewTitle} onChange={(e) => setReviewTitle(e.target.value)} placeholder="Summarize your experience" />
          </FormField>
          <FormField label="Your Review" required>
            <textarea className="form-input" rows={4} value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} placeholder="What did you like or dislike?" required />
          </FormField>
          <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
            <Button type="button" variant="ghost" onClick={() => setReviewModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Submit Review</Button>
          </div>
        </form>
      </Modal>
    </MainLayout>
  );
};

export default ProductDetailsPage;
