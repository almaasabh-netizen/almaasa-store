import React, { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

export default function AuthGuard() {
  const [status, setStatus] = useState<'checking' | 'ok' | 'denied'>('checking');

  useEffect(() => {
    fetch('/api/admin-verify', { credentials: 'include' })
      .then(r => setStatus(r.ok ? 'ok' : 'denied'))
      .catch(() => setStatus('denied'));
  }, []);

  if (status === 'checking') {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#160B10',
        fontFamily: "'Cairo', sans-serif",
        color: 'rgba(196,168,130,0.6)',
        fontSize: 14,
        gap: 10,
        direction: 'rtl',
      }}>
        <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block', fontSize: 20 }}>⟳</span>
        جاري التحقق...
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (status === 'denied') {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}
