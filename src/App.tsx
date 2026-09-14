/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminLayout from './admin/layout/AdminLayout';
import StorefrontApp from './StorefrontApp';

const Dashboard   = lazy(() => import('./admin/pages/Dashboard'));
const Orders      = lazy(() => import('./admin/pages/Orders'));
const OrderDetails= lazy(() => import('./admin/pages/OrderDetails'));
const HeroBanners = lazy(() => import('./admin/pages/HeroBanners'));
const Products    = lazy(() => import('./admin/pages/Products'));
const ProductForm = lazy(() => import('./admin/pages/ProductForm'));
const Categories  = lazy(() => import('./admin/pages/Categories'));
const Customers   = lazy(() => import('./admin/pages/Customers'));
const Inventory   = lazy(() => import('./admin/pages/Inventory'));
const Marketing   = lazy(() => import('./admin/pages/Marketing'));
const Coupons     = lazy(() => import('./admin/pages/Coupons'));
const Reviews     = lazy(() => import('./admin/pages/Reviews'));
const Reports     = lazy(() => import('./admin/pages/Reports'));
const Settings    = lazy(() => import('./admin/pages/Settings'));
const Users       = lazy(() => import('./admin/pages/Users'));
const Support     = lazy(() => import('./admin/pages/Support'));
const Shipping    = lazy(() => import('./admin/pages/Shipping'));

function AdminFallback() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', fontFamily: "'Cairo', sans-serif", color: '#9A6070' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 36, height: 36, border: '3px solid #F0E0E8', borderTopColor: '#9A2D55', borderRadius: '50%', animation: 'spin .7s linear infinite', margin: '0 auto 12px' }} />
        <div style={{ fontSize: 13 }}>جاري التحميل...</div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Suspense fallback={<AdminFallback />}><Dashboard /></Suspense>} />
        <Route path="orders" element={<Suspense fallback={<AdminFallback />}><Orders /></Suspense>} />
        <Route path="orders/:id" element={<Suspense fallback={<AdminFallback />}><OrderDetails /></Suspense>} />
        <Route path="hero-banners" element={<Suspense fallback={<AdminFallback />}><HeroBanners /></Suspense>} />
        <Route path="products" element={<Suspense fallback={<AdminFallback />}><Products /></Suspense>} />
        <Route path="products/new" element={<Suspense fallback={<AdminFallback />}><ProductForm /></Suspense>} />
        <Route path="products/:id" element={<Suspense fallback={<AdminFallback />}><ProductForm /></Suspense>} />
        <Route path="categories" element={<Suspense fallback={<AdminFallback />}><Categories /></Suspense>} />
        <Route path="customers" element={<Suspense fallback={<AdminFallback />}><Customers /></Suspense>} />
        <Route path="inventory" element={<Suspense fallback={<AdminFallback />}><Inventory /></Suspense>} />
        <Route path="marketing" element={<Suspense fallback={<AdminFallback />}><Marketing /></Suspense>} />
        <Route path="coupons" element={<Suspense fallback={<AdminFallback />}><Coupons /></Suspense>} />
        <Route path="reviews" element={<Suspense fallback={<AdminFallback />}><Reviews /></Suspense>} />
        <Route path="reports" element={<Suspense fallback={<AdminFallback />}><Reports /></Suspense>} />
        <Route path="settings" element={<Suspense fallback={<AdminFallback />}><Settings /></Suspense>} />
        <Route path="users" element={<Suspense fallback={<AdminFallback />}><Users /></Suspense>} />
        <Route path="support" element={<Suspense fallback={<AdminFallback />}><Support /></Suspense>} />
        <Route path="shipping" element={<Suspense fallback={<AdminFallback />}><Shipping /></Suspense>} />
      </Route>
      <Route path="*" element={<StorefrontApp />} />
    </Routes>
  );
}
