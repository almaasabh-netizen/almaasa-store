import React, { useState } from 'react';
import { AlertTriangle, Package, Edit2, Save, X } from 'lucide-react';
import { getStoredData, saveStoredData } from '../../data';

export default function Inventory() {
  const [data, setData] = useState(() => getStoredData());
  const [editing, setEditing] = useState<string | null>(null);
  const [editVal, setEditVal] = useState(0);

  const products = (data.products || []).filter((p: any) => !p.isDraft);
  const lowStock = products.filter((p: any) => p.stock <= 5);
  const outOfStock = products.filter((p: any) => !p.stock || p.stock === 0);

  const saveStock = (id: string) => {
    const updated = { ...data, products: data.products.map((p: any) => p.id === id ? { ...p, stock: editVal } : p) };
    saveStoredData(updated);
    setData(updated);
    setEditing(null);
  };

  return (
    <div className="space-y-4" dir="rtl">
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'إجمالي المنتجات', value: products.length, color: '#D79AA8', bg: '#F3E6E8' },
          { label: 'مخزون منخفض', value: lowStock.length, color: '#F59E0B', bg: '#FFF7ED' },
          { label: 'نفد المخزون', value: outOfStock.length, color: '#EF4444', bg: '#FEF2F2' },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-4 text-center" style={{ background: s.bg, border: `1px solid ${s.color}33` }}>
            <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs font-medium mt-1" style={{ color: s.color }}>{s.label}</p>
          </div>
        ))}
      </div>

      {lowStock.length > 0 && (
        <div className="rounded-2xl p-4" style={{ background: '#FFF7ED', border: '1px solid #FED7AA' }}>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4" style={{ color: '#F59E0B' }} />
            <p className="font-black text-sm" style={{ color: '#5A4047' }}>منتجات تحتاج تجديد المخزون</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {lowStock.map((p: any) => (
              <span key={p.id} className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: '#FFFFFF', color: '#F59E0B' }}>
                {p.name} — {p.stock} قطعة
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-2xl overflow-hidden" style={{ background: '#FFFFFF', border: '1px solid #F0DDE0' }}>
        <table className="w-full text-right">
          <thead>
            <tr style={{ background: '#FFF8F8' }}>
              {['المنتج','التصنيف','المخزون الحالي','الحالة','تعديل'].map(h => (
                <th key={h} className="px-4 py-3 text-xs font-bold" style={{ color: '#D79AA8' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-sm" style={{ color: '#D79AA8' }}>لا توجد منتجات</td></tr>
            ) : products.map((p: any, i: number) => (
              <tr key={p.id} className="border-t" style={{ borderColor: '#F0DDE0' }}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {p.image ? <img src={p.image} alt={p.name} referrerPolicy="no-referrer" className="w-9 h-9 rounded-xl object-cover shrink-0" /> : <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#F3E6E8' }}><Package className="w-4 h-4" style={{ color: '#D79AA8' }} /></div>}
                    <p className="text-xs font-bold" style={{ color: '#5A4047' }}>{p.name}</p>
                  </div>
                </td>
                <td className="px-4 py-3"><span className="text-xs" style={{ color: '#D79AA8' }}>{p.category || '—'}</span></td>
                <td className="px-4 py-3">
                  {editing === p.id ? (
                    <input type="number" value={editVal} onChange={e => setEditVal(Number(e.target.value))} min={0}
                      className="w-20 rounded-lg px-2 py-1 text-sm outline-none" style={{ border: '1px solid #D79AA8', color: '#5A4047' }} dir="ltr" autoFocus />
                  ) : (
                    <span className="font-black text-sm" style={{ color: '#5A4047' }}>{p.stock || 0}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold"
                    style={{ background: !p.stock ? '#FEF2F2' : p.stock <= 5 ? '#FFF7ED' : '#F0FDF4', color: !p.stock ? '#EF4444' : p.stock <= 5 ? '#F59E0B' : '#22C55E' }}>
                    {!p.stock ? 'نفد' : p.stock <= 5 ? 'منخفض' : 'متوفر'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {editing === p.id ? (
                    <div className="flex gap-1">
                      <button onClick={() => saveStock(p.id)} className="p-1.5 rounded-lg" style={{ background: '#F0FDF4' }}><Save className="w-3.5 h-3.5" style={{ color: '#22C55E' }} /></button>
                      <button onClick={() => setEditing(null)} className="p-1.5 rounded-lg" style={{ background: '#FEF2F2' }}><X className="w-3.5 h-3.5" style={{ color: '#EF4444' }} /></button>
                    </div>
                  ) : (
                    <button onClick={() => { setEditing(p.id); setEditVal(p.stock || 0); }} className="p-1.5 rounded-lg hover:bg-[#F3E6E8]">
                      <Edit2 className="w-3.5 h-3.5" style={{ color: '#D79AA8' }} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
