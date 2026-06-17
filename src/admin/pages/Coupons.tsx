import React, { useState } from 'react';
import { Plus, Trash2, Tag, Copy } from 'lucide-react';
import { getStoredData, saveStoredData } from '../../data';

type Coupon = { id: string; code: string; type: 'percent' | 'fixed'; value: number; minOrder: number; maxUses: number; uses: number; expiry: string; active: boolean };

export default function Coupons() {
  const [data, setData] = useState(() => getStoredData());
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<Omit<Coupon,'id'|'uses'>>({ code: '', type: 'percent', value: 10, minOrder: 0, maxUses: 100, expiry: '', active: true });

  const coupons: Coupon[] = data.coupons || [];

  const save = () => {
    if (!form.code) return;
    const newCoupon = {
      ...form,
      id: `coup_${Date.now()}`,
      uses: 0,
      // storefront-compatible fields
      discount: form.value,
      isActive: form.active,
      type: form.type === 'percent' ? 'percentage' : 'fixed',
      usageCount: 0,
    };
    const updated = { ...data, coupons: [...coupons, newCoupon] };
    saveStoredData(updated);
    setData(updated);
    setAdding(false);
    setForm({ code: '', type: 'percent', value: 10, minOrder: 0, maxUses: 100, expiry: '', active: true });
  };

  const del = (id: string) => {
    const updated = { ...data, coupons: coupons.filter(c => c.id !== id) };
    saveStoredData(updated);
    setData(updated);
  };

  const toggle = (id: string) => {
    const updated = { ...data, coupons: coupons.map(c => c.id === id ? { ...c, active: !c.active, isActive: !c.active } : c) };
    saveStoredData(updated);
    setData(updated);
  };

  return (
    <div className="max-w-4xl space-y-4" dir="rtl">
      <div className="flex items-center justify-between">
        <h2 className="font-black text-lg" style={{ color: '#5A4047' }}>كوبونات الخصم</h2>
        <button onClick={() => setAdding(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold" style={{ background: '#D79AA8', color: 'white' }}>
          <Plus className="w-4 h-4" /> كوبون جديد
        </button>
      </div>

      {adding && (
        <div className="rounded-2xl p-5 space-y-4" style={{ background: '#FFFFFF', border: '1px solid #F0DDE0' }}>
          <h3 className="font-black text-sm" style={{ color: '#5A4047' }}>إضافة كوبون</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: '#5A4047' }}>كود الكوبون</label>
              <input value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                className="w-full rounded-xl px-3 py-2 text-sm outline-none uppercase" style={{ border: '1px solid #F0DDE0', background: '#FFF8F8', color: '#5A4047' }} dir="ltr" />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: '#5A4047' }}>نوع الخصم</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value as any })}
                className="w-full rounded-xl px-3 py-2 text-sm outline-none" style={{ border: '1px solid #F0DDE0', background: '#FFF8F8', color: '#5A4047' }}>
                <option value="percent">نسبة مئوية %</option>
                <option value="fixed">مبلغ ثابت د.ب</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: '#5A4047' }}>قيمة الخصم</label>
              <input type="number" min={0} value={form.value} onChange={e => setForm({ ...form, value: Number(e.target.value) })}
                className="w-full rounded-xl px-3 py-2 text-sm outline-none" style={{ border: '1px solid #F0DDE0', background: '#FFF8F8', color: '#5A4047' }} dir="ltr" />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: '#5A4047' }}>الحد الأدنى للطلب</label>
              <input type="number" min={0} value={form.minOrder} onChange={e => setForm({ ...form, minOrder: Number(e.target.value) })}
                className="w-full rounded-xl px-3 py-2 text-sm outline-none" style={{ border: '1px solid #F0DDE0', background: '#FFF8F8', color: '#5A4047' }} dir="ltr" />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: '#5A4047' }}>الحد الأقصى للاستخدام</label>
              <input type="number" min={1} value={form.maxUses} onChange={e => setForm({ ...form, maxUses: Number(e.target.value) })}
                className="w-full rounded-xl px-3 py-2 text-sm outline-none" style={{ border: '1px solid #F0DDE0', background: '#FFF8F8', color: '#5A4047' }} dir="ltr" />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: '#5A4047' }}>تاريخ الانتهاء</label>
              <input type="date" value={form.expiry} onChange={e => setForm({ ...form, expiry: e.target.value })}
                className="w-full rounded-xl px-3 py-2 text-sm outline-none" style={{ border: '1px solid #F0DDE0', background: '#FFF8F8', color: '#5A4047' }} dir="ltr" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setAdding(false)} className="px-4 py-2 rounded-xl text-xs font-bold" style={{ background: '#F3E6E8', color: '#C77D8A' }}>إلغاء</button>
            <button onClick={save} className="px-4 py-2 rounded-xl text-xs font-bold" style={{ background: '#D79AA8', color: 'white' }}>حفظ الكوبون</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {coupons.length === 0 ? (
          <div className="py-16 text-center rounded-2xl" style={{ background: '#FFFFFF', border: '1px solid #F0DDE0' }}>
            <Tag className="w-8 h-8 mx-auto mb-2" style={{ color: '#D79AA8' }} />
            <p className="text-sm font-bold" style={{ color: '#5A4047' }}>لا توجد كوبونات بعد</p>
          </div>
        ) : coupons.map(c => (
          <div key={c.id} className="rounded-2xl p-4 flex items-center gap-4" style={{ background: '#FFFFFF', border: '1px solid #F0DDE0' }}>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <code className="font-black text-base tracking-widest" style={{ color: '#C77D8A' }}>{c.code}</code>
                <button onClick={() => navigator.clipboard.writeText(c.code)} className="p-1 rounded-lg hover:bg-[#F3E6E8]">
                  <Copy className="w-3.5 h-3.5" style={{ color: '#D79AA8' }} />
                </button>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${c.active ? '' : 'opacity-50'}`} style={{ background: c.active ? '#DCFCE7' : '#F3F4F6', color: c.active ? '#16A34A' : '#6B7280' }}>
                  {c.active ? 'نشط' : 'معطل'}
                </span>
              </div>
              <p className="text-xs" style={{ color: '#D79AA8' }}>
                خصم {c.value}{c.type === 'percent' ? '%' : ' د.ب'}
                {c.minOrder > 0 && ` · حد أدنى ${c.minOrder} د.ب`}
                {c.expiry && ` · ينتهي ${c.expiry}`}
              </p>
            </div>
            <div className="text-center">
              <p className="font-black text-sm" style={{ color: '#5A4047' }}>{c.uses}/{c.maxUses}</p>
              <p className="text-[10px]" style={{ color: '#D79AA8' }}>استخدام</p>
            </div>
            <button onClick={() => toggle(c.id)} className="px-3 py-1.5 rounded-xl text-xs font-bold" style={{ background: c.active ? '#FEF2F2' : '#F0FDF4', color: c.active ? '#EF4444' : '#22C55E' }}>
              {c.active ? 'تعطيل' : 'تفعيل'}
            </button>
            <button onClick={() => del(c.id)} className="p-1.5 rounded-lg hover:bg-[#FEF2F2]">
              <Trash2 className="w-4 h-4" style={{ color: '#EF4444' }} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
