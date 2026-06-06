import React, { useState } from 'react';
import { MessageSquare, CheckCircle, Clock, AlertCircle } from 'lucide-react';

type Ticket = { id: string; customer: string; phone: string; subject: string; message: string; status: 'open' | 'inprogress' | 'closed'; date: string; priority: 'low' | 'medium' | 'high' };

const STORED_KEY = 'almaasa_tickets';
const load = (): Ticket[] => { try { return JSON.parse(localStorage.getItem(STORED_KEY) || '[]'); } catch { return []; } };
const persist = (t: Ticket[]) => localStorage.setItem(STORED_KEY, JSON.stringify(t));

const STATUS = {
  open:       { label: 'مفتوح',     color: '#EF4444', bg: '#FEF2F2', Icon: AlertCircle },
  inprogress: { label: 'قيد المعالجة', color: '#F59E0B', bg: '#FFF7ED', Icon: Clock },
  closed:     { label: 'مغلق',      color: '#22C55E', bg: '#DCFCE7', Icon: CheckCircle },
};

const PRIORITY = {
  low:    { label: 'منخفض', color: '#22C55E' },
  medium: { label: 'متوسط', color: '#F59E0B' },
  high:   { label: 'عالي',  color: '#EF4444' },
};

export default function Support() {
  const [tickets, setTickets] = useState<Ticket[]>(load);
  const [selected, setSelected] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | Ticket['status']>('all');

  const shown = filter === 'all' ? tickets : tickets.filter(t => t.status === filter);
  const current = tickets.find(t => t.id === selected);

  const updateStatus = (id: string, status: Ticket['status']) => {
    const next = tickets.map(t => t.id === id ? { ...t, status } : t);
    persist(next);
    setTickets(next);
  };

  return (
    <div className="space-y-4" dir="rtl">
      <div className="grid grid-cols-3 gap-4">
        {(['open','inprogress','closed'] as const).map(s => (
          <div key={s} className="rounded-2xl p-4 text-center cursor-pointer" style={{ background: STATUS[s].bg, border: `1px solid ${STATUS[s].color}33` }} onClick={() => setFilter(s)}>
            <p className="text-2xl font-black" style={{ color: STATUS[s].color }}>{tickets.filter(t => t.status === s).length}</p>
            <p className="text-xs font-medium mt-1" style={{ color: STATUS[s].color }}>{STATUS[s].label}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        {(['all','open','inprogress','closed'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold"
            style={{ background: filter === f ? '#D79AA8' : '#FFFFFF', color: filter === f ? 'white' : '#5A4047', border: '1px solid #F0DDE0' }}>
            {f === 'all' ? 'الكل' : STATUS[f].label}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <div className="py-16 text-center rounded-2xl" style={{ background: '#FFFFFF', border: '1px solid #F0DDE0' }}>
          <MessageSquare className="w-8 h-8 mx-auto mb-2" style={{ color: '#D79AA8' }} />
          <p className="text-sm font-bold" style={{ color: '#5A4047' }}>لا توجد تذاكر دعم</p>
          <p className="text-xs mt-1" style={{ color: '#D79AA8' }}>ستظهر استفسارات العملاء هنا</p>
        </div>
      ) : (
        <div className="space-y-3">
          {shown.map(t => {
            const S = STATUS[t.status];
            const P = PRIORITY[t.priority];
            return (
              <div key={t.id} className="rounded-2xl p-4 cursor-pointer hover:shadow-sm transition-shadow"
                style={{ background: '#FFFFFF', border: `1px solid ${selected === t.id ? '#D79AA8' : '#F0DDE0'}` }}
                onClick={() => setSelected(selected === t.id ? null : t.id)}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-black text-sm shrink-0"
                    style={{ background: 'linear-gradient(135deg,#D79AA8,#C77D8A)' }}>
                    {t.customer.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm" style={{ color: '#5A4047' }}>{t.subject}</p>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: P.color + '20', color: P.color }}>{P.label}</span>
                    </div>
                    <p className="text-xs" style={{ color: '#D79AA8' }}>{t.customer} · {t.phone} · {t.date}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0" style={{ background: S.bg, color: S.color }}>{S.label}</span>
                </div>
                {selected === t.id && (
                  <div className="mt-3 pt-3 border-t" style={{ borderColor: '#F0DDE0' }}>
                    <p className="text-sm mb-3" style={{ color: '#5A4047' }}>{t.message}</p>
                    <div className="flex gap-2">
                      {(['open','inprogress','closed'] as const).map(s => (
                        <button key={s} onClick={e => { e.stopPropagation(); updateStatus(t.id, s); }}
                          className="px-3 py-1 rounded-xl text-xs font-bold"
                          style={{ background: t.status === s ? STATUS[s].color : STATUS[s].bg, color: t.status === s ? 'white' : STATUS[s].color }}>
                          {STATUS[s].label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
