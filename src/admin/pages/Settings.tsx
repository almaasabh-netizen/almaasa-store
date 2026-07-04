import React, { useState } from 'react';

const KEY = 'almaasa_settings';
const load = () => {
  try {
    const a = JSON.parse(localStorage.getItem('almaasa_settings') || '{}');
    const b = JSON.parse(localStorage.getItem('ama_settings') || '{}');
    // merge both sources; almaasa_settings wins for its fields
    return { whatsapp: b.whatsappNumber || '', instagram: b.instagramUsername ? `https://instagram.com/${b.instagramUsername}` : '', ...a };
  } catch { return {}; }
};

const DEFAULTS = {
  storeName: 'ألماسة', storeNameEn: 'Almaasa', storeEmail: '', storePhone: '',
  storeAddress: '', currency: 'BHD', taxRate: 0,
  shippingCost: 1, freeShippingMin: 20,
  whatsapp: '', instagram: 'https://instagram.com/almaasa.bh', tiktok: '',
  announcementText: 'شحن مجاني للطلبات فوق 300 ريال',
};

const inputStyle = { border: '1px solid #F0DDE0', background: '#FFF8F8', color: '#5A4047' } as const;
const cls = 'w-full rounded-xl px-3 py-2.5 text-sm outline-none';

function Label({ text, hint }: { text: string; hint?: string }) {
  return (
    <div className="mb-1.5">
      <p className="text-xs font-bold" style={{ color: '#5A4047' }}>{text}</p>
      {hint && <p className="text-[10px] mt-0.5" style={{ color: '#D79AA8' }}>{hint}</p>}
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-5 space-y-4" style={{ background: '#FFFFFF', border: '1px solid #F0DDE0' }}>
      <h3 className="font-black text-sm" style={{ color: '#5A4047' }}>{title}</h3>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const [s, setS] = useState(() => ({ ...DEFAULTS, ...load() }));
  const [saved, setSaved] = useState(false);

  const upd = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setS(prev => ({ ...prev, [key]: e.target.value }));

  const updNum = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setS(prev => ({ ...prev, [key]: Number(e.target.value) }));

  const save = () => {
    // Save to almaasa_settings (read by announcement bar + social links in Storefront)
    localStorage.setItem(KEY, JSON.stringify(s));
    // Also save mapped fields to ama_settings (read by getStoredData())
    const existing = (() => { try { return JSON.parse(localStorage.getItem('ama_settings') || '{}'); } catch { return {}; } })();
    const igHandle = s.instagram.replace(/.*instagram\.com\//i, '').replace(/\//g, '');
    localStorage.setItem('ama_settings', JSON.stringify({
      ...existing,
      storeName: s.storeName,
      whatsappNumber: s.whatsapp,
      instagramUsername: igHandle || existing.instagramUsername,
      shippingCost: s.shippingCost,
      freeShippingThreshold: s.freeShippingMin,
    }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-3xl space-y-4" dir="rtl">

      <Card title="معلومات المتجر">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label text="اسم المتجر (عربي)" />
            <input className={cls} style={inputStyle} dir="rtl"
              value={s.storeName} onChange={upd('storeName')} />
          </div>
          <div>
            <Label text="اسم المتجر (إنجليزي)" />
            <input className={cls} style={inputStyle} dir="ltr"
              value={s.storeNameEn} onChange={upd('storeNameEn')} />
          </div>
          <div>
            <Label text="البريد الإلكتروني" />
            <input className={cls} style={inputStyle} dir="ltr" type="email"
              value={s.storeEmail} onChange={upd('storeEmail')} />
          </div>
          <div>
            <Label text="رقم الهاتف" />
            <input className={cls} style={inputStyle} dir="ltr"
              value={s.storePhone} onChange={upd('storePhone')} />
          </div>
          <div className="md:col-span-2">
            <Label text="العنوان" />
            <input className={cls} style={inputStyle} dir="rtl"
              value={s.storeAddress} onChange={upd('storeAddress')} />
          </div>
        </div>
      </Card>

      <Card title="شريط الإعلان (أعلى الموقع)">
        <Label text="نص الإعلان" hint="النص الذي يظهر في الشريط الوردي أعلى الصفحة" />
        <input className={cls} style={inputStyle} dir="rtl"
          value={s.announcementText} onChange={upd('announcementText')} />
        <div className="rounded-xl p-3 text-center text-xs font-semibold text-white"
          style={{ background: '#C4607A' }}>
          معاينة: {s.announcementText || '...'}
        </div>
      </Card>

      <Card title="الدفع والشحن">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label text="العملة" />
            <input className={cls} style={inputStyle} dir="ltr"
              value={s.currency} onChange={upd('currency')} />
          </div>
          <div>
            <Label text="نسبة الضريبة %" />
            <input className={cls} style={inputStyle} dir="ltr" type="number" step="0.1"
              value={s.taxRate} onChange={updNum('taxRate')} />
          </div>
          <div>
            <Label text="تكلفة الشحن (د.ب)" />
            <input className={cls} style={inputStyle} dir="ltr" type="number" step="0.1"
              value={s.shippingCost} onChange={updNum('shippingCost')} />
          </div>
          <div>
            <Label text="الشحن المجاني من (د.ب)" />
            <input className={cls} style={inputStyle} dir="ltr" type="number"
              value={s.freeShippingMin} onChange={updNum('freeShippingMin')} />
          </div>
        </div>
      </Card>

      <Card title="التواصل الاجتماعي">
        <div>
          <Label text="واتساب" hint="رقم الواتساب مع رمز الدولة (مثال: 97312345678)" />
          <input className={cls} style={inputStyle} dir="ltr" placeholder="97337037697"
            value={s.whatsapp} onChange={upd('whatsapp')} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label text="رابط انستقرام" />
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 shrink-0" fill="#E1306C" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              <input className="flex-1 rounded-xl px-3 py-2.5 text-sm outline-none" style={inputStyle} dir="ltr"
                placeholder="https://instagram.com/yourpage"
                value={s.instagram} onChange={upd('instagram')} />
            </div>
          </div>
          <div>
            <Label text="رابط تيك توك" />
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 shrink-0" fill="#000" viewBox="0 0 24 24">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
              </svg>
              <input className="flex-1 rounded-xl px-3 py-2.5 text-sm outline-none" style={inputStyle} dir="ltr"
                placeholder="https://tiktok.com/@yourpage"
                value={s.tiktok} onChange={upd('tiktok')} />
            </div>
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <button onClick={save}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-colors"
          style={{ background: saved ? '#22C55E' : '#9A2D55', color: 'white', fontFamily: "'Cairo', sans-serif" }}>
          {saved ? 'تم الحفظ ✓' : '💾 حفظ الإعدادات'}
        </button>
      </div>
    </div>
  );
}
