/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  stock: number;
  rating: number;
  reviewCount: number;
  sizes: string[];
  colors: string[];
  hasSheilah: boolean; // مخاوير مع شيلة
  isDraft?: boolean; // مستورد من إنستقرام - لم ينشر بعد
  properties: {
    label: string;
    value: string;
  }[];
}

export interface OrderItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
}

export interface Order {
  id: string;
  trackingCode: string;
  customer: CustomerInfo;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  paymentMethod: 'benefit' | 'knet' | 'card' | 'applepay' | 'cash';
  paymentStatus: 'pending' | 'paid' | 'failed';
  shippingStatus: 'pending' | 'processing' | 'shipped' | 'delivered';
  date: string;
  notes?: string;
  timeline: {
    title: string;
    description: string;
    date: string;
    status: 'pending' | 'processing' | 'shipped' | 'delivered';
  }[];
}

export interface OperationLog {
  id: string;
  action: string;
  details: string;
  date: string;
  operator: string;
  type: 'order' | 'product' | 'payment' | 'system' | 'marketing';
  severity: 'info' | 'warning' | 'success' | 'danger';
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  count: number;
}

export interface Coupon {
  code: string;
  discount: number;
  type: 'percentage' | 'fixed';
  isActive: boolean;
  usageCount: number;
  maxUsage?: number;
  expiryDate?: string;
}

export interface SizeGuide {
  id: string;
  name: string;
  sizes: {
    label: string;
    chest: string; // الصدر
    length: string; // الطول
    waist: string; // الخصر
    sleeve: string; // الأكمام
  }[];
}

export interface Review {
  id: string;
  productName: string;
  productId: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
  approved: boolean;
}

export interface StoreSettings {
  storeName: string;
  storeBio: string;
  whatsappNumber: string;
  instagramUsername: string;
  currency: string;
  shippingCost: number;
  freeShippingThreshold: number;
  themeColor: 'pink' | 'gold' | 'emerald' | 'charcoal';
  enablePaymentMock: boolean;
}
