import React, { useState } from 'react';
import { Plus, Trash2, Save, X, Truck } from 'lucide-react';
import { getStoredData, saveStoredData } from '../../data';

type ShippingZone = { id: string; name: string; cost: number; freeMin: number; days: string; active: boolean };

const BAHRAIN_AREAS = [
  'المنامة', 'المحرق', 'الرفاع', 'مدينة عيسى', 'مدينة حمد',
  'الجفير', 'البديع', 'الدراز', 'بلاد القديم', 'سترة',
  'عالي', 'الزنج', 'أبو صيبع', 'توبلي', 'الحد',
  'عراد', 'القضيبية', 'السنابس', 'جدحفص', 'الدير',
  'كرزكان', 'دار كليب', 'سار', 'الجسرة', 'دمستان',
  'المالكية', 'بوري', 'عسكر', 'النويدرات', 'قلالي',
  'جزيرة أمواج', 'ديار المحرق', 'خليج البحرين',
];

export default function Shipping() {
  const [data, setData] = useState(() => getStoredData());
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<Omit<ShippingZone,'id'>>({ name: '', cost: 1, freeMin: 20, days: '2-3', active: true });
  const [customName, setCustomName] = useState(false);

  const zones: ShippingZone[] = data.shippingZones || [];

  const save = () => {
    if (!form.name) return;
    const updated = { ...data, shippingZones: [...zones, { ...form, id: `sz_${Date.now()}` }] };
    saveStoredData(updated);
    setData(updated);
    setAdding(false);
    setForm({ name: '', cost: 1, freeMin: 20, days: '2-3', active: true });
  };

  const del = (id: string) => {
    const updated = { ...data, shippingZones: zones.filter(z => z.id !== id) };
    saveStoredData(updated);
    setData(updated);
  };

  const toggle = (id: string) => {
    const updated = { ...data, shippingZones: zones.map(z => z.id === id ? { ...z, active: !z.active } : z) };
    saveStoredData(updated);
    setData(updated);
  };

  const inp = 'w-full rounded-xl px-3 py-2 text-sm outline-none';
  const inpStyle = { border: '1px solid #F0DDE0', background: '#FFF8F8', color: '#5A4047' };

  return (
    <div className="max-w-3xl space-y-4" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-black text-lg" style={{ color: '#5A4047' }}>مناطق الشحن</h2>
          <p className="text-xs mt-0.5" style={{ color: '#D79AA8' }}>حدد تكاليف الشحن لكل منطقة</p>
        </div>
        <button onClick={() => setAdding(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold"
          style={{ background: '#D79AA8', color: 'white' }}>
          <Plus className="w-4 h-4" /> إضافة منطقة
        </button>
      </div>

      {adding && (
        <div className="rounded-2xl p-5 space-y-4" style={{ background: '#FFFFFF', border: '1px solid #F0DDE0' }}>
          <h3 className="font-black text-sm" style={{ color: '#5A4047' }}>منطقة جديدة</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold mb-1.5" style={{ color: '#5A4047' }}>اسم المنطقة</label>
              {customName ? (
                <div className="flex gap-1.5">
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                    className={inp + ' flex-1'} style={inpStyle} placeholder="اكتب اسم المنطقة..." autoFocus />
                  <button type="button" onClick={() => { setCustomName(false); setForm({ ...form, name: '' }); }}
                    className="px-2.5 rounded-xl text-xs" style={{ background: '#F3E6E8', color: '#C77D8A' }}>←</button>
                </div>
              ) : (
                <div className="flex gap-1.5">
                  <select value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                    className={inp + ' flex-1'} style={inpStyle}>
                    <option value="">-- اختر منطقة --</option>
                    {BAHRAIN_AREAS.filter(a => !zones.find(z => z.name === a)).map(a => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                  <button type="button" onClick={() => setCustomName(true)}
                    className="px-2.5 rounded-xl text-xs font-bold whitespace-nowrap"
                    style={{ background: '#F3E6E8', color: '#C77D8A' }}>+ منطقة أخرى</button>
                </div>
              )}
            </div>
            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: '#5A4047' }}>تكلفة الشحن (د.ب)</label>
              <input type="number" min={0} step={0.1} value={form.cost} onChange={e => setForm({ ...form, cost: Number(e.target.value) })}
                className={inp} style={inpStyle} dir="ltr" />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: '#5A4047' }}>شحن مجاني من (د.ب)</label>
              <input type="number" min={0} value={form.freeMin} onChange={e => setForm({ ...form, freeMin: Number(e.target.value) })}
                className={inp} style={inpStyle} dir="ltr" />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: '#5A4047' }}>مدة التوصيل (أيام)</label>
              <input value={form.days} onChange={e => setForm({ ...form, days: e.target.value })}
                className={inp} style={inpStyle} dir="ltr" placeholder="2-3" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setAdding(false)}
              className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold"
              style={{ background: '#F3E6E8', color: '#C77D8A' }}>
              <X className="w-3.5 h-3.5" /> إلغاء
            </button>
            <button onClick={save}
              className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold"
              style={{ background: '#D79AA8', color: 'white' }}>
              <Save className="w-3.5 h-3.5" /> حفظ
            </button>
          </div>
        </div>
      )}

      <div className="rounded-2xl overflow-hidden" style={{ background: '#FFFFFF', border: '1px solid #F0DDE0' }}>
        {zones.length === 0 && !adding ? (
          <div className="py-16 text-center">
            <Truck className="w-10 h-10 mx-auto mb-3" style={{ color: '#D79AA8' }} />
            <p className="font-bold text-sm" style={{ color: '#5A4047' }}>لا توجد مناطق شحن</p>
            <p className="text-xs mt-1" style={{ color: '#D79AA8' }}>أضف مناطق الشحن وتكاليفها</p>
          </div>
        ) : (
          <table className="w-full text-right">
            <thead>
              <tr style={{ background: '#FFF8F8' }}>
                {['المنطقة', 'تكلفة الشحن', 'شحن مجاني من', 'مدة التوصيل', 'الحالة', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-xs font-bold" style={{ color: '#D79AA8' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {zones.map((z, i) => (
                <tr key={z.id} className="border-t" style={{ borderColor: '#F0DDE0' }}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 shrink-0" style={{ color: '#D79AA8' }} />
                      <span className="font-bold text-sm" style={{ color: '#5A4047' }}>{z.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-black text-sm" style={{ color: '#C77D8A' }}>{z.cost} د.ب</td>
                  <td className="px-4 py-3 text-xs" style={{ color: '#5A4047' }}>{z.freeMin > 0 ? `${z.freeMin} د.ب` : '—'}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: '#5A4047' }}>{z.days} أيام</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold"
                      style={{ background: z.active ? '#DCFCE7' : '#F3F4F6', color: z.active ? '#16A34A' : '#6B7280' }}>
                      {z.active ? 'نشط' : 'معطل'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 justify-end">
                      <button onClick={() => toggle(z.id)}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-bold"
                        style={{ background: z.active ? '#FEF2F2' : '#F0FDF4', color: z.active ? '#EF4444' : '#22C55E' }}>
                        {z.active ? 'تعطيل' : 'تفعيل'}
                      </button>
                      <button onClick={() => del(z.id)} className="p-1.5 rounded-lg hover:bg-[#FEF2F2]">
                        <Trash2 className="w-3.5 h-3.5" style={{ color: '#EF4444' }} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
