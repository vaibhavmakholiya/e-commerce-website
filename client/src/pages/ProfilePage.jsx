import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';
import FormField from '../components/ui/FormField';
import Modal, { ConfirmModal } from '../components/ui/Modal';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import { useToast } from '../components/ui/Toast';
import { formatPrice } from '../utils/formatters';
import { validateName, validatePhone, validatePincode, validateRequired } from '../utils/validators';

const ProfilePage = () => {
  const {
    user,
    isAuthenticated,
    logout,
    updateProfile,
    addAddress,
    deleteAddress,
    setDefaultAddress,
    deleteAccount,
    requestPasswordReset,
    loginAsDemo,
  } = useAuth();

  const { orders } = useOrders();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Active Tab: 'profile' | 'orders' | 'addresses' | 'security'
  const [activeTab, setActiveTab] = useState('orders');

  // Edit Profile State
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });

  // Add Address Modal State
  const [addAddressOpen, setAddAddressOpen] = useState(false);
  const [addressForm, setAddressForm] = useState({
    fullName: '',
    phone: '',
    street: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '',
    tag: 'Home',
    isDefault: false,
  });
  const [addressErrors, setAddressErrors] = useState({});

  // View Order Receipt Modal
  const [viewOrder, setViewOrder] = useState(null);

  // Logout & Delete Account Confirmations
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [deleteAccountModalOpen, setDeleteAccountModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // Password Reset State
  const [resetSent, setResetSent] = useState(false);

  // If user is not logged in, show helpful prompt with 1-click Demo Customer button
  if (!isAuthenticated || !user) {
    return (
      <MainLayout>
        <div className="container" style={{ padding: 'var(--space-16) var(--space-4)', textAlign: 'center', maxWidth: '520px' }}>
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>👤</span>
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: '0.75rem' }}>
            Sign In to View Your Account
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-6)' }}>
            Log in to view your order history, manage delivery addresses, and track real-time shipment progress.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Button variant="primary" onClick={loginAsDemo}>
              ⚡ Continue as Demo Customer (1-Click)
            </Button>
            <Link to="/login" className="btn btn-secondary">
              Sign In with Email
            </Link>
            <Link to="/register" className="btn btn-ghost">
              Create New Account
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Handle Edit Profile submission
  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!profileForm.name.trim()) {
      toast.error('Full Name cannot be empty.');
      return;
    }
    updateProfile({
      name: profileForm.name.trim(),
      phone: profileForm.phone.trim(),
    });
    setEditProfileOpen(false);
    toast.success('Profile details updated successfully!');
  };

  // Handle Add Address submission
  const handleSaveAddress = (e) => {
    e.preventDefault();
    const errs = {};
    const nameRes = validateName(addressForm.fullName);
    const phoneRes = validatePhone(addressForm.phone);
    const streetRes = validateRequired(addressForm.street, 'Street');
    const pinRes = validatePincode(addressForm.pincode);

    if (!nameRes.isValid) errs.fullName = nameRes.message;
    if (!phoneRes.isValid) errs.phone = phoneRes.message;
    if (!streetRes.isValid) errs.street = streetRes.message;
    if (!pinRes.isValid) errs.pincode = pinRes.message;

    if (Object.keys(errs).length > 0) {
      setAddressErrors(errs);
      return;
    }

    addAddress(addressForm);
    setAddAddressOpen(false);
    setAddressForm({
      fullName: '',
      phone: '',
      street: '',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '',
      tag: 'Home',
      isDefault: false,
    });
    setAddressErrors({});
    toast.success('New delivery address added!');
  };

  // Handle Password Reset Request
  const handlePasswordReset = async () => {
    await requestPasswordReset(user.email);
    setResetSent(true);
    toast.success(`Password reset link dispatched to ${user.email}`);
  };

  // Handle Delete Account with safety check
  const handleDeleteAccount = () => {
    if (deleteConfirmText.trim() !== 'DELETE') {
      toast.error('Please type "DELETE" to confirm account deletion.');
      return;
    }
    deleteAccount();
    setDeleteAccountModalOpen(false);
    toast.info('Your NovaCart account and all personal data have been completely deleted.');
    navigate('/');
  };

  return (
    <MainLayout>
      <div className="container" style={{ padding: 'var(--space-8) var(--space-4) var(--space-16)' }}>
        {/* Breadcrumbs */}
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span aria-hidden="true">/</span>
          <span className="current">My Account</span>
        </nav>

        {/* Profile Header Card */}
        <Card style={{ marginBottom: 'var(--space-8)', padding: 'var(--space-6)' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 'var(--space-4)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
              <span
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: 'var(--radius-full)',
                  background: 'linear-gradient(135deg, var(--color-primary-600), var(--color-primary-800))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                }}
              >
                {user.avatar || '👤'}
              </span>

              <div>
                <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, margin: 0 }}>
                  {user.name}
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginTop: '0.2rem' }}>
                  {user.email} • {user.phone || 'Phone not added'}
                </p>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem' }}>
                  <Badge variant="info">Customer Account</Badge>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-dim)' }}>
                    Member since {user.memberSince || '2026'}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setProfileForm({ name: user.name, phone: user.phone || '' });
                  setEditProfileOpen(true);
                }}
              >
                Edit Profile ✎
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLogoutConfirmOpen(true)}
              >
                Sign Out 🚪
              </Button>
            </div>
          </div>
        </Card>

        {/* Profile Tabs Navigation */}
        <div className="profile-tabs" role="tablist">
          <button
            role="tab"
            aria-selected={activeTab === 'orders'}
            className={`profile-tab ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            📦 Order History ({orders.length})
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'addresses'}
            className={`profile-tab ${activeTab === 'addresses' ? 'active' : ''}`}
            onClick={() => setActiveTab('addresses')}
          >
            📍 Saved Addresses ({user.addresses?.length || 0})
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'security'}
            className={`profile-tab ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            🛡️ Security & Account
          </button>
        </div>

        {/* ── TAB 1: ORDER HISTORY ────────────────────────────── */}
        {activeTab === 'orders' && (
          <div>
            {orders.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', padding: '2rem 0' }}>
                You have not placed any orders yet. <Link to="/shop" style={{ color: 'var(--color-primary-400)' }}>Start shopping →</Link>
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                {orders.map((order) => (
                  <Card key={order.id} style={{ padding: 'var(--space-6)' }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderBottom: '1px solid var(--border-subtle)',
                        paddingBottom: 'var(--space-4)',
                        marginBottom: 'var(--space-4)',
                        flexWrap: 'wrap',
                        gap: '0.75rem',
                      }}
                    >
                      <div>
                        <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--text-main)' }}>
                          {order.orderNumber}
                        </strong>
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginLeft: '0.75rem' }}>
                          Placed on {new Date(order.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Badge
                          variant={
                            order.status === 'Delivered'
                              ? 'success'
                              : order.status === 'Shipped'
                              ? 'info'
                              : 'warning'
                          }
                        >
                          {order.status}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setViewOrder(order)}
                        >
                          View Details 👁️
                        </Button>
                      </div>
                    </div>

                    {/* Order items row */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                      {order.items?.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                          <img
                            src={item.image}
                            alt=""
                            style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                          />
                          <div style={{ flex: 1 }}>
                            <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, margin: 0 }}>
                              {item.name}
                            </h3>
                            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                              Qty: {item.quantity} • {formatPrice(item.price)} each
                            </p>
                          </div>
                          <span style={{ fontWeight: 700, fontSize: 'var(--text-sm)' }}>
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderTop: '1px solid var(--border-subtle)',
                        paddingTop: 'var(--space-4)',
                        marginTop: 'var(--space-4)',
                        fontSize: 'var(--text-sm)',
                      }}
                    >
                      <span style={{ color: 'var(--text-muted)' }}>
                        Delivery: {order.estimatedDelivery}
                      </span>
                      <div>
                        <span style={{ color: 'var(--text-muted)', marginRight: '0.5rem' }}>Total:</span>
                        <strong style={{ fontSize: 'var(--text-base)', color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
                          {formatPrice(order.grandTotal)}
                        </strong>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 2: SAVED ADDRESSES ──────────────────────────── */}
        {activeTab === 'addresses' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
                Manage your saved home, office, and family delivery locations.
              </p>
              <Button variant="primary" size="sm" onClick={() => setAddAddressOpen(true)}>
                + Add New Address
              </Button>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: 'var(--space-6)',
              }}
            >
              {user.addresses?.map((addr) => (
                <Card key={addr.id} style={{ display: 'flex', flexDirection: 'column', padding: 'var(--space-6)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                      <strong style={{ fontSize: 'var(--text-base)' }}>{addr.fullName}</strong>
                      <Badge variant="default">{addr.tag || 'Home'}</Badge>
                    </div>
                    {addr.isDefault && <Badge variant="info">Default</Badge>}
                  </div>

                  <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', lineHeight: 1.5, flex: 1, margin: '0.5rem 0' }}>
                    {addr.street}<br />
                    {addr.city}, {addr.state} — {addr.pincode}
                  </p>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-dim)', marginBottom: 'var(--space-4)' }}>
                    Phone: {addr.phone}
                  </p>

                  <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-3)' }}>
                    {!addr.isDefault && (
                      <button
                        onClick={() => {
                          setDefaultAddress(addr.id);
                          toast.success('Default address updated.');
                        }}
                        style={{ background: 'none', border: 'none', color: 'var(--color-primary-400)', fontSize: 'var(--text-xs)', cursor: 'pointer', fontWeight: 600 }}
                      >
                        Set as Default
                      </button>
                    )}
                    <button
                      onClick={() => {
                        deleteAddress(addr.id);
                        toast.info('Address removed.');
                      }}
                      style={{ background: 'none', border: 'none', color: 'var(--color-rose-400)', fontSize: 'var(--text-xs)', cursor: 'pointer', marginLeft: 'auto' }}
                    >
                      Delete 🗑️
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB 3: SECURITY & ACCOUNT DELETION ──────────────── */}
        {activeTab === 'security' && (
          <div style={{ maxWidth: '640px' }}>
            {/* Password Reset Card */}
            <Card style={{ marginBottom: 'var(--space-8)', padding: 'var(--space-6)' }}>
              <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: '0.5rem' }}>
                Password Recovery & Reset
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>
                We use secure tokenized password recovery via your registered email ({user.email}).
              </p>

              {resetSent ? (
                <div style={{ padding: '0.75rem', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid var(--color-emerald-500)', borderRadius: 'var(--radius-md)', color: 'var(--color-emerald-300)', fontSize: 'var(--text-sm)' }}>
                  ✓ A password reset link has been dispatched to <strong>{user.email}</strong>. Please check your inbox and spam folder.
                </div>
              ) : (
                <Button variant="secondary" onClick={handlePasswordReset}>
                  Send Password Reset Link ✉️
                </Button>
              )}
            </Card>

            {/* Account Deletion Safeguard */}
            <Card style={{ borderColor: 'rgba(239, 68, 68, 0.3)', padding: 'var(--space-6)' }}>
              <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-rose-400)', marginBottom: '0.5rem' }}>
                Danger Zone: Delete Account
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)', lineHeight: 1.6 }}>
                Once you delete your account, your profile, saved addresses, and active sessions will be permanently purged in accordance with our data retention policy.
              </p>
              <Button
                variant="danger"
                size="sm"
                onClick={() => setDeleteAccountModalOpen(true)}
              >
                Delete My Account
              </Button>
            </Card>
          </div>
        )}

        {/* ── MODALS ────────────────────────────────────────── */}

        {/* Edit Profile Modal */}
        <Modal
          isOpen={editProfileOpen}
          onClose={() => setEditProfileOpen(false)}
          title="Edit Profile Information"
        >
          <form onSubmit={handleSaveProfile}>
            <FormField
              label="Full Name"
              value={profileForm.name}
              onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))}
              required
            />
            <FormField
              label="Phone Number"
              value={profileForm.phone}
              onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))}
              placeholder="10-digit mobile number"
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: 'var(--space-4)' }}>
              <Button variant="ghost" type="button" onClick={() => setEditProfileOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>

        {/* Add Address Modal */}
        <Modal
          isOpen={addAddressOpen}
          onClose={() => setAddAddressOpen(false)}
          title="Add New Delivery Address"
          size="md"
        >
          <form onSubmit={handleSaveAddress}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
              <FormField
                label="Full Name"
                value={addressForm.fullName}
                onChange={(e) => setAddressForm((a) => ({ ...a, fullName: e.target.value }))}
                error={addressErrors.fullName}
                required
              />
              <FormField
                label="Mobile Phone"
                value={addressForm.phone}
                onChange={(e) => setAddressForm((a) => ({ ...a, phone: e.target.value }))}
                error={addressErrors.phone}
                required
              />
            </div>
            <FormField
              label="Street Address / Flat / Building"
              value={addressForm.street}
              onChange={(e) => setAddressForm((a) => ({ ...a, street: e.target.value }))}
              error={addressErrors.street}
              required
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-3)' }}>
              <FormField
                label="City"
                value={addressForm.city}
                onChange={(e) => setAddressForm((a) => ({ ...a, city: e.target.value }))}
                required
              />
              <FormField
                label="State"
                value={addressForm.state}
                onChange={(e) => setAddressForm((a) => ({ ...a, state: e.target.value }))}
                required
              />
              <FormField
                label="PIN Code"
                value={addressForm.pincode}
                onChange={(e) => setAddressForm((a) => ({ ...a, pincode: e.target.value }))}
                error={addressErrors.pincode}
                required
              />
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: 'var(--space-2)' }}>
              <label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Address Label:</label>
              {['Home', 'Work', 'Other'].map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`btn btn-sm ${addressForm.tag === t ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setAddressForm((a) => ({ ...a, tag: t }))}
                >
                  {t}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: 'var(--space-6)' }}>
              <Button variant="ghost" type="button" onClick={() => setAddAddressOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Save Address
              </Button>
            </div>
          </form>
        </Modal>

        {/* View Order Details Modal */}
        {viewOrder && (
          <Modal
            isOpen={!!viewOrder}
            onClose={() => setViewOrder(null)}
            title={`Order Details: ${viewOrder.orderNumber}`}
            size="lg"
            footer={
              <Button variant="primary" onClick={() => setViewOrder(null)}>
                Close
              </Button>
            }
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Date Placed</p>
                  <p style={{ fontWeight: 600 }}>{new Date(viewOrder.date).toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Payment</p>
                  <p style={{ fontWeight: 600 }}>{viewOrder.paymentMethod} ({viewOrder.paymentStatus})</p>
                </div>
                <div>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Status</p>
                  <Badge variant="success">{viewOrder.status}</Badge>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem', marginBottom: '1rem' }}>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Delivery Address
                </p>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-main)', marginTop: '0.2rem' }}>
                  {viewOrder.shippingAddress?.fullName} ({viewOrder.shippingAddress?.phone})<br />
                  {viewOrder.shippingAddress?.street}, {viewOrder.shippingAddress?.city}, {viewOrder.shippingAddress?.state} — {viewOrder.shippingAddress?.pincode}
                </p>
              </div>

              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  Items
                </p>
                {viewOrder.items?.map((it, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', fontSize: 'var(--text-sm)' }}>
                    <span>{it.quantity} × {it.name}</span>
                    <strong>{formatPrice(it.price * it.quantity)}</strong>
                  </div>
                ))}
                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem', marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-base)', fontWeight: 700 }}>
                  <span>Grand Total</span>
                  <span style={{ color: 'var(--color-primary-400)' }}>{formatPrice(viewOrder.grandTotal)}</span>
                </div>
              </div>
            </div>
          </Modal>
        )}

        {/* Logout Confirmation Modal */}
        <ConfirmModal
          isOpen={logoutConfirmOpen}
          onClose={() => setLogoutConfirmOpen(false)}
          onConfirm={() => {
            logout();
            setLogoutConfirmOpen(false);
            toast.info('Signed out successfully.');
            navigate('/');
          }}
          title="Sign Out of NovaCart?"
          message="Are you sure you want to sign out of your account on this device?"
          confirmLabel="Sign Out"
          confirmVariant="danger"
        />

        {/* Account Deletion Modal Safeguard */}
        <Modal
          isOpen={deleteAccountModalOpen}
          onClose={() => setDeleteAccountModalOpen(false)}
          title="Delete NovaCart Account"
          size="sm"
        >
          <div>
            <p style={{ color: 'var(--color-rose-300)', fontSize: 'var(--text-sm)', marginBottom: '1rem', lineHeight: 1.5 }}>
              ⚠ Warning: This action is permanent and irreversible. All your profile information, order references, and saved addresses will be deleted.
            </p>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              To confirm, please type <strong>DELETE</strong> in the field below:
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              className="form-control"
              placeholder="DELETE"
              style={{ marginBottom: '1rem' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <Button variant="ghost" onClick={() => setDeleteAccountModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                disabled={deleteConfirmText.trim() !== 'DELETE'}
                onClick={handleDeleteAccount}
              >
                Permanently Delete
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </MainLayout>
  );
};

export default ProfilePage;
