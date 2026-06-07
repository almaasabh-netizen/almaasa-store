import React, { useState, useRef } from 'react';
import { Plus, Edit2, Trash2, Save, X, Image as ImageIcon } from 'lucide-react';
import { getStoredData, saveStoredData } from '../../data';

type Category = { id: string; name: string; nameEn: string; image: string; order: number };

export default function Categories() {
  const [data, setData] = useState(() => getStoredData());
  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: '', nameEn: '', image: '', order: 0 });

  const categories: Category[] = data.categories || [];

  const save = (id?: string) => {
    let updated;
    if (id) {
      updated = { ...data, categories: categories.map((c) => c.id === id ? { ...c, ...form } : c) };
    } else {
      updated = { ...data, categories: [...categories, { ...form, id: `cat_${Date.now()}` }] };
    }
    saveStoredData(updated);
    setData(updated);
    setEditing(null);
    setAdding(false);
    setForm({ name: '', nameEn: '', image: '', order: 0 });
  };

  const del = (id: string) => {
    if (!confirm('هل أنت متأكد؟')) return;
    const updated = { ...data, categories: categories.filter(c => c.id !== id) };
    saveStoredData(updated);
    setData(updated);
  };

  const startEdit = (c: Category) => {
    setEditing(c.id);
    setForm({ name: c.name, nameEn: c.nameEn || '', image: c.image || '', order: c.order || 0 });
  };

  return (
    <div className="max-w-3xl space-y-4" dir="rtl">
      <div className="flex items-center justify-between">
        <h2 className="font-black text-lg" style={{ color: '#5A4047' }}>التصنيفات</h2>
        <button onClick={() => { setAdding(true); setForm({ name: '', nameEn: '', image: '', order: 0 }); }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold"
          style={{ background: '#D79AA8', color: 'white' }}>
          <Plus className="w-4 h-4" /> إضافة تصنيف
        </button>
      </div>

      {adding && (
        <FormRow form={form} setForm={setForm} onSave={() => save()} onCancel={() => setAdding(false)} />
      )}

      <div className="rounded-2xl overflow-hidden" style={{ background: '#FFFFFF', border: '1px solid #F0DDE0' }}>
        {categories.length === 0 && !adding ? (
          <div className="py-16 text-center">
            <p className="text-3xl mb-2">🗂️</p>
            <p className="text-sm font-bold" style={{ color: '#5A4047' }}>لا توجد تصنيفات</p>
          </div>
        ) : categories.map((c, i) => (
          <div key={c.id}>
            {editing === c.id ? (
              <div className="p-4">
                <FormRow form={form} setForm={setForm} onSave={() => save(c.id)} onCancel={() => setEditing(null)} />
              </div>
            ) : (
              <div className={`flex items-center gap-3 px-4 py-3 ${i > 0 ? 'border-t' : ''}`} style={{ borderColor: '#F0DDE0' }}>
                {c.image && <img src={c.image} alt={c.name} referrerPolicy="no-referrer" className="w-12 h-12 rounded-xl object-cover shrink-0" />}
                <div className="flex-1">
                  <p className="font-bold text-sm" style={{ color: '#5A4047' }}>{c.name}</p>
                  {c.nameEn && <p className="text-xs" style={{ color: '#D79AA8' }}>{c.nameEn}</p>}
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#F3E6E8', color: '#C77D8A' }}>
                  {(data.products || []).filter((p: any) => p.category === c.name).length} منتج
                </span>
                <button onClick={() => startEdit(c)} className="p-1.5 rounded-lg hover:bg-[#F3E6E8]">
                  <Edit2 className="w-3.5 h-3.5" style={{ color: '#D79AA8' }} />
                </button>
                <button onClick={() => del(c.id)} className="p-1.5 rounded-lg hover:bg-[#FEF2F2]">
                  <Trash2 className="w-3.5 h-3.5" style={{ color: '#EF4444' }} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function FormRow({ form, setForm, onSave, onCancel }: any) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = e => setForm({ ...form, image: e.target?.result as string });
    reader.readAsDataURL(file);
  };

  return (
    <div className="rounded-xl p-4 space-y-3" style={{ background: '#FFF8F8', border: '1px solid #F0DDE0' }}>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold mb-1" style={{ color: '#5A4047' }}>الاسم (عربي)</label>
          <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-xl px-3 py-2 text-sm outline-none" style={{ border: '1px solid #F0DDE0', background: 'white', color: '#5A4047' }} />
        </div>
        <div>
          <label className="block text-xs font-bold mb-1" style={{ color: '#5A4047' }}>الاسم (إنجليزي)</label>
          <input value={form.nameEn} onChange={e => setForm({ ...form, nameEn: e.target.value })}
            className="w-full rounded-xl px-3 py-2 text-sm outline-none" style={{ border: '1px solid #F0DDE0', background: 'white', color: '#5A4047' }} dir="ltr" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-bold mb-1" style={{ color: '#5A4047' }}>صورة التصنيف</label>
        <div className="flex gap-2 items-center">
          <div
            className="w-16 h-16 rounded-xl overflow-hidden flex items-center justify-center cursor-pointer shrink-0"
            style={{ background: '#F3E6E8', border: '2px dashed #D79AA8' }}
            onClick={() => fileRef.current?.click()}>
            {form.image
              ? <img src={form.image} alt="" className="w-full h-full object-cover" />
              : <ImageIcon className="w-6 h-6" style={{ color: '#D79AA8' }} />}
          </div>
          <div className="flex-1 space-y-1.5">
            <button onClick={() => fileRef.current?.click()} type="button"
              className="text-xs font-bold px-3 py-1.5 rounded-lg"
              style={{ background: '#F3E6E8', color: '#C77D8A' }}>
              رفع صورة
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
            <input value={form.image?.startsWith('data:') ? '' : form.image}
              onChange={e => setForm({ ...form, image: e.target.value })}
              placeholder="أو الصق رابط URL..."
              className="w-full rounded-xl px-3 py-1.5 text-xs outline-none" style={{ border: '1px solid #F0DDE0', background: 'white', color: '#5A4047' }} dir="ltr" />
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={onCancel} className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold" style={{ background: '#F3E6E8', color: '#C77D8A' }}>
          <X className="w-3 h-3" /> إلغاء
        </button>
        <button onClick={onSave} className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold" style={{ background: '#D79AA8', color: 'white' }}>
          <Save className="w-3 h-3" /> حفظ
        </button>
      </div>
    </div>
  );
}
