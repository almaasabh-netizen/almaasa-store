import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { X } from 'lucide-react';

const titles: Record<string, string> = {
  '/admin': 'لوحة التحكم',
  '/admin/orders': 'الطلبات',
  '/admin/products': 'المنتجات',
  '/admin/categories': 'التصنيفات',
  '/admin/customers': 'العملاء',
  '/admin/inventory': 'المخزون',
  '/admin/marketing': 'التسويق',
  '/admin/coupons': 'الكوبونات',
  '/admin/reviews': 'التقييمات',
  '/admin/reports': 'التقارير',
  '/admin/settings': 'الإعدادات',
  '/admin/users': 'المستخدمون',
  '/admin/support': 'الدعم',
  '/admin/hero-banners': 'Hero Banners',
};

export default function AdminLayout() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const title = Object.entries(titles).find(([k]) => location.pathname === k || (k !== '/admin' && location.pathname.startsWith(k)))?.[1] ?? 'الإدارة';

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#FFF8F8', direction: 'rtl', fontFamily: 'Tajawal, sans-serif' }}>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="relative z-10">
            <Sidebar collapsed={false} onToggle={() => setMobileOpen(false)} />
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 left-4 p-1 rounded-lg bg-white shadow-md"
            >
              <X className="w-4 h-4" style={{ color: '#5A4047' }} />
            </button>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Header
          darkMode={darkMode}
          onToggleDark={() => setDarkMode(!darkMode)}
          onMenuOpen={() => setMobileOpen(true)}
          title={title}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6" style={{ background: '#FFF8F8' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
