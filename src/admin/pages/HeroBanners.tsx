import React, { useState, useRef } from 'react';
import { Plus, Trash2, Save, MoveUp, MoveDown, Image as ImageIcon, Eye, EyeOff } from 'lucide-react';

export type HeroBanner = {
  id: string;
  image: string; // base64 or URL
  subtitle: string;
  title: string;
  desc: string;
  active: boolean;
};

const STORED_KEY = 'almaasa_hero_banners';

export const loadBanners = (): HeroBanner[] => {
  try { return JSON.parse(localStorage.getItem(STORED_KEY) || '[]'); } catch { return []; }
};
const saveBanners = (b: HeroBanner[]) => localStorage.setItem(STORED_KEY, JSON.stringify(b));

export default function HeroBanners() {
  const [banners, setBanners] = useState<HeroBanner[]>(loadBanners);
  const [editing, setEditing] = useState<string | null>(null);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const update = (next: HeroBanner[]) => { saveBanners(next); setBanners(next); };

  const add = () => {
    const nb: HeroBanner = {
      id: `banner_${Date.now()}`,
      image: '',
      subtitle: 'أناقة تنبض بالأنوثة',
      title: 'مخاوير راقية\nلتألقي في كل مناسبة',
      desc: 'تصاميم فاخرة بأقمشة ناعمة وحالية',
      active: true,
    };
    update([...banners, nb]);
    setEditing(nb.id);
  };

  const del = (id: string) => update(banners.filter(b => b.id !== id));

  const toggleActive = (id: string) => update(banners.map(b => b.id === id ? { ...b, active: !b.active } : b));

  const move = (id: string, dir: -1 | 1) => {
    const i = banners.findIndex(b => b.id === id);
    if (i + dir < 0 || i + dir >= banners.length) return;
    const next = [...banners];
    [next[i], next[i + dir]] = [next[i + dir], next[i]];
    update(next);
  };

  const patch = (id: string, field: keyof HeroBanner, val: string | boolean) =>
    update(banners.map(b => b.id === id ? { ...b, [field]: val } : b));

  const handleFile = (id: string, file: File) => {
    const reader = new FileReader();
    reader.onload = e => patch(id, 'image', e.target?.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4 max-w-4xl" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-black text-lg" style={{ color: '#5A4047' }}>Hero Banners</h2>
          <p className="text-xs mt-0.5" style={{ color: '#D79AA8' }}>صور وتفاصيل السلايدر الرئيسي في الواجهة</p>
        </div>
        <button onClick={add}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold"
          style={{ background: '#D79AA8', color: 'white' }}>
          <Plus className="w-4 h-4" /> إضافة بانر
        </button>
      </div>

      {banners.length === 0 && (
        <div className="py-20 text-center rounded-2xl" style={{ background: '#FFFFFF', border: '1px solid #F0DDE0' }}>
          <ImageIcon className="w-10 h-10 mx-auto mb-3" style={{ color: '#D79AA8' }} />
          <p className="font-bold text-sm" style={{ color: '#5A4047' }}>لا توجد بانرات بعد</p>
          <p className="text-xs mt-1" style={{ color: '#D79AA8' }}>اضغط "إضافة بانر" لإنشاء أول سلايد</p>
        </div>
      )}

      <div className="space-y-4">
        {banners.map((b, i) => (
          <div key={b.id} className="rounded-2xl overflow-hidden" style={{ background: '#FFFFFF', border: `2px solid ${editing === b.id ? '#D79AA8' : '#F0DDE0'}` }}>
            {/* Header row */}
            <div className="flex items-center gap-3 px-4 py-3" style={{ background: '#FFF8F8', borderBottom: '1px solid #F0DDE0' }}>
              <span className="w-6 h-6 rounded-full text-xs font-black flex items-center justify-center shrink-0"
                style={{ background: '#D79AA8', color: 'white' }}>{i + 1}</span>
              <p className="font-bold text-sm flex-1 truncate" style={{ color: '#5A4047' }}>
                {b.subtitle || 'بانر بدون عنوان فرعي'}
              </p>
              <div className="flex items-center gap-1">
                <button onClick={() => move(b.id, -1)} disabled={i === 0}
                  className="p-1.5 rounded-lg disabled:opacity-30 hover:bg-[#F3E6E8]">
                  <MoveUp className="w-3.5 h-3.5" style={{ color: '#D79AA8' }} />
                </button>
                <button onClick={() => move(b.id, 1)} disabled={i === banners.length - 1}
                  className="p-1.5 rounded-lg disabled:opacity-30 hover:bg-[#F3E6E8]">
                  <MoveDown className="w-3.5 h-3.5" style={{ color: '#D79AA8' }} />
                </button>
                <button onClick={() => toggleActive(b.id)} className="p-1.5 rounded-lg hover:bg-[#F3E6E8]">
                  {b.active
                    ? <Eye className="w-3.5 h-3.5" style={{ color: '#22C55E' }} />
                    : <EyeOff className="w-3.5 h-3.5" style={{ color: '#D79AA8' }} />}
                </button>
                <button onClick={() => setEditing(editing === b.id ? null : b.id)}
                  className="px-3 py-1 rounded-lg text-xs font-bold"
                  style={{ background: editing === b.id ? '#D79AA8' : '#F3E6E8', color: editing === b.id ? 'white' : '#C77D8A' }}>
                  {editing === b.id ? 'إغلاق' : 'تعديل'}
                </button>
                <button onClick={() => del(b.id)} className="p-1.5 rounded-lg hover:bg-[#FEF2F2]">
                  <Trash2 className="w-3.5 h-3.5" style={{ color: '#EF4444' }} />
                </button>
              </div>
            </div>

            {/* Edit form */}
            {editing === b.id && (
              <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Image upload */}
                <div className="md:row-span-2">
                  <label className="block text-xs font-bold mb-2" style={{ color: '#5A4047' }}>صورة البانر</label>
                  <div
                    className="relative rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                    style={{ background: '#F3E6E8', minHeight: 220, border: '2px dashed #D79AA8' }}
                    onClick={() => fileRefs.current[b.id]?.click()}>
                    {b.image ? (
                      <img src={b.image} alt="banner" className="w-full h-full object-cover" style={{ minHeight: 220 }} />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                        <ImageIcon className="w-8 h-8" style={{ color: '#D79AA8' }} />
                        <p className="text-xs font-bold" style={{ color: '#C77D8A' }}>اضغط لرفع صورة</p>
                        <p className="text-[10px]" style={{ color: '#D79AA8' }}>JPG, PNG, WEBP</p>
                      </div>
                    )}
                    <div className="absolute bottom-0 inset-x-0 py-2 text-center text-xs font-bold"
                      style={{ background: 'rgba(199,125,138,0.85)', color: 'white' }}>
                      {b.image ? 'اضغط لتغيير الصورة' : 'رفع صورة'}
                    </div>
                  </div>
                  <input
                    ref={el => { fileRefs.current[b.id] = el; }}
                    type="file" accept="image/*" className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(b.id, f); }}
                  />
                  {/* OR paste URL */}
                  <div className="mt-2">
                    <input
                      value={b.image.startsWith('data:') ? '' : b.image}
                      onChange={e => patch(b.id, 'image', e.target.value)}
                      placeholder="أو الصق رابط صورة URL..."
                      className="w-full rounded-xl px-3 py-2 text-xs outline-none"
                      style={{ border: '1px solid #F0DDE0', background: '#FFF8F8', color: '#5A4047' }}
                      dir="ltr"
                    />
                  </div>
                </div>

                {/* Text fields */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold mb-1.5" style={{ color: '#5A4047' }}>العنوان الفرعي (صغير)</label>
                    <input value={b.subtitle} onChange={e => patch(b.id, 'subtitle', e.target.value)}
                      className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                      style={{ border: '1px solid #F0DDE0', background: '#FFF8F8', color: '#5A4047' }}
                      placeholder="مثال: أناقة تنبض بالأنوثة" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1.5" style={{ color: '#5A4047' }}>العنوان الرئيسي</label>
                    <textarea rows={3} value={b.title} onChange={e => patch(b.id, 'title', e.target.value)}
                      className="w-full rounded-xl px-3 py-2.5 text-sm outline-none resize-none"
                      style={{ border: '1px solid #F0DDE0', background: '#FFF8F8', color: '#5A4047' }}
                      placeholder={'مخاوير راقية\nلتألقي في كل مناسبة'} />
                    <p className="text-[10px] mt-1" style={{ color: '#D79AA8' }}>اضغط Enter للسطر الثاني</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1.5" style={{ color: '#5A4047' }}>الوصف</label>
                    <input value={b.desc} onChange={e => patch(b.id, 'desc', e.target.value)}
                      className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                      style={{ border: '1px solid #F0DDE0', background: '#FFF8F8', color: '#5A4047' }}
                      placeholder="تصاميم فاخرة بأقمشة ناعمة..." />
                  </div>
                </div>

                {/* Preview */}
                <div>
                  <label className="block text-xs font-bold mb-2" style={{ color: '#5A4047' }}>معاينة</label>
                  <div className="rounded-xl overflow-hidden flex" style={{ background: '#F9F0EE', height: 120 }}>
                    <div className="w-1/2 overflow-hidden">
                      {b.image
                        ? <img src={b.image} alt="" className="w-full h-full object-cover object-top" />
                        : <div className="w-full h-full" style={{ background: '#E8D5C8' }} />}
                    </div>
                    <div className="w-1/2 px-3 py-3 flex flex-col justify-center" dir="rtl">
                      <p className="text-[8px] mb-0.5" style={{ color: '#9A7A82' }}>{b.subtitle}</p>
                      <p className="font-black text-[10px] leading-tight mb-1.5" style={{ color: '#2C1810', whiteSpace: 'pre-line' }}>{b.title}</p>
                      <div className="px-2 py-1 rounded text-[8px] font-bold inline-block self-start" style={{ background: '#C4607A', color: 'white' }}>تسوقي الآن</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {banners.length > 0 && (
        <div className="flex items-center gap-2 p-4 rounded-2xl" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
          <Save className="w-4 h-4 shrink-0" style={{ color: '#22C55E' }} />
          <p className="text-xs font-bold" style={{ color: '#16A34A' }}>
            التغييرات تُحفظ تلقائياً — يظهر في الموقع مباشرة عند فتح الصفحة
          </p>
        </div>
      )}
    </div>
  );
}
