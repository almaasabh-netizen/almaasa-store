import React, { useState } from 'react';
import { getStoredData } from '../../data';

interface HeaderProps {
  darkMode: boolean;
  onToggleDark: () => void;
  onMenuOpen: () => void;
  title: string;
}

export default function Header({ onMenuOpen, title }: HeaderProps) {
  const [showNotifs, setShowNotifs] = useState(false);
  const data = getStoredData();
  const newOrders = data.orders?.filter((o: any) => o.status === 'new').length || 0;
  const lowStock = data.products?.filter((p: any) => p.stock > 0 && p.stock <= 5).length || 0;

  const notifs = [
    ...(newOrders > 0 ? [{ icon: '🛍️', text: `${newOrders} طلب جديد بانتظار المعالجة`, time: 'الآن' }] : []),
    ...(lowStock > 0 ? [{ icon: '📦', text: `${lowStock} منتج على وشك النفاد`, time: 'منذ 5 دقائق' }] : []),
  ];

  return (
    <header style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '0 20px', background: '#FFFFFF', height: 60,
      borderBottom: '1px solid rgba(154,45,85,.1)',
      fontFamily: "'Cairo', sans-serif",
      flexShrink: 0,
    }}>
      {/* Mobile menu */}
      <button
        onClick={onMenuOpen}
        className="lg:hidden"
        style={{ padding: '6px 8px', borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 18, color: '#5A4047' }}
      >☰</button>

      {/* Title */}
      <h1 style={{ fontSize: 15, fontWeight: 700, color: '#241419', margin: 0 }} className="hidden sm:block">{title}</h1>

      {/* Search */}
      <div className="hidden md:flex" style={{
        flex: 1, maxWidth: 280, alignItems: 'center', gap: 8,
        borderRadius: 10, padding: '7px 12px', marginRight: 8,
        background: '#FBF7F8', border: '1px solid rgba(154,45,85,.1)',
      }}>
        <span style={{ color: '#c9b8b2', fontSize: 13 }}>🔍</span>
        <input
          type="text"
          placeholder="بحث..."
          style={{
            background: 'transparent', border: 'none', outline: 'none',
            fontSize: 13, color: '#241419', width: '100%',
            fontFamily: "'Cairo', sans-serif",
          }}
          dir="rtl"
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 'auto' }}>
        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            style={{
              position: 'relative', padding: '7px 8px', borderRadius: 8,
              border: 'none', background: 'transparent', cursor: 'pointer',
              fontSize: 16,
            }}
          >
            🔔
            {notifs.length > 0 && (
              <span style={{
                position: 'absolute', top: 5, right: 5, width: 8, height: 8,
                borderRadius: '50%', background: '#9A2D55', display: 'block',
              }} />
            )}
          </button>

          {showNotifs && (
            <div style={{
              position: 'absolute', left: 0, top: '100%', marginTop: 8,
              width: 300, borderRadius: 12, boxShadow: '0 8px 32px rgba(154,45,85,.15)',
              background: '#FFFFFF', border: '1px solid rgba(154,45,85,.1)', zIndex: 50,
            }}>
              <div style={{
                padding: '12px 16px', borderBottom: '1px solid rgba(154,45,85,.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#241419' }}>الإشعارات</span>
                <span style={{
                  fontSize: 11, padding: '2px 8px', borderRadius: 20,
                  background: '#F6DCE4', color: '#9A2D55', fontWeight: 700,
                }}>{notifs.length}</span>
              </div>
              <div style={{ maxHeight: 280, overflowY: 'auto' }}>
                {notifs.map((n, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'flex-start', gap: 10,
                    padding: '12px 16px', borderBottom: '1px solid rgba(154,45,85,.06)',
                  }}>
                    <span style={{ fontSize: 18, flexShrink: 0 }}>{n.icon}</span>
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 500, color: '#241419', margin: 0 }}>{n.text}</p>
                      <p style={{ fontSize: 10, color: '#9a8a85', margin: 0, marginTop: 2 }}>{n.time}</p>
                    </div>
                  </div>
                ))}
                {notifs.length === 0 && (
                  <div style={{ padding: '20px 16px', textAlign: 'center', fontSize: 12, color: '#9a8a85' }}>
                    لا توجد إشعارات جديدة
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 8 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%', background: '#F3EAE2',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#9A2D55', fontWeight: 700, fontSize: 13, flexShrink: 0,
          }}>م</div>
          <div className="hidden sm:block" style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#241419', margin: 0 }}>مدير المتجر</p>
            <p style={{ fontSize: 10, color: '#9a8a85', margin: 0 }}>مدير النظام</p>
          </div>
        </div>
      </div>
    </header>
  );
}
