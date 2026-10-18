import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import RatingStars from '../components/ui/RatingStars';
import EmptyState from '../components/ui/EmptyState';
import { SkeletonProductCard } from '../components/ui/Spinner';
import { useToast } from '../components/ui/Toast';
import { useCart } from '../context/CartContext';
import { formatPrice, formatDiscount } from '../utils/formatters';
import { productService } from '../services/productService';

const ITEMS_PER_PAGE = 8;

const FALLBACK_CATEGORIES = [
  { id: 'electronics', name: 'Electronics', icon: '💻' },
  { id: 'fashion', name: 'Fashion', icon: '👗' },
  { id: 'home-living', name: 'Home & Living', icon: '🏠' },
  { id: 'accessories', name: 'Accessories', icon: '⌚' },
];

const ShopPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const { addToCart } = useCart();

  // URL query params
  const urlCategory = searchParams.get('category') || '';
  const urlSearch = searchParams.get('search') || '';
  const urlSort = searchParams.get('sort') || 'featured';

  // Component state
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState(urlCategory);
  const [searchTerm, setSearchTerm] = useState(urlSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(urlSearch);
  const [sortBy, setSortBy] = useState(urlSort);
  const [maxPrice, setMaxPrice] = useState(150000);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const debounceRef = useRef(null);

  // Debounce search input — 350ms
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 350);
    return () => clearTimeout(debounceRef.current);
  }, [searchTerm]);

  // Sync state when URL params change
  useEffect(() => {
    setSelectedCategory(searchParams.get('category') || '');
    setSearchTerm(searchParams.get('search') || '');
    setDebouncedSearch(searchParams.get('search') || '');
    setSortBy(searchParams.get('sort') || 'featured');
    setPage(1);
  }, [searchParams]);

  // Fetch categories once on mount
  useEffect(() => {
    productService.getCategories()
      .then((res) => {
        const cats = res?.data || res;
        if (Array.isArray(cats) && cats.length > 0) setCategories(cats);
      })
      .catch(() => { /* use fallback */ });
  }, []);

  // Fetch products when filters change
  const fetchProducts = useCallback(async (isLoadMore = false) => {
    if (!isLoadMore) setLoading(true);
    else setLoadingMore(true);
    setError(null);

    try {
      const params = {
        page: isLoadMore ? page + 1 : 1,
        limit: ITEMS_PER_PAGE,
        sort: sortBy,
      };
      if (selectedCategory) params.category = selectedCategory;
      if (debouncedSearch) params.search = debouncedSearch;
      if (maxPrice < 150000) params.maxPrice = maxPrice;
      if (inStockOnly) params.inStock = true;

      const res = await productService.getProducts(params);
      const data = res?.data || res;
      const newProducts = Array.isArray(data) ? data : (data?.products || []);
      const total = data?.total ?? data?.totalProducts ?? newProducts.length;

      if (isLoadMore) {
        setProducts((prev) => [...prev, ...newProducts]);
        setPage((prev) => prev + 1);
      } else {
        setProducts(newProducts);
        setPage(1);
      }
      setTotalProducts(total);
    } catch (err) {
      setError('Failed to load products. Please try again.');
      console.error('[ShopPage] Product fetch error:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [selectedCategory, debouncedSearch, sortBy, maxPrice, inStockOnly, page]);

  // Re-fetch when filters change (not page)
  useEffect(() => {
    fetchProducts(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, debouncedSearch, sortBy, maxPrice, inStockOnly]);

  const hasMore = products.length < totalProducts;

  const handleClearFilters = () => {
    setSelectedCategory('');
    setSearchTerm('');
    setDebouncedSearch('');
    setMaxPrice(150000);
    setInStockOnly(false);
    setSortBy('featured');
    setSearchParams({});
  };

  const handleAddToCart = (product, e) => {
    e.preventDefault();
    e.stopPropagation();
    const stock = product.stock ?? product.inventory ?? 0;
    if (stock === 0) {
      toast.error('This product is out of stock.');
      return;
    }
    addToCart(product, 1, product.variants?.[0]
      ? { [product.variants[0].name]: product.variants[0].options[0] }
      : null);
    toast.success(`"${product.name}" added to cart!`);
  };

  const getCategoryName = (id) => {
    return categories.find((c) => c.id === id || c.slug === id)?.name || id;
  };

  return (
    <MainLayout>
      <div className="container" style={{ padding: 'var(--space-8) var(--space-4) var(--space-16)' }}>
        {/* Breadcrumbs */}
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span aria-hidden="true">/</span>
          <span className="current">Shop</span>
          {selectedCategory && (
            <>
              <span aria-hidden="true">/</span>
              <span className="current" style={{ textTransform: 'capitalize' }}>
                {getCategoryName(selectedCategory)}
              </span>
            </>
          )}
        </nav>

        {/* Page Title */}
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 800, marginBottom: '0.5rem' }}>
            {selectedCategory ? getCategoryName(selectedCategory) : 'All Products'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
            {loading ? 'Loading products…' : `Showing ${products.length} of ${totalProducts} products across India`}
          </p>
        </div>

        {/* Shop Layout: Sidebar + Product Grid */}
        <div className="shop-layout">
          {/* ── FILTER SIDEBAR ── */}
          <aside className="shop-sidebar" aria-label="Product filters">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 700 }}>Filters</h2>
              <button
                onClick={handleClearFilters}
                style={{ background: 'none', border: 'none', color: 'var(--color-primary-400)', fontSize: 'var(--text-xs)', cursor: 'pointer', fontWeight: 600 }}
              >
                Reset All
              </button>
            </div>

            {/* Search */}
            <div className="filter-group">
              <h3 className="filter-heading">Search</h3>
              <input
                type="search"
                placeholder="Search products…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input"
                style={{ fontSize: 'var(--text-sm)' }}
              />
            </div>

            {/* Category Filter */}
            <div className="filter-group">
              <h3 className="filter-heading">Category</h3>
              <label className="filter-option">
                <input
                  type="radio"
                  name="category"
                  checked={selectedCategory === ''}
                  onChange={() => {
                    setSelectedCategory('');
                    setSearchParams((prev) => { prev.delete('category'); return prev; });
                  }}
                />
                <span>All Categories ({totalProducts})</span>
              </label>
              {categories.map((cat) => (
                <label key={cat.id || cat.slug} className="filter-option">
                  <input
                    type="radio"
                    name="category"
                    checked={selectedCategory === (cat.id || cat.slug)}
                    onChange={() => {
                      const catId = cat.id || cat.slug;
                      setSelectedCategory(catId);
                      setSearchParams((prev) => { prev.set('category', catId); return prev; });
                    }}
                  />
                  <span>{cat.icon} {cat.name}</span>
                </label>
              ))}
            </div>

            {/* Price Filter */}
            <div className="filter-group">
              <h3 className="filter-heading">Max Price: {formatPrice(maxPrice)}</h3>
              <input
                type="range"
                min={0}
                max={150000}
                step={500}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--color-primary-500)' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                <span>₹0</span><span>₹1,50,000</span>
              </div>
            </div>

            {/* In Stock Only */}
            <div className="filter-group">
              <label className="filter-option">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                />
                <span>In Stock Only</span>
              </label>
            </div>
          </aside>

          {/* ── PRODUCT GRID ── */}
          <div>
            {/* Sort bar */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: 'var(--space-4)', alignItems: 'center' }}>
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginRight: '0.5rem' }}>Sort by:</span>
              {[
                { value: 'featured', label: '⭐ Featured' },
                { value: 'price-asc', label: '↑ Price' },
                { value: 'price-desc', label: '↓ Price' },
                { value: 'newest', label: '🆕 Newest' },
                { value: 'rating', label: '🏆 Rating' },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setSortBy(value)}
                  style={{
                    padding: '0.3rem 0.8rem',
                    borderRadius: 'var(--radius-full)',
                    border: `1.5px solid ${sortBy === value ? 'var(--color-primary-500)' : 'var(--border-color)'}`,
                    background: sortBy === value ? 'var(--color-primary-500)' : 'transparent',
                    color: sortBy === value ? '#fff' : 'var(--text-secondary)',
                    fontSize: 'var(--text-xs)',
                    cursor: 'pointer',
                    fontWeight: 600,
                    transition: 'all 0.18s ease',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Error state */}
            {error && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-md)', padding: 'var(--space-4)', marginBottom: 'var(--space-4)', color: '#f87171' }}>
                {error}
                <Button variant="ghost" size="sm" style={{ marginLeft: '1rem' }} onClick={() => fetchProducts(false)}>Retry</Button>
              </div>
            )}

            {/* Product Grid */}
            <div className="product-grid">
              {loading
                ? Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => <SkeletonProductCard key={i} />)
                : products.map((product) => {
                    const pid = product._id || product.id;
                    const slug = product.slug || pid;
                    const price = product.price;
                    const salePrice = product.salePrice || product.compareAtPrice;
                    const hasDiscount = salePrice && salePrice < price;
                    const effectivePrice = hasDiscount ? salePrice : price;
                    const stock = product.stock ?? product.inventory ?? 0;
                    const rating = product.rating?.average ?? product.rating ?? 0;
                    const ratingCount = product.rating?.count ?? product.ratingCount ?? 0;
                    const image = product.images?.[0] || product.image || 'https://via.placeholder.com/400x400?text=No+Image';

                    return (
                      <Link
                        key={pid}
                        to={`/product/${slug}`}
                        style={{ textDecoration: 'none', color: 'inherit' }}
                        aria-label={`View ${product.name}`}
                      >
                        <Card className="product-card" hoverable>
                          <div className="product-card-image-wrapper">
                            <img
                              src={image}
                              alt={product.name}
                              className="product-card-image"
                              loading="lazy"
                              onError={(e) => { e.target.src = 'https://via.placeholder.com/400x400?text=No+Image'; }}
                            />
                            {product.badge && (
                              <Badge variant={product.badgeVariant || 'primary'} className="product-badge">
                                {product.badge}
                              </Badge>
                            )}
                            {stock === 0 && (
                              <div className="out-of-stock-overlay">Out of Stock</div>
                            )}
                          </div>
                          <div className="product-card-body">
                            <p className="product-card-category">{product.categoryLabel || product.category}</p>
                            <h3 className="product-card-title">{product.name}</h3>
                            {rating > 0 && (
                              <div className="product-card-rating">
                                <RatingStars rating={rating} size="sm" />
                                <span>({ratingCount.toLocaleString('en-IN')})</span>
                              </div>
                            )}
                            <div className="product-card-footer">
                              <div className="product-card-price">
                                <span className="price-current">{formatPrice(effectivePrice)}</span>
                                {hasDiscount && (
                                  <>
                                    <span className="price-original">{formatPrice(price)}</span>
                                    <span className="price-discount">{formatDiscount(price, salePrice)}</span>
                                  </>
                                )}
                              </div>
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={(e) => handleAddToCart({ ...product, id: pid, stock }, e)}
                                disabled={stock === 0}
                                aria-label={`Add ${product.name} to cart`}
                              >
                                {stock === 0 ? 'Sold Out' : '+ Cart'}
                              </button>
                            </div>
                          </div>
                        </Card>
                      </Link>
                    );
                  })
              }
            </div>

            {/* Empty state */}
            {!loading && products.length === 0 && !error && (
              <EmptyState
                icon="🔍"
                title="No products found"
                description="Try adjusting your search or filters to find what you are looking for."
                action={<Button onClick={handleClearFilters}>Clear All Filters</Button>}
              />
            )}

            {/* Load More */}
            {!loading && hasMore && (
              <div style={{ textAlign: 'center', marginTop: 'var(--space-8)' }}>
                <Button
                  variant="outline"
                  loading={loadingMore}
                  onClick={() => fetchProducts(true)}
                >
                  {loadingMore ? 'Loading…' : `Load More (${totalProducts - products.length} remaining)`}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ShopPage;
