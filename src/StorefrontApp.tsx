import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import Storefront from './components/Storefront';

export default function StorefrontApp() {
  const navigate = useNavigate();
  const [customerTab, setCustomerTab] = useState<'home' | 'shop' | 'product' | 'cart' | 'about' | 'contact' | 'tracking'>('home');

  useEffect(() => {
    if (window.location.hash === '#admin') {
      window.location.hash = '';
      navigate('/admin');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen antialiased" style={{ backgroundColor: 'var(--color-cream)', fontFamily: "'Cairo', system-ui, sans-serif" }}>
      <motion.div key="customer-face" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
        <Storefront
          onNavigateToAdmin={() => navigate('/admin')}
          activeTab={customerTab}
          setActiveTab={setCustomerTab}
        />
      </motion.div>
    </div>
  );
}
