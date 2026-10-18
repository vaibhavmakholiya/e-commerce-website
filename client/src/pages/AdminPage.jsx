import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import FormField from '../components/ui/FormField';
import { useToast } from '../components/ui/Toast';
import { useAuth } from '../context/AuthContext';
import { adminService } from '../services/adminService';
import { productService } from '../services/productService';
import { formatPrice } from '../utils/formatters';

const TABS = [
  { id: 'products', label: '📦 Products', icon: '📦' },
  { id: 'orders', label: '📋 Orders', icon: '📋' },
  { id: 'users', label: '👥 Users', icon: '👥' },
];

const STATUS_COLORS = {
  pending: 'warning',
  processing: 'info',
  shipped: 'primary',
  delivered: 'success',
  cancelled: 'danger',
};

const INITIAL_PRODUCT_FORM = {
  name: '',
  sku: '',
  category: 'electronics',
  brand: '',
  price: '',
  salePrice: '',
  inventory: '',
  description: '',
  shortDescription: '',
  images: '',
  featured: false,
  trending: false,
  badge: '',
};

const AdminPage = () => {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Product modal
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState(INITIAL_PRODUCT_FORM);
  const [formSaving, setFormSaving] = useState(false);

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  // Guard: not authenticated or not admin
  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate('/');
      toast.error('Access denied. Administrators only.');
    }
  }, [authLoading, user, isAdmin, navigate, toast]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await productService.getProducts({ limit: 100 });
      const data = res?.data || res;
      const prods = Array.isArray(data) ? data : (data?.products || []);
      setProducts(prods);
    } catch (err) {
      setError('Failed to load products: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.getOrders({ limit: 50 });
      const data = res?.data || res;
      setOrders(Array.isArray(data) ? data : (data?.orders || []));
    } catch (err) {
      setError('Failed to load orders: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.getUsers();
      const data = res?.data || res;
      setUsers(Array.isArray(data) ? data : (data?.users || []));
    } catch (err) {
      setError('Failed to load users: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user || !isAdmin) return;
    if (activeTab === 'products') fetchProducts();
    else if (activeTab === 'orders') fetchOrders();
    else if (activeTab === 'users') fetchUsers();
  }, [activeTab, user, isAdmin, fetchProducts, fetchOrders, fetchUsers]);

  const openNewProduct = () => {
    setEditingProduct(null);
    setProductForm(INITIAL_PRODUCT_FORM);
    setProductModalOpen(true);
  };

  const openEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name || '',
      sku: product.sku || '',
      category: product.category || 'electronics',
      brand: product.brand || '',
      price: product.price || '',
      salePrice: product.salePrice || '',
      inventory: product.stock ?? product.inventory ?? '',
      description: product.description || '',
      shortDescription: product.shortDescription || '',
      images: (product.images || []).join('\n'),
      featured: product.isFeatured || product.featured || false,
      trending: product.isTrending || product.trending || false,
      badge: product.badge || '',
    });
    setProductModalOpen(true);
  };

  const handleFormChange = (field, value) => {
    setProductForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!productForm.name.trim()) { toast.error('Product name is required.'); return; }
    if (!productForm.price || isNaN(productForm.price)) { toast.error('Valid price is required.'); return; }
    if (!productForm.inventory || isNaN(productForm.inventory)) { toast.error('Valid inventory quantity is required.'); return; }

    setFormSaving(true);
    try {
      const payload = {
        name: productForm.name.trim(),
        sku: productForm.sku.trim() || undefined,
        category: productForm.category,
        brand: productForm.brand.trim() || undefined,
        price: Number(productForm.price),
        salePrice: productForm.salePrice ? Number(productForm.salePrice) : undefined,
        stock: Number(productForm.inventory),
        description: productForm.description.trim(),
        shortDescription: productForm.shortDescription.trim() || undefined,
        images: productForm.images.trim()
          ? productForm.images.split('\n').map((s) => s.trim()).filter(Boolean)
          : [],
        isFeatured: productForm.featured,
        isTrending: productForm.trending,
        badge: productForm.badge.trim() || undefined,
        isActive: true,
      };

      let res;
      if (editingProduct) {
        const pid = editingProduct._id || editingProduct.id;
        res = await adminService.updateProduct(pid, payload);
        toast.success(`"${productForm.name}" updated successfully!`);
      } else {
        res = await adminService.createProduct(payload);
        toast.success(`"${productForm.name}" added to catalog! It will appear in the shop immediately.`);
      }

      setProductModalOpen(false);
      fetchProducts();
    } catch (err) {
      toast.error('Failed to save product: ' + (err.message || 'Unknown error'));
    } finally {
      setFormSaving(false);
    }
  };

  const handleDeleteProduct = (product) => {
    setDeleteTarget(product);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      const pid = deleteTarget._id || deleteTarget.id;
      await adminService.deleteProduct(pid);
      toast.success(`"${deleteTarget.name}" has been removed from the catalog.`);
      setDeleteConfirmOpen(false);
      setDeleteTarget(null);
      fetchProducts();
    } catch (err) {
      toast.error('Failed to delete product: ' + err.message);
    }
  };

  const handleOrderStatusChange = async (orderId, newStatus) => {
    try {
      await adminService.updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId || o.id === orderId) ? { ...o, status: newStatus } : o)
      );
      toast.success(`Order status updated to "${newStatus}".`);
    } catch (err) {
      toast.error('Failed to update order status: ' + err.message);
    }
  };

  if (authLoading) {
    return (
      <MainLayout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem', animation: 'spin 1s linear infinite' }}>⚙️</div>
            <p style={{ color: 'var(--text-muted)' }}>Verifying admin credentials…</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!user || !isAdmin) return null;

  return (
    <MainLayout>
      <div className="container" style={{ padding: 'var(--space-8) var(--space-4) var(--space-16)' }}>
        {/* Header */}
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
            <span style={{ fontSize: '2rem' }}>🛡️</span>
            <div>
              <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 800, lineHeight: 1.2 }}>
                Admin Dashboard
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
                Welcome back, <strong>{user.name}</strong>. Manage your NovaCart catalog, orders, and users.
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-4)', marginTop: 'var(--space-6)' }}>
            {[
              { label: 'Total Products', value: products.length, icon: '📦', color: 'var(--color-primary-500)' },
              { label: 'Orders', value: orders.length, icon: '📋', color: 'var(--color-success-500)' },
              { label: 'Users', value: users.length, icon: '👥', color: 'var(--color-amber-500)' },
            ].map(({ label, value, icon, color }) => (
              <Card key={label} style={{ padding: 'var(--space-4)', background: `linear-gradient(135deg, ${color}15 0%, transparent 100%)` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <span style={{ fontSize: '1.8rem' }}>{icon}</span>
                  <div>
                    <p style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color }}>{value}</p>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{label}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-6)', borderBottom: '1px solid var(--border-color)', paddingBottom: 'var(--space-2)' }}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '0.5rem 1.2rem',
                borderRadius: 'var(--radius-full)',
                border: 'none',
                background: activeTab === tab.id ? 'var(--color-primary-500)' : 'transparent',
                color: activeTab === tab.id ? '#fff' : 'var(--text-secondary)',
                fontWeight: activeTab === tab.id ? 700 : 500,
                cursor: 'pointer',
                fontSize: 'var(--text-sm)',
                transition: 'all 0.2s ease',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Error message */}
        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-md)', padding: 'var(--space-4)', marginBottom: 'var(--space-4)', color: '#f87171' }}>
            {error}
          </div>
        )}

        {/* ── PRODUCTS TAB ── */}
        {activeTab === 'products' && (
          <section aria-label="Product management">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700 }}>Product Catalog</h2>
              <Button variant="primary" onClick={openNewProduct}>
                + Add New Product
              </Button>
            </div>

            {loading ? (
              <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} style={{ height: 64, background: 'var(--surface-hover)', borderRadius: 'var(--radius-md)', animation: 'pulse 1.5s ease-in-out infinite' }} />
                ))}
              </div>
            ) : products.length === 0 ? (
              <Card style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
                <p style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>📦</p>
                <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-2)' }}>No Products Yet</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }}>
                  Add your first product to get started. It will appear in the storefront immediately.
                </p>
                <Button variant="primary" onClick={openNewProduct}>Add First Product</Button>
              </Card>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                      {['Image', 'Name', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map((h) => (
                        <th key={h} style={{ textAlign: 'left', padding: 'var(--space-3) var(--space-4)', fontWeight: 700, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product, idx) => {
                      const pid = product._id || product.id;
                      const img = product.images?.[0] || product.image;
                      const stock = product.stock ?? product.inventory ?? 0;
                      return (
                        <tr key={pid || idx} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.15s' }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-hover)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                            <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', overflow: 'hidden', background: 'var(--surface-elevated)' }}>
                              {img
                                ? <img src={img} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                : <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '1.5rem' }}>📦</span>
                              }
                            </div>
                          </td>
                          <td style={{ padding: 'var(--space-3) var(--space-4)', maxWidth: 220 }}>
                            <p style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</p>
                            {product.sku && <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>SKU: {product.sku}</p>}
                          </td>
                          <td style={{ padding: 'var(--space-3) var(--space-4)', textTransform: 'capitalize' }}>{product.category}</td>
                          <td style={{ padding: 'var(--space-3) var(--space-4)', whiteSpace: 'nowrap' }}>
                            <div>
                              <span style={{ fontWeight: 700 }}>{formatPrice(product.salePrice || product.price)}</span>
                              {product.salePrice && product.salePrice < product.price && (
                                <span style={{ marginLeft: '0.5rem', textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>{formatPrice(product.price)}</span>
                              )}
                            </div>
                          </td>
                          <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                            <Badge variant={stock > 5 ? 'success' : stock > 0 ? 'warning' : 'danger'}>
                              {stock === 0 ? 'Out of Stock' : `${stock} units`}
                            </Badge>
                          </td>
                          <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                            <Badge variant={product.isActive !== false ? 'success' : 'default'}>
                              {product.isActive !== false ? 'Active' : 'Inactive'}
                            </Badge>
                          </td>
                          <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                              <button
                                onClick={() => openEditProduct(product)}
                                style={{ padding: '0.3rem 0.7rem', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border-color)', background: 'transparent', cursor: 'pointer', fontSize: 'var(--text-xs)', color: 'var(--text-primary)' }}
                              >
                                ✏️ Edit
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(product)}
                                style={{ padding: '0.3rem 0.7rem', borderRadius: 'var(--radius-md)', border: '1.5px solid rgba(239,68,68,0.4)', background: 'rgba(239,68,68,0.1)', cursor: 'pointer', fontSize: 'var(--text-xs)', color: '#f87171' }}
                              >
                                🗑 Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* ── ORDERS TAB ── */}
        {activeTab === 'orders' && (
          <section aria-label="Order management">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700 }}>All Orders</h2>
              <Button variant="outline" onClick={fetchOrders} size="sm">🔄 Refresh</Button>
            </div>

            {loading ? (
              <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} style={{ height: 80, background: 'var(--surface-hover)', borderRadius: 'var(--radius-md)', animation: 'pulse 1.5s ease-in-out infinite' }} />
                ))}
              </div>
            ) : orders.length === 0 ? (
              <Card style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
                <p style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>📋</p>
                <h3 style={{ fontWeight: 700 }}>No Orders Yet</h3>
                <p style={{ color: 'var(--text-muted)' }}>Orders will appear here once customers start purchasing.</p>
              </Card>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {orders.map((order) => {
                  const oid = order._id || order.id;
                  const statusKey = (order.status || '').toLowerCase();
                  return (
                    <Card key={oid}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 'var(--space-4)', alignItems: 'center' }}>
                        <div>
                          <p style={{ fontWeight: 700, fontSize: 'var(--text-sm)' }}>#{order.orderNumber || oid?.slice(-8)}</p>
                          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>
                            {new Date(order.createdAt || order.date || Date.now()).toLocaleDateString('en-IN')}
                          </p>
                        </div>
                        <div>
                          <p style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>
                            {order.user?.name || order.shippingAddress?.fullName || 'Customer'}
                          </p>
                          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>
                            {order.items?.length || 0} item(s) · {formatPrice(order.grandTotal || order.total || 0)}
                          </p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                          <Badge variant={STATUS_COLORS[statusKey] || 'default'}>
                            {order.status || 'Unknown'}
                          </Badge>
                          <select
                            value={order.status || ''}
                            onChange={(e) => handleOrderStatusChange(oid, e.target.value)}
                            style={{
                              padding: '0.3rem 0.6rem',
                              borderRadius: 'var(--radius-md)',
                              border: '1.5px solid var(--border-color)',
                              background: 'var(--surface-elevated)',
                              color: 'var(--text-primary)',
                              fontSize: 'var(--text-xs)',
                              cursor: 'pointer',
                            }}
                            aria-label={`Update status for order ${order.orderNumber}`}
                          >
                            {['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* ── USERS TAB ── */}
        {activeTab === 'users' && (
          <section aria-label="User management">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700 }}>Registered Users</h2>
              <Button variant="outline" onClick={fetchUsers} size="sm">🔄 Refresh</Button>
            </div>

            {loading ? (
              <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} style={{ height: 64, background: 'var(--surface-hover)', borderRadius: 'var(--radius-md)', animation: 'pulse 1.5s ease-in-out infinite' }} />
                ))}
              </div>
            ) : users.length === 0 ? (
              <Card style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
                <p style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>👥</p>
                <h3 style={{ fontWeight: 700 }}>No Users Found</h3>
                <p style={{ color: 'var(--text-muted)' }}>Registered users will appear here.</p>
              </Card>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                      {['Name', 'Email', 'Role', 'Joined', 'Orders'].map((h) => (
                        <th key={h} style={{ textAlign: 'left', padding: 'var(--space-3) var(--space-4)', fontWeight: 700, color: 'var(--text-muted)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u, idx) => {
                      const uid = u._id || u.id;
                      return (
                        <tr key={uid || idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: 'var(--space-3) var(--space-4)', fontWeight: 600 }}>
                            {u.name || u.email?.split('@')[0] || 'Unknown'}
                          </td>
                          <td style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--text-muted)' }}>{u.email}</td>
                          <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                            <Badge variant={u.role === 'admin' ? 'warning' : 'default'}>
                              {u.role || 'customer'}
                            </Badge>
                          </td>
                          <td style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--text-muted)' }}>
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN') : '—'}
                          </td>
                          <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                            {u.ordersCount ?? '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </div>

      {/* ── Product Create/Edit Modal ── */}
      <Modal
        isOpen={productModalOpen}
        onClose={() => setProductModalOpen(false)}
        title={editingProduct ? `Edit: ${editingProduct.name}` : 'Add New Product'}
        size="lg"
      >
        <form onSubmit={handleSaveProduct} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', maxHeight: '72vh', overflowY: 'auto', paddingRight: '0.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <FormField label="Product Name" required style={{ gridColumn: '1 / -1' }}>
              <input className="form-input" value={productForm.name} onChange={(e) => handleFormChange('name', e.target.value)} placeholder="e.g. Sony WH-1000XM5 Headphones" required />
            </FormField>

            <FormField label="SKU">
              <input className="form-input" value={productForm.sku} onChange={(e) => handleFormChange('sku', e.target.value)} placeholder="e.g. SONY-WH1000XM5-BLK" />
            </FormField>

            <FormField label="Category" required>
              <select className="form-input" value={productForm.category} onChange={(e) => handleFormChange('category', e.target.value)}>
                <option value="electronics">Electronics</option>
                <option value="fashion">Fashion</option>
                <option value="home-living">Home & Living</option>
                <option value="accessories">Accessories</option>
              </select>
            </FormField>

            <FormField label="Brand">
              <input className="form-input" value={productForm.brand} onChange={(e) => handleFormChange('brand', e.target.value)} placeholder="e.g. Sony" />
            </FormField>

            <FormField label="Price (₹)" required>
              <input className="form-input" type="number" min="0" step="0.01" value={productForm.price} onChange={(e) => handleFormChange('price', e.target.value)} placeholder="e.g. 34990" required />
            </FormField>

            <FormField label="Sale Price (₹) — optional">
              <input className="form-input" type="number" min="0" step="0.01" value={productForm.salePrice} onChange={(e) => handleFormChange('salePrice', e.target.value)} placeholder="Leave blank for no sale" />
            </FormField>

            <FormField label="Inventory (units)" required>
              <input className="form-input" type="number" min="0" value={productForm.inventory} onChange={(e) => handleFormChange('inventory', e.target.value)} placeholder="e.g. 100" required />
            </FormField>

            <FormField label="Badge Text">
              <input className="form-input" value={productForm.badge} onChange={(e) => handleFormChange('badge', e.target.value)} placeholder="e.g. Best Seller, New Arrival" />
            </FormField>
          </div>

          <FormField label="Short Description">
            <input className="form-input" value={productForm.shortDescription} onChange={(e) => handleFormChange('shortDescription', e.target.value)} placeholder="One-line summary for product cards" />
          </FormField>

          <FormField label="Full Description">
            <textarea className="form-input" rows={4} value={productForm.description} onChange={(e) => handleFormChange('description', e.target.value)} placeholder="Detailed product description…" />
          </FormField>

          <FormField label="Image URLs (one per line)">
            <textarea className="form-input" rows={3} value={productForm.images} onChange={(e) => handleFormChange('images', e.target.value)} placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg" />
          </FormField>

          <div style={{ display: 'flex', gap: 'var(--space-6)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: 'var(--text-sm)', fontWeight: 600 }}>
              <input type="checkbox" checked={productForm.featured} onChange={(e) => handleFormChange('featured', e.target.checked)} />
              ⭐ Featured on Homepage
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: 'var(--text-sm)', fontWeight: 600 }}>
              <input type="checkbox" checked={productForm.trending} onChange={(e) => handleFormChange('trending', e.target.checked)} />
              🔥 Show in Trending
            </label>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--border-color)' }}>
            <Button type="button" variant="ghost" onClick={() => setProductModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" loading={formSaving}>
              {formSaving ? 'Saving…' : editingProduct ? 'Save Changes' : 'Add Product to Catalog'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Delete Confirmation Modal ── */}
      <Modal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Delete Product"
      >
        <p style={{ marginBottom: 'var(--space-4)', color: 'var(--text-secondary)' }}>
          Are you sure you want to permanently delete <strong>"{deleteTarget?.name}"</strong>?
          This action cannot be undone and will remove the product from the storefront.
        </p>
        <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
          <Button variant="ghost" onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button variant="danger" onClick={confirmDelete}>Yes, Delete Product</Button>
        </div>
      </Modal>
    </MainLayout>
  );
};

export default AdminPage;
