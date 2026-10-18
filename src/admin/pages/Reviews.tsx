import React, { useState } from 'react';
import { Star, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { getStoredData, saveStoredData } from '../../data';

export default function Reviews() {
  const [data, setData] = useState(() => getStoredData());
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending'>('all');

  const reviews = (data.reviews || []).filter((r: any) => {
    if (filter === 'approved') return r.approved;
    if (filter === 'pending') return !r.approved;
    return true;
  });

  const toggle = (id: string) => {
    const updated = { ...data, reviews: data.reviews.map((r: any) => r.id === id ? { ...r, approved: !r.approved } : r) };
    saveStoredData(updated);
    setData(updated);
  };

  const del = (id: string) => {
    const updated = { ...data, reviews: data.reviews.filter((r: any) => r.id !== id) };
    saveStoredData(updated);
    setData(updated);
  };

  const avg = reviews.length > 0 ? reviews.reduce((s: number, r: any) => s + (r.rating || 0), 0) / reviews.length : 0;

  return (
    <div className="space-y-4" dir="rtl">
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-[20px] p-4 text-center" style={{ background: '#FFF8F8' }}>
          <p className="text-3xl font-black" style={{ color: '#C77D8A' }}>{(data.reviews || []).length}</p>
          <p className="text-xs mt-1" style={{ color: '#D79AA8' }}>إجمالي التقييمات</p>
        </div>
        <div className="rounded-[20px] p-4 text-center" style={{ background: '#FFF8F8' }}>
          <p className="text-3xl font-black" style={{ color: '#F59E0B' }}>{avg.toFixed(1)} ★</p>
          <p className="text-xs mt-1" style={{ color: '#D79AA8' }}>متوسط التقييم</p>
        </div>
        <div className="rounded-[20px] p-4 text-center" style={{ background: '#FFF8F8' }}>
          <p className="text-3xl font-black" style={{ color: '#F59E0B' }}>{(data.reviews || []).filter((r: any) => !r.approved).length}</p>
          <p className="text-xs mt-1" style={{ color: '#D79AA8' }}>في الانتظار</p>
        </div>
      </div>

      <div className="flex gap-2">
        {(['all','approved','pending'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="px-3 py-1.5 rounded-full text-xs font-bold"
            style={{ background: filter === f ? '#D79AA8' : '#FFFFFF', color: filter === f ? 'white' : '#5A4047', border: '1px solid #F0DDE0' }}>
            {f === 'all' ? 'الكل' : f === 'approved' ? 'موافق عليها' : 'قيد المراجعة'}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {reviews.length === 0 ? (
          <div className="py-16 text-center rounded-[28px]" style={{ boxShadow: '0 4px 6px -1px rgba(26,13,17,.07), 0 2px 4px -2px rgba(26,13,17,.06)', background: '#FFFFFF' }}>
            <Star className="w-8 h-8 mx-auto mb-2" style={{ color: '#D79AA8' }} />
            <p className="text-sm font-bold" style={{ color: '#5A4047' }}>لا توجد تقييمات</p>
          </div>
        ) : reviews.map((r: any) => (
          <div key={r.id} className="rounded-[28px] p-4" style={{ boxShadow: '0 4px 6px -1px rgba(26,13,17,.07), 0 2px 4px -2px rgba(26,13,17,.06)', background: '#FFFFFF' }}>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-black shrink-0"
                style={{ background: 'linear-gradient(135deg,#D79AA8,#C77D8A)' }}>
                {r.customerName?.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-sm" style={{ color: '#5A4047' }}>{r.customerName}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3" style={{ color: '#F59E0B' }} fill={i <= r.rating ? '#F59E0B' : 'none'} />)}
                      <span className="text-xs" style={{ color: '#D79AA8' }}>{r.date?.substring(0,10)}</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => toggle(r.id)} className="p-1.5 rounded-full" style={{ background: r.approved ? '#FEF2F2' : '#F0FDF4' }}>
                      {r.approved ? <XCircle className="w-4 h-4" style={{ color: '#EF4444' }} /> : <CheckCircle className="w-4 h-4" style={{ color: '#22C55E' }} />}
                    </button>
                    <button onClick={() => del(r.id)} className="p-1.5 rounded-full hover:bg-[#FEF2F2]">
                      <Trash2 className="w-4 h-4" style={{ color: '#EF4444' }} />
                    </button>
                  </div>
                </div>
                <p className="text-sm mt-2" style={{ color: '#5A4047' }}>{r.comment}</p>
                {r.productName && <p className="text-xs mt-1" style={{ color: '#D79AA8' }}>المنتج: {r.productName}</p>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
