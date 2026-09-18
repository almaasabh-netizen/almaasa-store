/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminLayout from './admin/layout/AdminLayout';
import AuthGuard from './admin/AuthGuard';
import StorefrontApp from './StorefrontApp';

const Login       = lazy(() => import('./admin/pages/Login'));
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

const S = (C: React.ComponentType) => (
  <Suspense fallback={<AdminFallback />}><C /></Suspense>
);

export default function App() {
  return (
    <Routes>
      {/* Public admin login */}
      <Route path="/admin/login" element={<Suspense fallback={<AdminFallback />}><Login /></Suspense>} />

      {/* Protected admin routes */}
      <Route path="/admin" element={<AuthGuard />}>
        <Route element={<AdminLayout />}>
          <Route index element={S(Dashboard)} />
          <Route path="orders" element={S(Orders)} />
          <Route path="orders/:id" element={S(OrderDetails)} />
          <Route path="hero-banners" element={S(HeroBanners)} />
          <Route path="products" element={S(Products)} />
          <Route path="products/new" element={S(ProductForm)} />
          <Route path="products/:id" element={S(ProductForm)} />
          <Route path="categories" element={S(Categories)} />
          <Route path="customers" element={S(Customers)} />
          <Route path="inventory" element={S(Inventory)} />
          <Route path="marketing" element={S(Marketing)} />
          <Route path="coupons" element={S(Coupons)} />
          <Route path="reviews" element={S(Reviews)} />
          <Route path="reports" element={S(Reports)} />
          <Route path="settings" element={S(Settings)} />
          <Route path="users" element={S(Users)} />
          <Route path="support" element={S(Support)} />
          <Route path="shipping" element={S(Shipping)} />
        </Route>
      </Route>

      <Route path="*" element={<StorefrontApp />} />
    </Routes>
  );
}
