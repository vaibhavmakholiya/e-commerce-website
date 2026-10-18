import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './components/ui/Toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { OrderProvider } from './context/OrderContext';
import './styles/global.css';

// Customer Pages
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import VerifyEmailPage from './pages/VerifyEmailPage';

// Additional Pages
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import FaqPage from './pages/FaqPage';
import ShippingPolicyPage from './pages/ShippingPolicyPage';
import RefundPolicyPage from './pages/RefundPolicyPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsPage from './pages/TermsPage';
import NotFoundPage from './pages/NotFoundPage';
import AdminPage from './pages/AdminPage';

/**
 * App — Root Application Component
 * Wraps all routes in AuthProvider, CartProvider, OrderProvider, and ToastProvider.
 */
const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <CartProvider>
        <OrderProvider>
          <ToastProvider>
            <Routes>
              {/* Core Customer Experience Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/shop" element={<ShopPage />} />
              <Route path="/product/:id" element={<ProductDetailsPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/order-success/:id" element={<OrderSuccessPage />} />
              <Route path="/profile" element={<ProfilePage />} />

              {/* Authentication Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />

              {/* Company & Support Policy Routes */}
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/faq" element={<FaqPage />} />
              <Route path="/shipping-policy" element={<ShippingPolicyPage />} />
              <Route path="/refund-policy" element={<RefundPolicyPage />} />
              <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
              <Route path="/terms" element={<TermsPage />} />

              {/* 404 Fallback Route */}
              <Route path="/admin" element={<AdminPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </ToastProvider>
        </OrderProvider>
      </CartProvider>
    </AuthProvider>
  </BrowserRouter>
);

export default App;
