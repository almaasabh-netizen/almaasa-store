import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const navGroups = [
  {
    label: 'الرئيسية',
    items: [
      { to: '/admin', icon: 'dashboard', label: 'لوحة التحكم', exact: true },
      { to: '/admin/reports', icon: 'analytics', label: 'التقارير' },
    ],
  },
  {
    label: 'المتجر',
    items: [
      { to: '/admin/orders',     icon: 'orders',     label: 'الطلبات',    badge: true },
      { to: '/admin/products',   icon: 'products',   label: 'المنتجات' },
      { to: '/admin/categories', icon: 'categories', label: 'التصنيفات' },
      { to: '/admin/inventory',  icon: 'inventory',  label: 'المخزون' },
      { to: '/admin/customers',  icon: 'customers',  label: 'العملاء' },
      { to: '/admin/reviews',    icon: 'reviews',    label: 'التقييمات' },
    ],
  },
  {
    label: 'التسويق',
    items: [
      { to: '/admin/coupons',      icon: 'coupons',   label: 'الكوبونات' },
      { to: '/admin/marketing',    icon: 'campaigns', label: 'الحملات' },
      { to: '/admin/hero-banners', icon: 'banners',   label: 'البانرات' },
    ],
  },
  {
    label: 'الشحن',
    items: [
      { to: '/admin/shipping', icon: 'shipping', label: 'مناطق الشحن' },
    ],
  },
  {
    label: 'الإدارة',
    items: [
      { to: '/admin/settings', icon: 'settings', label: 'الإعدادات' },
      { to: '/admin/users',    icon: 'users',    label: 'الفريق' },
      { to: '/admin/support',  icon: 'support',  label: 'الدعم' },
    ],
  },
];

function Icon({ name }: { name: string }) {
  const s = { width: 15, height: 15 } as React.SVGProps<SVGSVGElement>;
  const p = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  switch (name) {
    case 'dashboard': return <svg {...s} viewBox="0 0 24 24" {...p}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>;
    case 'analytics': return <svg {...s} viewBox="0 0 24 24" {...p}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;
    case 'orders': return <svg {...s} viewBox="0 0 24 24" {...p}><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>;
    case 'products': return <svg {...s} viewBox="0 0 24 24" {...p}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>;
    case 'categories': return <svg {...s} viewBox="0 0 24 24" {...p}><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>;
    case 'inventory': return <svg {...s} viewBox="0 0 24 24" {...p}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
    case 'customers': return <svg {...s} viewBox="0 0 24 24" {...p}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
    case 'reviews': return <svg {...s} viewBox="0 0 24 24" {...p}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
    case 'coupons': return <svg {...s} viewBox="0 0 24 24" {...p}><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>;
    case 'campaigns': return <svg {...s} viewBox="0 0 24 24" {...p}><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>;
    case 'banners': return <svg {...s} viewBox="0 0 24 24" {...p}><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>;
    case 'shipping': return <svg {...s} viewBox="0 0 24 24" {...p}><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>;
    case 'settings': return <svg {...s} viewBox="0 0 24 24" {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
    case 'users': return <svg {...s} viewBox="0 0 24 24" {...p}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
    case 'support': return <svg {...s} viewBox="0 0 24 24" {...p}><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
    default: return null;
  }
}

const RAIL_W = 58;
const RAIL_OPEN = 232;
const ROSE = '#9A2D55';
const INK2 = '#7A6065';
const INK3 = '#C5AFAF';
const LINE = 'rgba(26,13,17,.07)';

export default function Sidebar() {
  const location = useLocation();
  const [expanded, setExpanded] = useState(false);

  const isActive = (item: { to: string; exact?: boolean }) =>
    item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to);

  return (
    <aside
      dir="rtl"
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      style={{
        width: expanded ? RAIL_OPEN : RAIL_W,
        minHeight: '100vh',
        background: '#FFFFFF',
        borderLeft: `1px solid ${LINE}`,
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'Cairo', sans-serif",
        flexShrink: 0,
        overflow: 'hidden',
        transition: 'width .22s cubic-bezier(.4,0,.2,1)',
        boxShadow: expanded ? '4px 0 24px rgba(26,13,17,.08)' : 'none',
        zIndex: 10,
        position: 'relative',
      }}
    >
      {/* Logo */}
      <div style={{
        height: 56, display: 'flex', alignItems: 'center', gap: 12,
        padding: '0 16px', borderBottom: `1px solid ${LINE}`,
        flexShrink: 0, overflow: 'hidden', whiteSpace: 'nowrap',
      }}>
        <div style={{ width: 26, height: 26, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: ROSE, fontFamily: "'Amiri', serif", fontSize: 18 }}>◆</div>
        <div style={{ opacity: expanded ? 1 : 0, transition: 'opacity .18s .06s', whiteSpace: 'nowrap' }}>
          <div style={{ fontFamily: "'Amiri', serif", fontSize: 17, fontWeight: 700, color: '#1A0D11' }}>ألماسة</div>
        </div>
      </div>

      {/* Nav */}
      <div style={{ flex: 1, padding: '10px 0', overflowY: 'auto', overflowX: 'hidden', scrollbarWidth: 'none', display: 'flex', flexDirection: 'column', gap: 1 }}>
        {navGroups.map(group => (
          <div key={group.label}>
            <div style={{
              fontSize: 9, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase',
              color: INK3, padding: '10px 17px 3px',
              opacity: expanded ? 1 : 0, transition: 'opacity .18s .06s', whiteSpace: 'nowrap',
            }}>
              {group.label}
            </div>
            {group.items.map(item => {
              const active = isActive(item);
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.exact}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '9px 16px', textDecoration: 'none',
                    color: active ? ROSE : INK2,
                    background: active ? 'rgba(154,45,85,.08)' : 'transparent',
                    fontWeight: active ? 700 : 500,
                    fontSize: 12.5,
                    position: 'relative',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    transition: 'background .15s, color .15s',
                  }}
                  onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'rgba(154,45,85,.06)'; }}
                  onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  {/* Active stripe */}
                  <span style={{
                    position: 'absolute', left: 0, top: '20%', bottom: '20%',
                    width: 3, borderRadius: '0 2px 2px 0',
                    background: ROSE, opacity: active ? 1 : 0,
                    transition: 'opacity .15s',
                  }} />
                  {/* Icon */}
                  <span style={{ width: 20, height: 20, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name={item.icon} />
                  </span>
                  {/* Label */}
                  <span style={{ opacity: expanded ? 1 : 0, transition: 'opacity .18s .06s', flex: 1 }}>
                    {item.label}
                  </span>
                  {/* Badge for orders */}
                  {(item as any).badge && expanded && (
                    <NewOrdersBadge />
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ borderTop: `1px solid ${LINE}`, padding: '10px 10px', overflow: 'hidden', whiteSpace: 'nowrap' }}>
        <a
          href="/"
          style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '8px 6px', borderRadius: 8, textDecoration: 'none',
            color: INK2, fontSize: 12.5, fontWeight: 500,
            marginBottom: 4,
          }}
        >
          <span style={{ width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </span>
          <span style={{ opacity: expanded ? 1 : 0, transition: 'opacity .18s .06s' }}>العودة للمتجر</span>
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 6px' }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
            background: 'rgba(154,45,85,.08)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: ROSE, fontWeight: 800, fontSize: 12,
            border: '1.5px solid rgba(154,45,85,.2)',
          }}>م</div>
          <div style={{ opacity: expanded ? 1 : 0, transition: 'opacity .18s .06s' }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: '#1A0D11' }}>مدير المتجر</div>
            <div style={{ fontSize: 10, color: INK2 }}>Admin</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function NewOrdersBadge() {
  try {
    const raw = localStorage.getItem('ama_orders');
    if (!raw) return null;
    const orders = JSON.parse(raw);
    const count = orders.filter((o: any) => o.status === 'new').length;
    if (!count) return null;
    return (
      <span style={{
        background: '#9A2D55', color: '#fff', borderRadius: 10,
        padding: '1px 7px', fontSize: 10, fontWeight: 800, flexShrink: 0,
      }}>{count}</span>
    );
  } catch {
    return null;
  }
}
