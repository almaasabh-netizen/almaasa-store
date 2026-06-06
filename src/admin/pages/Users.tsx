import React, { useState } from 'react';
import { Plus, Trash2, Shield, User } from 'lucide-react';

type Role = 'admin' | 'manager' | 'support' | 'marketing';
type AdminUser = { id: string; name: string; email: string; role: Role; active: boolean };

const ROLES: Record<Role, { label: string; color: string; bg: string }> = {
  admin:     { label: 'مدير النظام', color: '#EF4444', bg: '#FEF2F2' },
  manager:   { label: 'مدير المتجر', color: '#C77D8A', bg: '#F3E6E8' },
  support:   { label: 'دعم العملاء', color: '#3B82F6', bg: '#EBF5FF' },
  marketing: { label: 'تسويق', color: '#F59E0B', bg: '#FFF7ED' },
};

const STORED_KEY = 'almaasa_users';
const load = (): AdminUser[] => { try { return JSON.parse(localStorage.getItem(STORED_KEY) || '[]'); } catch { return []; } };
const persist = (u: AdminUser[]) => localStorage.setItem(STORED_KEY, JSON.stringify(u));

export default function Users() {
  const [users, setUsers] = useState<AdminUser[]>(load);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', role: 'support' as Role });

  const save = () => {
    if (!form.name || !form.email) return;
    const next = [...users, { ...form, id: `user_${Date.now()}`, active: true }];
    persist(next);
    setUsers(next);
    setAdding(false);
    setForm({ name: '', email: '', role: 'support' });
  };

  const del = (id: string) => {
    const next = users.filter(u => u.id !== id);
    persist(next);
    setUsers(next);
  };

  const toggleActive = (id: string) => {
    const next = users.map(u => u.id === id ? { ...u, active: !u.active } : u);
    persist(next);
    setUsers(next);
  };

  return (
    <div className="max-w-3xl space-y-4" dir="rtl">
      <div className="flex items-center justify-between">
        <h2 className="font-black text-lg" style={{ color: '#5A4047' }}>المستخدمون</h2>
        <button onClick={() => setAdding(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold" style={{ background: '#D79AA8', color: 'white' }}>
          <Plus className="w-4 h-4" /> إضافة مستخدم
        </button>
      </div>

      {adding && (
        <div className="rounded-2xl p-5 space-y-4" style={{ background: '#FFFFFF', border: '1px solid #F0DDE0' }}>
          <h3 className="font-black text-sm" style={{ color: '#5A4047' }}>مستخدم جديد</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: '#5A4047' }}>الاسم</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-xl px-3 py-2 text-sm outline-none" style={{ border: '1px solid #F0DDE0', background: '#FFF8F8', color: '#5A4047' }} />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: '#5A4047' }}>البريد الإلكتروني</label>
              <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-xl px-3 py-2 text-sm outline-none" style={{ border: '1px solid #F0DDE0', background: '#FFF8F8', color: '#5A4047' }} dir="ltr" />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: '#5A4047' }}>الصلاحية</label>
              <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value as Role })}
                className="w-full rounded-xl px-3 py-2 text-sm outline-none" style={{ border: '1px solid #F0DDE0', background: '#FFF8F8', color: '#5A4047' }}>
                {Object.entries(ROLES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setAdding(false)} className="px-4 py-2 rounded-xl text-xs font-bold" style={{ background: '#F3E6E8', color: '#C77D8A' }}>إلغاء</button>
            <button onClick={save} className="px-4 py-2 rounded-xl text-xs font-bold" style={{ background: '#D79AA8', color: 'white' }}>حفظ</button>
          </div>
        </div>
      )}

      <div className="rounded-2xl overflow-hidden" style={{ background: '#FFFFFF', border: '1px solid #F0DDE0' }}>
        {users.length === 0 ? (
          <div className="py-16 text-center">
            <Shield className="w-8 h-8 mx-auto mb-2" style={{ color: '#D79AA8' }} />
            <p className="text-sm font-bold" style={{ color: '#5A4047' }}>لا يوجد مستخدمون</p>
          </div>
        ) : users.map((u, i) => (
          <div key={u.id} className={`flex items-center gap-3 px-4 py-3 ${i > 0 ? 'border-t' : ''}`} style={{ borderColor: '#F0DDE0' }}>
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-black text-sm shrink-0"
              style={{ background: 'linear-gradient(135deg,#D79AA8,#C77D8A)' }}>
              {u.name.charAt(0)}
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm" style={{ color: '#5A4047' }}>{u.name}</p>
              <p className="text-xs" style={{ color: '#D79AA8' }}>{u.email}</p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0"
              style={{ background: ROLES[u.role].bg, color: ROLES[u.role].color }}>
              {ROLES[u.role].label}
            </span>
            <button onClick={() => toggleActive(u.id)} className="px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0"
              style={{ background: u.active ? '#DCFCE7' : '#F3F4F6', color: u.active ? '#16A34A' : '#6B7280' }}>
              {u.active ? 'نشط' : 'معطل'}
            </button>
            <button onClick={() => del(u.id)} className="p-1.5 rounded-lg hover:bg-[#FEF2F2] shrink-0">
              <Trash2 className="w-3.5 h-3.5" style={{ color: '#EF4444' }} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
