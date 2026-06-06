import React, { useState } from 'react';
import { Save } from 'lucide-react';

const STORED_KEY = 'almaasa_settings';
const load = () => { try { return JSON.parse(localStorage.getItem(STORED_KEY) || '{}'); } catch { return {}; } };

type Settings = {
  storeName: string; storeNameEn: string; storeEmail: string; storePhone: string;
  storeAddress: string; currency: string; taxRate: number;
  shippingCost: number; freeShippingMin: number;
  whatsapp: string; instagram: string; tiktok: string;
  announcementText: string;
};

const defaults: Settings = {
  storeName: 'ألماسة', storeNameEn: 'Almaasa', storeEmail: '', storePhone: '',
  storeAddress: '', currency: 'BHD', taxRate: 0,
  shippingCost: 1, freeShippingMin: 20,
  whatsapp: '', instagram: 'https://instagram.com/almaasa.bh', tiktok: '',
  announcementText: 'شحن مجاني للطلبات فوق 300 ريال',
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-5 space-y-4" style={{ background: '#FFFFFF', border: '1px solid #F0DDE0' }}>
      <h3 className="font-black text-sm" style={{ color: '#5A4047' }}>{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-bold mb-1.5" style={{ color: '#5A4047' }}>{label}</label>
      {hint && <p className="text-[10px] mb-1.5" style={{ color: '#D79AA8' }}>{hint}</p>}
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const [form, setForm] = useState<Settings>({ ...defaults, ...load() });
  const [saved, setSaved] = useState(false);

  const set = (key: keyof Settings, val: any) => setForm(f => ({ ...f, [key]: val }));

  const save = () => {
    localStorage.setItem(STORED_KEY, JSON.stringify(form));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const input = (key: keyof Settings, dir?: string) => (
    <input value={form[key] as string} onChange={e => set(key, e.target.value)}
      className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
      style={{ border: '1px solid #F0DDE0', background: '#FFF8F8', color: '#5A4047' }} dir={dir || 'rtl'} />
  );

  const numInput = (key: keyof Settings, step = 1) => (
    <input type="number" step={step} value={form[key] as number} onChange={e => set(key, Number(e.target.value))}
      className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
      style={{ border: '1px solid #F0DDE0', background: '#FFF8F8', color: '#5A4047' }} dir="ltr" />
  );

  return (
    <div className="max-w-3xl space-y-4" dir="rtl">
      <Section title="معلومات المتجر">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="اسم المتجر (عربي)">{input('storeName')}</Field>
          <Field label="اسم المتجر (إنجليزي)">{input('storeNameEn','ltr')}</Field>
          <Field label="البريد الإلكتروني">{input('storeEmail','ltr')}</Field>
          <Field label="رقم الهاتف">{input('storePhone','ltr')}</Field>
          <div className="md:col-span-2"><Field label="العنوان">{input('storeAddress')}</Field></div>
        </div>
      </Section>

      <Section title="شريط الإعلان (أعلى الموقع)">
        <Field label="نص الإعلان" hint="النص الذي يظهر في الشريط الوردي أعلى الصفحة">
          {input('announcementText')}
        </Field>
        <div className="rounded-xl p-3 text-center text-xs font-semibold text-white"
          style={{ background: '#C4607A' }}>
          معاينة: {form.announcementText || 'شحن مجاني للطلبات فوق 300 ريال'}
        </div>
      </Section>

      <Section title="الدفع والشحن">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="العملة">{input('currency','ltr')}</Field>
          <Field label="نسبة الضريبة %">{numInput('taxRate', 0.1)}</Field>
          <Field label="تكلفة الشحن (د.ب)">{numInput('shippingCost', 0.1)}</Field>
          <Field label="الشحن المجاني من (د.ب)">{numInput('freeShippingMin', 1)}</Field>
        </div>
      </Section>

      <Section title="التواصل الاجتماعي">
        <div className="grid grid-cols-1 gap-4">
          <Field label="واتساب" hint="رقم الواتساب مع رمز الدولة (مثال: 97312345678)">{input('whatsapp','ltr')}</Field>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="رابط انستقرام" hint="الرابط الكامل لصفحتك">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" fill="#E1306C" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              <input value={form.instagram} onChange={e => set('instagram', e.target.value)}
                placeholder="https://instagram.com/yourpage"
                className="flex-1 rounded-xl px-3 py-2.5 text-sm outline-none"
                style={{ border: '1px solid #F0DDE0', background: '#FFF8F8', color: '#5A4047' }} dir="ltr" />
            </div>
          </Field>
          <Field label="رابط تيك توك" hint="الرابط الكامل لصفحتك">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" fill="#000" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
              <input value={form.tiktok} onChange={e => set('tiktok', e.target.value)}
                placeholder="https://tiktok.com/@yourpage"
                className="flex-1 rounded-xl px-3 py-2.5 text-sm outline-none"
                style={{ border: '1px solid #F0DDE0', background: '#FFF8F8', color: '#5A4047' }} dir="ltr" />
            </div>
          </Field>
        </div>
      </Section>

      <div className="flex justify-end">
        <button onClick={save} className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-colors"
          style={{ background: saved ? '#22C55E' : '#D79AA8', color: 'white' }}>
          <Save className="w-4 h-4" /> {saved ? 'تم الحفظ ✓' : 'حفظ الإعدادات'}
        </button>
      </div>
    </div>
  );
}
