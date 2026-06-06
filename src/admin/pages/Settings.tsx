import React, { useState } from 'react';
import { Save } from 'lucide-react';

const STORED_KEY = 'almaasa_settings';
const load = () => { try { return JSON.parse(localStorage.getItem(STORED_KEY) || '{}'); } catch { return {}; } };

type Settings = {
  storeName: string; storeNameEn: string; storeEmail: string; storePhone: string;
  storeAddress: string; currency: string; taxRate: number;
  shippingCost: number; freeShippingMin: number;
  whatsapp: string; instagram: string; snapchat: string;
};

const defaults: Settings = {
  storeName: 'ألماسة', storeNameEn: 'Almaasa', storeEmail: '', storePhone: '',
  storeAddress: '', currency: 'BHD', taxRate: 0,
  shippingCost: 1, freeShippingMin: 20,
  whatsapp: '', instagram: '', snapchat: '',
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-5 space-y-4" style={{ background: '#FFFFFF', border: '1px solid #F0DDE0' }}>
      <h3 className="font-black text-sm" style={{ color: '#5A4047' }}>{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-bold mb-1.5" style={{ color: '#5A4047' }}>{label}</label>
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

      <Section title="الدفع والشحن">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="العملة">{input('currency','ltr')}</Field>
          <Field label="نسبة الضريبة %">{numInput('taxRate', 0.1)}</Field>
          <Field label="تكلفة الشحن (د.ب)">{numInput('shippingCost', 0.1)}</Field>
          <Field label="الشحن المجاني من (د.ب)">{numInput('freeShippingMin', 1)}</Field>
        </div>
      </Section>

      <Section title="التواصل الاجتماعي">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="واتساب">{input('whatsapp','ltr')}</Field>
          <Field label="انستغرام">{input('instagram','ltr')}</Field>
          <Field label="سناب شات">{input('snapchat','ltr')}</Field>
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
