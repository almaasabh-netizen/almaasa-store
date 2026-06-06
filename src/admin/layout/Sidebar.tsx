import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingBag, Package, Users, BarChart2,
  Tag, MessageSquare, Settings, LogOut, Megaphone, Star,
  Truck, ChevronLeft, Percent, Layers, HelpCircle, UserCog,
  Bell, Boxes
} from 'lucide-react';

const navGroups = [
  {
    label: 'الرئيسية',
    items: [
      { to: '/admin', icon: LayoutDashboard, label: 'لوحة التحكم', exact: true },
    ]
  },
  {
    label: 'المتجر',
    items: [
      { to: '/admin/orders',    icon: ShoppingBag, label: 'الطلبات' },
      { to: '/admin/products',  icon: Package,     label: 'المنتجات' },
      { to: '/admin/categories',icon: Layers,      label: 'التصنيفات' },
      { to: '/admin/inventory', icon: Boxes,       label: 'المخزون' },
    ]
  },
  {
    label: 'العملاء',
    items: [
      { to: '/admin/customers', icon: Users,        label: 'العملاء' },
      { to: '/admin/reviews',   icon: Star,         label: 'التقييمات' },
    ]
  },
  {
    label: 'التسويق',
    items: [
      { to: '/admin/marketing', icon: Megaphone,    label: 'التسويق' },
      { to: '/admin/coupons',   icon: Percent,      label: 'الكوبونات' },
    ]
  },
  {
    label: 'التقارير',
    items: [
      { to: '/admin/reports',   icon: BarChart2,    label: 'التقارير' },
    ]
  },
  {
    label: 'الإدارة',
    items: [
      { to: '/admin/settings',  icon: Settings,     label: 'الإعدادات' },
      { to: '/admin/users',     icon: UserCog,      label: 'المستخدمون' },
      { to: '/admin/support',   icon: HelpCircle,   label: 'الدعم' },
    ]
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();

  return (
    <aside
      className="h-screen flex flex-col border-l transition-all duration-300 relative"
      style={{
        width: collapsed ? 64 : 220,
        background: '#FFFFFF',
        borderColor: '#F0DDE0',
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b" style={{ borderColor: '#F0DDE0' }}>
        <img src="/logo.jpg" alt="ألماسة" className="w-8 h-8 rounded-lg object-cover shrink-0" />
        {!collapsed && (
          <div>
            <p className="font-black text-sm" style={{ color: '#5A4047' }}>ألماسة</p>
            <p className="text-[10px]" style={{ color: '#D79AA8' }}>لوحة الإدارة</p>
          </div>
        )}
        <button
          onClick={onToggle}
          className="mr-auto p-1 rounded-lg transition-colors hover:bg-[#F3E6E8]"
        >
          <ChevronLeft className={`w-4 h-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} style={{ color: '#D79AA8' }} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 space-y-1 px-2">
        {navGroups.map(group => (
          <div key={group.label}>
            {!collapsed && (
              <p className="text-[10px] font-bold px-2 py-1.5 uppercase tracking-widest" style={{ color: '#D79AA8' }}>
                {group.label}
              </p>
            )}
            {group.items.map(item => {
              const isActive = item.exact
                ? location.pathname === item.to
                : location.pathname.startsWith(item.to);
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.exact}
                  className="flex items-center gap-3 px-2.5 py-2 rounded-xl text-sm font-medium transition-all group"
                  style={{
                    background: isActive ? '#F3E6E8' : 'transparent',
                    color: isActive ? '#C77D8A' : '#5A4047',
                  }}
                >
                  <item.icon className="w-4.5 h-4.5 shrink-0" style={{ width: 18, height: 18 }} />
                  {!collapsed && <span>{item.label}</span>}
                  {isActive && !collapsed && (
                    <span className="mr-auto w-1.5 h-1.5 rounded-full" style={{ background: '#C77D8A' }} />
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t" style={{ borderColor: '#F0DDE0' }}>
        <a
          href="/"
          className="flex items-center gap-3 px-2.5 py-2 rounded-xl text-sm font-medium transition-all hover:bg-red-50 hover:text-red-500"
          style={{ color: '#5A4047' }}
        >
          <LogOut style={{ width: 18, height: 18, flexShrink: 0 }} />
          {!collapsed && <span>العودة للمتجر</span>}
        </a>
      </div>
    </aside>
  );
}
