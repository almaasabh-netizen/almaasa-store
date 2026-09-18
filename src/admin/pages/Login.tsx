import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // If already authenticated, go to dashboard
  useEffect(() => {
    fetch('/api/admin-verify', { credentials: 'include' })
      .then(r => { if (r.ok) navigate('/admin', { replace: true }); })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) { setError('يرجى إدخال البريد وكلمة المرور'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/admin-login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        navigate('/admin', { replace: true });
      } else {
        setError(data.error || 'بيانات الدخول غير صحيحة');
      }
    } catch {
      setError('تعذّر الاتصال بالخادم. حاول مجدداً.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #160B10 0%, #2E1219 50%, #160B10 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Cairo', sans-serif",
      direction: 'rtl',
      padding: '24px 16px',
    }}>
      {/* Background pattern */}
      <div style={{
        position: 'fixed', inset: 0, opacity: 0.04,
        backgroundImage: 'repeating-linear-gradient(45deg, #C4A882 0, #C4A882 1px, transparent 0, transparent 50%)',
        backgroundSize: '24px 24px',
        pointerEvents: 'none',
      }} />

      <div style={{ width: '100%', maxWidth: 420, position: 'relative' }}>

        {/* Logo card */}
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(196,168,130,0.2)',
          borderRadius: 20,
          padding: '40px 36px 36px',
          backdropFilter: 'blur(16px)',
        }}>
          {/* Brand */}
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 64, height: 64,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #9A2D55, #C4A882)',
              marginBottom: 16,
              fontSize: 28,
            }}>◆</div>
            <h1 style={{
              fontFamily: "'Amiri', serif",
              fontSize: 28,
              color: '#FAF7F3',
              margin: 0,
              letterSpacing: 2,
            }}>ألماسة</h1>
            <p style={{ color: 'rgba(196,168,130,0.7)', fontSize: 13, margin: '6px 0 0' }}>
              لوحة الإدارة
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', color: 'rgba(250,247,243,0.6)', fontSize: 12, marginBottom: 6, fontWeight: 600, letterSpacing: 0.5 }}>
                البريد الإلكتروني
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                dir="ltr"
                placeholder="admin@almaasa.bh"
                autoComplete="email"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  background: 'rgba(255,255,255,0.07)',
                  border: `1px solid ${error ? 'rgba(220,80,80,0.5)' : 'rgba(196,168,130,0.25)'}`,
                  borderRadius: 10,
                  color: '#FAF7F3',
                  fontSize: 14,
                  outline: 'none',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(196,168,130,0.6)'}
                onBlur={e => e.target.style.borderColor = error ? 'rgba(220,80,80,0.5)' : 'rgba(196,168,130,0.25)'}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', color: 'rgba(250,247,243,0.6)', fontSize: 12, marginBottom: 6, fontWeight: 600, letterSpacing: 0.5 }}>
                كلمة المرور
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  dir="ltr"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  style={{
                    width: '100%',
                    padding: '12px 44px 12px 14px',
                    background: 'rgba(255,255,255,0.07)',
                    border: `1px solid ${error ? 'rgba(220,80,80,0.5)' : 'rgba(196,168,130,0.25)'}`,
                    borderRadius: 10,
                    color: '#FAF7F3',
                    fontSize: 14,
                    outline: 'none',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(196,168,130,0.6)'}
                  onBlur={e => e.target.style.borderColor = error ? 'rgba(220,80,80,0.5)' : 'rgba(196,168,130,0.25)'}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  style={{
                    position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'rgba(196,168,130,0.5)', fontSize: 14, padding: 4,
                    lineHeight: 1,
                  }}
                  tabIndex={-1}
                >
                  {showPass ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                background: 'rgba(220,60,60,0.15)',
                border: '1px solid rgba(220,60,60,0.3)',
                borderRadius: 8,
                padding: '10px 14px',
                marginBottom: 20,
                color: '#FF9090',
                fontSize: 13,
                textAlign: 'center',
              }}>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '13px',
                background: loading
                  ? 'rgba(154,45,85,0.5)'
                  : 'linear-gradient(135deg, #9A2D55, #7A1F3F)',
                border: 'none',
                borderRadius: 10,
                color: '#FAF7F3',
                fontSize: 15,
                fontWeight: 700,
                fontFamily: 'inherit',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'opacity 0.2s, transform 0.1s',
                letterSpacing: 0.5,
              }}
              onMouseEnter={e => { if (!loading) (e.target as HTMLButtonElement).style.opacity = '0.9'; }}
              onMouseLeave={e => { (e.target as HTMLButtonElement).style.opacity = '1'; }}
            >
              {loading ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span>
                  جاري التحقق...
                </span>
              ) : 'دخول'}
            </button>
          </form>

          {/* Footer */}
          <p style={{ textAlign: 'center', marginTop: 24, color: 'rgba(196,168,130,0.35)', fontSize: 11 }}>
            متجر ألماسة — البحرين © {new Date().getFullYear()}
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: rgba(196,168,130,0.3) !important; }
        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 30px #2E1219 inset !important;
          -webkit-text-fill-color: #FAF7F3 !important;
        }
      `}</style>
    </div>
  );
}
