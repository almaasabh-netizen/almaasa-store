import React from 'react';
import { useNavigate } from 'react-router-dom';

const ROSE = '#9A2D55';
const INK2 = '#7A6065';
const LINE = 'rgba(26,13,17,.07)';

interface HeaderProps {
  darkMode: boolean;
  onToggleDark: () => void;
  onMenuOpen: () => void;
  title: string;
}

export default function Header({ darkMode, onToggleDark, onMenuOpen, title }: HeaderProps) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await fetch('/api/admin-logout', { method: 'POST', credentials: 'include' });
    navigate('/admin/login', { replace: true });
  };

  const notifCount = React.useMemo(() => {
    try {
      const raw = localStorage.getItem('ama_orders');
      if (!raw) return 0;
      return JSON.parse(raw).filter((o: any) => o.status === 'new').length;
    } catch { return 0; }
  }, []);

  return (
    <header style={{
      height: 56, flexShrink: 0,
      background: '#FFFFFF', borderBottom: `1px solid ${LINE}`,
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '0 20px',
      fontFamily: "'Cairo', sans-serif",
      direction: 'rtl',
    }}>
      {/* Mobile menu */}
      <button
        className="lg:hidden"
        onClick={onMenuOpen}
        style={{
          width: 32, height: 32, display: 'flex', alignItems: 'center',
          justifyContent: 'center', border: 'none', background: 'transparent',
          cursor: 'pointer', color: INK2, borderRadius: 6, flexShrink: 0,
        }}
        aria-label="فتح القائمة"
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>

      {/* Breadcrumb / Title */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden' }}>
        <span style={{ fontSize: 11, color: INK2, whiteSpace: 'nowrap' }}>الإدارة</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={INK2} strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }}>
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#1A0D11', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</span>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
        {/* Dark mode */}
        <button
          onClick={onToggleDark}
          style={{
            width: 34, height: 34, display: 'flex', alignItems: 'center',
            justifyContent: 'center', border: 'none', background: 'transparent',
            cursor: 'pointer', color: INK2, borderRadius: 8,
            transition: 'background .15s',
          }}
          title={darkMode ? 'الوضع النهاري' : 'الوضع الليلي'}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(26,13,17,.06)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          {darkMode ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          )}
        </button>

        {/* Search */}
        <button
          style={{
            width: 34, height: 34, display: 'flex', alignItems: 'center',
            justifyContent: 'center', border: 'none', background: 'transparent',
            cursor: 'pointer', color: INK2, borderRadius: 8,
            transition: 'background .15s',
          }}
          title="بحث"
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(26,13,17,.06)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </button>

        {/* Notifications */}
        <button
          style={{
            width: 34, height: 34, display: 'flex', alignItems: 'center',
            justifyContent: 'center', border: 'none', background: 'transparent',
            cursor: 'pointer', color: INK2, borderRadius: 8, position: 'relative',
            transition: 'background .15s',
          }}
          title="الإشعارات"
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(26,13,17,.06)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          {notifCount > 0 && (
            <span style={{
              position: 'absolute', top: 5, right: 5,
              width: 8, height: 8, borderRadius: '50%',
              background: ROSE, border: '1.5px solid #fff',
            }} />
          )}
        </button>

        {/* Divider */}
        <div style={{ width: 1, height: 22, background: LINE, margin: '0 4px' }} />

        {/* Avatar */}
        <div style={{
          width: 30, height: 30, borderRadius: '50%',
          background: 'rgba(154,45,85,.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: ROSE, fontWeight: 800, fontSize: 12, cursor: 'pointer',
          border: '1.5px solid rgba(154,45,85,.2)',
          fontFamily: "'Cairo', sans-serif",
        }}>م</div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          title="تسجيل الخروج"
          style={{
            width: 34, height: 34, display: 'flex', alignItems: 'center',
            justifyContent: 'center', border: 'none', background: 'transparent',
            cursor: 'pointer', color: INK2, borderRadius: 8,
            transition: 'background .15s, color .15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(220,60,60,.08)'; e.currentTarget.style.color = '#DC3030'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = INK2; }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </button>
      </div>
    </header>
  );
}
