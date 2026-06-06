/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminLayout from './admin/layout/AdminLayout';
import Dashboard from './admin/pages/Dashboard';
import Orders from './admin/pages/Orders';
import OrderDetails from './admin/pages/OrderDetails';
import HeroBanners from './admin/pages/HeroBanners';
import Products from './admin/pages/Products';
import ProductForm from './admin/pages/ProductForm';
import Categories from './admin/pages/Categories';
import Customers from './admin/pages/Customers';
import Inventory from './admin/pages/Inventory';
import Marketing from './admin/pages/Marketing';
import Coupons from './admin/pages/Coupons';
import Reviews from './admin/pages/Reviews';
import Reports from './admin/pages/Reports';
import Settings from './admin/pages/Settings';
import Users from './admin/pages/Users';
import Support from './admin/pages/Support';
import StorefrontApp from './StorefrontApp';

export default function App() {
  return (
    <Routes>
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="orders" element={<Orders />} />
        <Route path="orders/:id" element={<OrderDetails />} />
        <Route path="hero-banners" element={<HeroBanners />} />
        <Route path="products" element={<Products />} />
        <Route path="products/new" element={<ProductForm />} />
        <Route path="products/:id" element={<ProductForm />} />
        <Route path="categories" element={<Categories />} />
        <Route path="customers" element={<Customers />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="marketing" element={<Marketing />} />
        <Route path="coupons" element={<Coupons />} />
        <Route path="reviews" element={<Reviews />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
        <Route path="users" element={<Users />} />
        <Route path="support" element={<Support />} />
      </Route>
      <Route path="*" element={<StorefrontApp />} />
    </Routes>
  );
}
