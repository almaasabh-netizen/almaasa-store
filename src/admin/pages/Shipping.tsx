import React, { useState } from 'react';
import { Plus, Trash2, Save, X, Truck, CheckSquare, Square } from 'lucide-react';
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
  const [selected, setSelected] = useState<string[]>([]);
  const [cost, setCost] = useState(1);
  const [freeMin, setFreeMin] = useState(20);
  const [days, setDays] = useState('2-3');

  const zones: ShippingZone[] = data.shippingZones || [];
  const available = BAHRAIN_AREAS.filter(a => !zones.find(z => z.name === a));

  const toggleArea = (area: string) =>
    setSelected(prev => prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]);

  const selectAll = () =>
    setSelected(selected.length === available.length ? [] : [...available]);

  const save = () => {
    if (selected.length === 0) return;
    const newZones = selected.map(name => ({
      id: `sz_${Date.now()}_${Math.random().toString(36).slice(2,6)}`,
      name, cost, freeMin, days, active: true,
    }));
    const updated = { ...data, shippingZones: [...zones, ...newZones] };
    saveStoredData(updated);
    setData(updated);
    setAdding(false);
    setSelected([]);
    setCost(1); setFreeMin(20); setDays('2-3');
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
    <div className="max-w-4xl space-y-4" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-black text-lg" style={{ color: '#5A4047' }}>مناطق الشحن</h2>
          <p className="text-xs mt-0.5" style={{ color: '#D79AA8' }}>حدد تكاليف الشحن لكل منطقة</p>
        </div>
        {!adding && (
          <button onClick={() => setAdding(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold"
            style={{ background: '#D79AA8', color: 'white' }}>
            <Plus className="w-4 h-4" /> إضافة مناطق
          </button>
        )}
      </div>

      {adding && (
        <div className="rounded-2xl p-5 space-y-5" style={{ background: '#FFFFFF', border: '1px solid #F0DDE0' }}>
          <div className="flex items-center justify-between">
            <h3 className="font-black text-sm" style={{ color: '#5A4047' }}>اختر المناطق</h3>
            <button onClick={selectAll} className="flex items-center gap-1.5 text-xs font-bold"
              style={{ color: '#D79AA8' }}>
              {selected.length === available.length
                ? <><CheckSquare className="w-4 h-4" /> إلغاء تحديد الكل</>
                : <><Square className="w-4 h-4" /> تحديد الكل</>}
            </button>
          </div>

          {/* Areas grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
            {available.map(area => {
              const checked = selected.includes(area);
              return (
                <button key={area} onClick={() => toggleArea(area)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-right transition-all"
                  style={{
                    background: checked ? '#F3E6E8' : '#FFF8F8',
                    border: `1px solid ${checked ? '#D79AA8' : '#F0DDE0'}`,
                    color: checked ? '#C77D8A' : '#5A4047',
                  }}>
                  <div className="w-3.5 h-3.5 rounded shrink-0 flex items-center justify-center"
                    style={{ background: checked ? '#D79AA8' : 'transparent', border: checked ? 'none' : '1.5px solid #D79AA8' }}>
                    {checked && <span className="text-white text-[9px] font-black">✓</span>}
                  </div>
                  {area}
                </button>
              );
            })}
            {available.length === 0 && (
              <p className="col-span-full text-xs text-center py-4" style={{ color: '#D79AA8' }}>
                جميع المناطق مضافة بالفعل
              </p>
            )}
          </div>

          {selected.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold"
              style={{ background: '#F3E6E8', color: '#C77D8A' }}>
              ✓ تم اختيار {selected.length} منطقة
            </div>
          )}

          {/* Shared settings */}
          <div className="grid grid-cols-3 gap-4 pt-1">
            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: '#5A4047' }}>تكلفة الشحن (د.ب)</label>
              <input type="number" min={0} step={0.1} value={cost}
                onChange={e => setCost(Number(e.target.value))}
                className={inp} style={inpStyle} dir="ltr" />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: '#5A4047' }}>شحن مجاني من (د.ب)</label>
              <input type="number" min={0} value={freeMin}
                onChange={e => setFreeMin(Number(e.target.value))}
                className={inp} style={inpStyle} dir="ltr" />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: '#5A4047' }}>مدة التوصيل (أيام)</label>
              <input value={days} onChange={e => setDays(e.target.value)}
                className={inp} style={inpStyle} dir="ltr" placeholder="2-3" />
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={() => { setAdding(false); setSelected([]); }}
              className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold"
              style={{ background: '#F3E6E8', color: '#C77D8A' }}>
              <X className="w-3.5 h-3.5" /> إلغاء
            </button>
            <button onClick={save} disabled={selected.length === 0}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold disabled:opacity-50"
              style={{ background: '#D79AA8', color: 'white' }}>
              <Save className="w-3.5 h-3.5" />
              حفظ {selected.length > 0 ? `(${selected.length} مناطق)` : ''}
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: '#FFFFFF', border: '1px solid #F0DDE0' }}>
        {zones.length === 0 && !adding ? (
          <div className="py-16 text-center">
            <Truck className="w-10 h-10 mx-auto mb-3" style={{ color: '#D79AA8' }} />
            <p className="font-bold text-sm" style={{ color: '#5A4047' }}>لا توجد مناطق شحن</p>
            <p className="text-xs mt-1" style={{ color: '#D79AA8' }}>أضف مناطق الشحن وتكاليفها</p>
          </div>
        ) : zones.length > 0 && (
          <table className="w-full text-right">
            <thead>
              <tr style={{ background: '#FFF8F8' }}>
                {['المنطقة','تكلفة الشحن','شحن مجاني من','مدة التوصيل','الحالة',''].map(h => (
                  <th key={h} className="px-4 py-3 text-xs font-bold" style={{ color: '#D79AA8' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {zones.map(z => (
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
