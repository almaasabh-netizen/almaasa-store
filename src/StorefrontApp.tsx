import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Storefront from './components/Storefront';
import AdminPanel from './components/AdminPanel';

export default function StorefrontApp() {
  const [view, setView] = useState<'customer' | 'admin'>(() => {
    return window.location.hash === '#admin' ? 'admin' : 'customer';
  });
  const [customerTab, setCustomerTab] = useState<'home' | 'shop' | 'product' | 'cart' | 'about' | 'contact' | 'tracking'>('home');

  useEffect(() => {
    const handleHashChange = () => {
      setView(window.location.hash === '#admin' ? 'admin' : 'customer');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <div className="min-h-screen antialiased" style={{ backgroundColor: 'var(--color-cream)', fontFamily: "'Cairo', system-ui, sans-serif" }}>
      <AnimatePresence mode="wait">
        {view === 'customer' ? (
          <motion.div key="customer-face" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <Storefront
              onNavigateToAdmin={() => { window.location.hash = '#admin'; setView('admin'); }}
              activeTab={customerTab}
              setActiveTab={setCustomerTab}
            />
          </motion.div>
        ) : (
          <motion.div key="admin-face" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <AdminPanel
              onBackToStore={() => { window.location.hash = ''; setView('customer'); }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
