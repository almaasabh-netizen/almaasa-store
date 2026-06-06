import React, { useState } from 'react';
import { Megaphone, Mail, MessageSquare, Bell, Plus, Send } from 'lucide-react';

type Campaign = { id: string; title: string; type: 'email' | 'whatsapp' | 'push'; message: string; status: 'draft' | 'sent'; date: string; reach: number };

const STORED_KEY = 'almaasa_campaigns';
const load = (): Campaign[] => { try { return JSON.parse(localStorage.getItem(STORED_KEY) || '[]'); } catch { return []; } };
const persist = (c: Campaign[]) => localStorage.setItem(STORED_KEY, JSON.stringify(c));

export default function Marketing() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(load);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ title: '', type: 'email' as Campaign['type'], message: '' });

  const save = () => {
    if (!form.title || !form.message) return;
    const next = [...campaigns, { ...form, id: `camp_${Date.now()}`, status: 'draft' as const, date: new Date().toISOString().slice(0,10), reach: 0 }];
    persist(next);
    setCampaigns(next);
    setAdding(false);
    setForm({ title: '', type: 'email', message: '' });
  };

  const send = (id: string) => {
    const next = campaigns.map(c => c.id === id ? { ...c, status: 'sent' as const, date: new Date().toISOString().slice(0,10), reach: Math.floor(Math.random() * 500 + 50) } : c);
    persist(next);
    setCampaigns(next);
  };

  const typeIcon = (t: string) => t === 'email' ? <Mail className="w-4 h-4" /> : t === 'whatsapp' ? <MessageSquare className="w-4 h-4" /> : <Bell className="w-4 h-4" />;
  const typeLabel = (t: string) => t === 'email' ? 'بريد إلكتروني' : t === 'whatsapp' ? 'واتساب' : 'إشعار';
  const typeColor = (t: string) => t === 'email' ? '#3B82F6' : t === 'whatsapp' ? '#22C55E' : '#F59E0B';

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex items-center justify-between">
        <h2 className="font-black text-lg" style={{ color: '#5A4047' }}>حملات التسويق</h2>
        <button onClick={() => setAdding(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold" style={{ background: '#D79AA8', color: 'white' }}>
          <Plus className="w-4 h-4" /> حملة جديدة
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'بريد إلكتروني', icon: <Mail className="w-5 h-5" />, color: '#3B82F6', bg: '#EBF5FF', count: campaigns.filter(c => c.type === 'email').length },
          { label: 'واتساب', icon: <MessageSquare className="w-5 h-5" />, color: '#22C55E', bg: '#F0FDF4', count: campaigns.filter(c => c.type === 'whatsapp').length },
          { label: 'إشعارات', icon: <Bell className="w-5 h-5" />, color: '#F59E0B', bg: '#FFF7ED', count: campaigns.filter(c => c.type === 'push').length },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-4 flex items-center gap-3" style={{ background: s.bg, border: `1px solid ${s.color}33` }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: s.color + '22', color: s.color }}>{s.icon}</div>
            <div>
              <p className="font-black text-lg" style={{ color: s.color }}>{s.count}</p>
              <p className="text-xs" style={{ color: s.color }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {adding && (
        <div className="rounded-2xl p-5 space-y-4" style={{ background: '#FFFFFF', border: '1px solid #F0DDE0' }}>
          <h3 className="font-black text-sm" style={{ color: '#5A4047' }}>إنشاء حملة</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: '#5A4047' }}>عنوان الحملة</label>
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                className="w-full rounded-xl px-3 py-2 text-sm outline-none" style={{ border: '1px solid #F0DDE0', background: '#FFF8F8', color: '#5A4047' }} />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: '#5A4047' }}>نوع الحملة</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value as any })}
                className="w-full rounded-xl px-3 py-2 text-sm outline-none" style={{ border: '1px solid #F0DDE0', background: '#FFF8F8', color: '#5A4047' }}>
                <option value="email">بريد إلكتروني</option>
                <option value="whatsapp">واتساب</option>
                <option value="push">إشعار</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold mb-1.5" style={{ color: '#5A4047' }}>نص الرسالة</label>
            <textarea rows={4} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
              className="w-full rounded-xl px-3 py-2 text-sm outline-none resize-none" style={{ border: '1px solid #F0DDE0', background: '#FFF8F8', color: '#5A4047' }} />
          </div>
          <div className="flex gap-2">
            <button onClick={() => setAdding(false)} className="px-4 py-2 rounded-xl text-xs font-bold" style={{ background: '#F3E6E8', color: '#C77D8A' }}>إلغاء</button>
            <button onClick={save} className="px-4 py-2 rounded-xl text-xs font-bold" style={{ background: '#D79AA8', color: 'white' }}>حفظ كمسودة</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {campaigns.length === 0 ? (
          <div className="py-16 text-center rounded-2xl" style={{ background: '#FFFFFF', border: '1px solid #F0DDE0' }}>
            <Megaphone className="w-8 h-8 mx-auto mb-2" style={{ color: '#D79AA8' }} />
            <p className="text-sm font-bold" style={{ color: '#5A4047' }}>لا توجد حملات بعد</p>
          </div>
        ) : campaigns.map(c => (
          <div key={c.id} className="rounded-2xl p-4 flex items-center gap-4" style={{ background: '#FFFFFF', border: '1px solid #F0DDE0' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: typeColor(c.type) + '20', color: typeColor(c.type) }}>
              {typeIcon(c.type)}
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm" style={{ color: '#5A4047' }}>{c.title}</p>
              <p className="text-xs mt-0.5 line-clamp-1" style={{ color: '#D79AA8' }}>{c.message}</p>
            </div>
            <div className="text-center shrink-0">
              <p className="font-bold text-xs" style={{ color: typeColor(c.type) }}>{typeLabel(c.type)}</p>
              {c.status === 'sent' && <p className="text-[10px]" style={{ color: '#D79AA8' }}>{c.reach} وصول</p>}
            </div>
            <span className="px-2 py-1 rounded-full text-[11px] font-bold shrink-0"
              style={{ background: c.status === 'sent' ? '#DCFCE7' : '#FFF7ED', color: c.status === 'sent' ? '#16A34A' : '#F59E0B' }}>
              {c.status === 'sent' ? 'مُرسل' : 'مسودة'}
            </span>
            {c.status === 'draft' && (
              <button onClick={() => send(c.id)} className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold shrink-0"
                style={{ background: '#D79AA8', color: 'white' }}>
                <Send className="w-3 h-3" /> إرسال
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
