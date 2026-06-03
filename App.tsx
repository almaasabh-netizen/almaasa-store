/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Storefront from './components/Storefront';
import AdminPanel from './components/AdminPanel';

export default function App() {
  // Sync view state with URL hash: "#admin" or back
  const [view, setView] = useState<'customer' | 'admin'>(() => {
    return window.location.hash === '#admin' ? 'admin' : 'customer';
  });

  // Sub-tabs on storefront: 'shop' | 'tracking'
  const [customerTab, setCustomerTab] = useState<'shop' | 'tracking'>('shop');

  // Monitor hash change events for native back/forward buttons
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#admin') {
        setView('admin');
      } else {
        setView('customer');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateToAdmin = () => {
    window.location.hash = '#admin';
    setView('admin');
  };

  const navigateToCustomer = () => {
    window.location.hash = '';
    setView('customer');
  };

  return (
    <div className="min-h-screen antialiased" style={{ backgroundColor: 'var(--color-cream)', fontFamily: "'Cairo', system-ui, sans-serif" }}>
      <AnimatePresence mode="wait">
        {view === 'customer' ? (
          <motion.div
            key="customer-face"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Storefront 
              onNavigateToAdmin={navigateToAdmin} 
              activeTab={customerTab} 
              setActiveTab={setCustomerTab} 
            />
          </motion.div>
        ) : (
          <motion.div
            key="admin-face"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <AdminPanel 
              onBackToStore={navigateToCustomer} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
