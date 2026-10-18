import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

/**
 * MainLayout — Wraps customer-facing pages.
 * Provides the sticky Navbar, semantic <main id="main-content"> region, and Footer.
 */
const MainLayout = ({ children }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main id="main-content" className="page-main" tabIndex={-1}>
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
