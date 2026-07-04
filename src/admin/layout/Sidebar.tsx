import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

// CSS-only icons matching the design handoff
const Icons: Record<string, React.ReactNode> = {
  dashboard: (
    <span style={{ width:18,height:18,display:'grid',gridTemplateColumns:'1fr 1fr',gridTemplateRows:'1fr 1fr',gap:2,flexShrink:0 }}>
      <span style={{ border:'1.5px solid currentColor',borderRadius:2 }}/>
      <span style={{ border:'1.5px solid currentColor',borderRadius:2 }}/>
      <span style={{ border:'1.5px solid currentColor',borderRadius:2 }}/>
      <span style={{ border:'1.5px solid currentColor',borderRadius:2 }}/>
    </span>
  ),
  orders: (
    <span style={{ width:18,height:18,position:'relative',flexShrink:0 }}>
      <span style={{ position:'absolute',bottom:1,left:2,width:14,height:11,border:'1.5px solid currentColor',borderRadius:2 }}/>
      <span style={{ position:'absolute',top:2,left:6,width:6,height:5,border:'1.5px solid currentColor',borderBottom:'none',borderRadius:'4px 4px 0 0' }}/>
    </span>
  ),
  products: (
    <span style={{ width:18,height:18,position:'relative',flexShrink:0 }}>
      <span style={{ position:'absolute',top:2,left:2,width:10,height:10,border:'1.5px solid currentColor',borderRadius:2,background:'#fff' }}/>
      <span style={{ position:'absolute',bottom:2,right:2,width:10,height:10,border:'1.5px solid currentColor',borderRadius:2,background:'#fff' }}/>
    </span>
  ),
  categories: (
    <span style={{ width:18,height:18,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:3,flexShrink:0 }}>
      <span style={{ width:14,height:2.5,borderRadius:1,background:'currentColor' }}/>
      <span style={{ width:10,height:2.5,borderRadius:1,background:'currentColor' }}/>
      <span style={{ width:6,height:2.5,borderRadius:1,background:'currentColor' }}/>
    </span>
  ),
  inventory: (
    <span style={{ width:18,height:18,position:'relative',flexShrink:0 }}>
      <span style={{ position:'absolute',inset:2,border:'1.5px solid currentColor',borderRadius:2 }}/>
      <span style={{ position:'absolute',top:9,left:3,right:3,height:1.5,background:'currentColor' }}/>
    </span>
  ),
  shipping: (
    <span style={{ width:18,height:18,position:'relative',flexShrink:0 }}>
      <span style={{ position:'absolute',top:1,left:4,width:10,height:10,border:'1.5px solid currentColor',borderRadius:'50%' }}/>
      <span style={{ position:'absolute',bottom:1,left:7,width:5,height:5,border:'1.5px solid currentColor',borderTop:'none',borderLeft:'none',transform:'rotate(45deg)' }}/>
    </span>
  ),
  customers: (
    <span style={{ width:18,height:18,position:'relative',flexShrink:0 }}>
      <span style={{ position:'absolute',top:3,left:1,width:9,height:9,border:'1.5px solid currentColor',borderRadius:'50%',background:'#fff' }}/>
      <span style={{ position:'absolute',top:3,right:1,width:9,height:9,border:'1.5px solid currentColor',borderRadius:'50%',background:'#fff' }}/>
    </span>
  ),
  reviews: (
    <span style={{ width:18,height:18,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,lineHeight:1,flexShrink:0 }}>★</span>
  ),
  banners: (
    <span style={{ width:18,height:18,position:'relative',flexShrink:0 }}>
      <span style={{ position:'absolute',inset:2,border:'1.5px solid currentColor',borderRadius:2 }}/>
      <span style={{ position:'absolute',top:4.5,left:4.5,width:3,height:3,border:'1.5px solid currentColor',borderRadius:'50%' }}/>
    </span>
  ),
  marketing: (
    <span style={{ width:18,height:18,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
      <span style={{ width:0,height:0,borderTop:'6px solid transparent',borderBottom:'6px solid transparent',borderRight:'9px solid currentColor' }}/>
    </span>
  ),
  coupons: (
    <span style={{ width:18,height:18,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,flexShrink:0 }}>٪</span>
  ),
  reports: (
    <span style={{ width:18,height:18,display:'flex',alignItems:'flex-end',justifyContent:'center',gap:2,flexShrink:0 }}>
      <span style={{ width:3,height:6,background:'currentColor',borderRadius:1 }}/>
      <span style={{ width:3,height:10,background:'currentColor',borderRadius:1 }}/>
      <span style={{ width:3,height:14,background:'currentColor',borderRadius:1 }}/>
    </span>
  ),
  settings: (
    <span style={{ width:18,height:18,position:'relative',flexShrink:0 }}>
      <span style={{ position:'absolute',inset:2,border:'1.5px solid currentColor',borderRadius:'50%' }}/>
      <span style={{ position:'absolute',top:7,left:7,width:4,height:4,background:'currentColor',borderRadius:'50%' }}/>
    </span>
  ),
  users: (
    <span style={{ width:18,height:18,position:'relative',flexShrink:0 }}>
      <span style={{ position:'absolute',top:2,left:6,width:6,height:6,border:'1.5px solid currentColor',borderRadius:'50%' }}/>
      <span style={{ position:'absolute',bottom:2,left:3,width:12,height:6,border:'1.5px solid currentColor',borderBottom:'none',borderRadius:'6px 6px 0 0' }}/>
    </span>
  ),
  support: (
    <span style={{ width:18,height:18,display:'flex',alignItems:'center',justifyContent:'center',border:'1.5px solid currentColor',borderRadius:'50%',fontSize:10,fontWeight:700,flexShrink:0 }}>؟</span>
  ),
  back: (
    <span style={{ width:18,height:18,display:'flex',alignItems:'center',justifyContent:'center',fontSize:15,flexShrink:0 }}>⇦</span>
  ),
};

const navGroups = [
  {
    label: 'الرئيسية',
    items: [
      { to: '/admin', icon: 'dashboard', label: 'لوحة التحكم', exact: true },
    ]
  },
  {
    label: 'المتجر',
    items: [
      { to: '/admin/orders',     icon: 'orders',     label: 'الطلبات' },
      { to: '/admin/products',   icon: 'products',   label: 'المنتجات' },
      { to: '/admin/categories', icon: 'categories', label: 'التصنيفات' },
      { to: '/admin/inventory',  icon: 'inventory',  label: 'المخزون' },
      { to: '/admin/shipping',   icon: 'shipping',   label: 'الشحن' },
    ]
  },
  {
    label: 'العملاء',
    items: [
      { to: '/admin/customers', icon: 'customers', label: 'العملاء' },
      { to: '/admin/reviews',   icon: 'reviews',   label: 'التقييمات' },
    ]
  },
  {
    label: 'التسويق',
    items: [
      { to: '/admin/hero-banners', icon: 'banners',   label: 'البانرات الرئيسية' },
      { to: '/admin/marketing',    icon: 'marketing', label: 'التسويق' },
      { to: '/admin/coupons',      icon: 'coupons',   label: 'الكوبونات' },
    ]
  },
  {
    label: 'التقارير',
    items: [
      { to: '/admin/reports', icon: 'reports', label: 'التقارير' },
    ]
  },
  {
    label: 'الإدارة',
    items: [
      { to: '/admin/settings', icon: 'settings', label: 'الإعدادات' },
      { to: '/admin/users',    icon: 'users',    label: 'المستخدمون' },
      { to: '/admin/support',  icon: 'support',  label: 'الدعم' },
    ]
  },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside dir="rtl" style={{
      width: 250, minHeight: '100vh', background: '#fff',
      borderLeft: '1px solid rgba(154,45,85,.1)',
      display: 'flex', flexDirection: 'column',
      fontFamily: "'Cairo', sans-serif",
      boxSizing: 'border-box', padding: '22px 0',
      flexShrink: 0,
    }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 20px 18px', borderBottom:'1px solid rgba(154,45,85,.1)', marginBottom:16 }}>
        <span style={{ width:22, height:22, display:'flex', alignItems:'center', justifyContent:'center', color:'#c9b8b2', fontSize:16, flexShrink:0 }}>‹</span>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div>
            <div style={{ fontFamily:"'Amiri', serif", fontSize:22, fontWeight:700, color:'#9A2D55' }}>ألماسة</div>
            <div style={{ fontSize:11, color:'#9a8a85', marginTop:2 }}>لوحة الإدارة</div>
          </div>
          <div style={{ width:36, height:36, borderRadius:'50%', background:'#F6DCE4', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <span style={{ width:10, height:10, background:'#9A2D55', transform:'rotate(45deg)', borderRadius:2, display:'block' }}/>
          </div>
        </div>
      </div>

      {/* Nav groups */}
      <div style={{ display:'flex', flexDirection:'column', gap:22, padding:'0 14px', overflowY:'auto', flex:1 }}>
        {navGroups.map(group => {
          const isActive = (item: typeof group.items[0]) =>
            item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to);
          return (
            <div key={group.label}>
              <div style={{ fontSize:11, fontWeight:600, color:'#B08D57', letterSpacing:'0.04em', padding:'0 12px 8px' }}>
                {group.label}
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
                {group.items.map(item => {
                  const active = isActive(item);
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.exact}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '10px 12px', borderRadius: 8, textDecoration: 'none',
                        background: active ? '#F6DCE4' : 'transparent',
                        color: active ? '#9A2D55' : '#4a3d40',
                        fontSize: 13.5, fontWeight: active ? 700 : 500,
                        fontFamily: "'Cairo', sans-serif",
                      }}
                    >
                      {Icons[item.icon]}
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{ padding:'16px 14px 0', borderTop:'1px solid rgba(154,45,85,.1)', display:'flex', flexDirection:'column', gap:2 }}>
        <a href="/" style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:8, textDecoration:'none', color:'#6b5a5f', fontSize:13.5, fontWeight:500, fontFamily:"'Cairo', sans-serif" }}>
          {Icons.back}
          <span>العودة للمتجر</span>
        </a>
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'14px 12px 0', marginTop:6 }}>
          <div style={{ width:34, height:34, borderRadius:'50%', background:'#F3EAE2', display:'flex', alignItems:'center', justifyContent:'center', color:'#9A2D55', fontWeight:700, fontSize:13, flexShrink:0 }}>
            م
          </div>
          <div>
            <div style={{ fontSize:12.5, fontWeight:600, color:'#241419' }}>مدير المتجر</div>
            <div style={{ fontSize:11, color:'#9a8a85' }}>مديرة المتجر</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
