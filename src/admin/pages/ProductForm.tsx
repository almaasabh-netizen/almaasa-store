import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowRight, Save, X } from 'lucide-react';
import { getStoredData, saveStoredData } from '../../data';

const SIZES = ['XS','S','M','L','XL','XXL','فري سايز'];
const COLORS = ['أسود','أبيض','بيج','رمادي','بني','ذهبي','كحلي','زيتي','وردي','أحمر'];

type FormData = {
  name: string; nameEn: string; price: number; originalPrice: number;
  category: string; description: string; image: string;
  stock: number; sku: string; weight: number;
  sizes: string[]; colors: string[]; isDraft: boolean;
};

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new' || !id;

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    defaultValues: { isDraft: false, sizes: [], colors: [], stock: 0 }
  });

  const watchSizes = watch('sizes') as string[];
  const watchColors = watch('colors') as string[];
  const watchImage = watch('image');

  useEffect(() => {
    if (!isNew) {
      const data = getStoredData();
      const product = (data.products || []).find((p: any) => p.id === id);
      if (product) {
        Object.entries(product).forEach(([k, v]) => setValue(k as any, v as any));
      }
    }
  }, [id, isNew, setValue]);

  const toggleArr = (field: 'sizes' | 'colors', val: string) => {
    const curr = field === 'sizes' ? watchSizes : watchColors;
    const next = curr?.includes(val) ? curr.filter((x: string) => x !== val) : [...(curr || []), val];
    setValue(field, next);
  };

  const onSubmit = (formData: FormData) => {
    const stored = getStoredData();
    if (isNew) {
      const newProduct = { ...formData, id: `prod_${Date.now()}`, reviewCount: 0, rating: 0 };
      saveStoredData({ ...stored, products: [...(stored.products || []), newProduct] });
    } else {
      saveStoredData({ ...stored, products: (stored.products || []).map((p: any) => p.id === id ? { ...p, ...formData } : p) });
    }
    navigate('/admin/products');
  };

  return (
    <div className="max-w-3xl space-y-5" dir="rtl">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/admin/products')} className="p-2 rounded-xl hover:bg-[#F3E6E8]">
          <ArrowRight className="w-4 h-4" style={{ color: '#D79AA8' }} />
        </button>
        <h2 className="font-black text-lg" style={{ color: '#5A4047' }}>{isNew ? 'إضافة منتج جديد' : 'تعديل المنتج'}</h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="rounded-2xl p-5 space-y-4" style={{ background: '#FFFFFF', border: '1px solid #F0DDE0' }}>
          <h3 className="font-black text-sm" style={{ color: '#5A4047' }}>المعلومات الأساسية</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: '#5A4047' }}>اسم المنتج (عربي) *</label>
              <input {...register('name', { required: true })}
                className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                style={{ border: `1px solid ${errors.name ? '#EF4444' : '#F0DDE0'}`, background: '#FFF8F8', color: '#5A4047' }} />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: '#5A4047' }}>اسم المنتج (إنجليزي)</label>
              <input {...register('nameEn')}
                className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                style={{ border: '1px solid #F0DDE0', background: '#FFF8F8', color: '#5A4047' }} dir="ltr" />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: '#5A4047' }}>السعر (د.ب) *</label>
              <input type="number" step="0.01" {...register('price', { required: true, min: 0 })}
                className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                style={{ border: `1px solid ${errors.price ? '#EF4444' : '#F0DDE0'}`, background: '#FFF8F8', color: '#5A4047' }} dir="ltr" />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: '#5A4047' }}>السعر الأصلي (قبل الخصم)</label>
              <input type="number" step="0.01" {...register('originalPrice', { min: 0 })}
                className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                style={{ border: '1px solid #F0DDE0', background: '#FFF8F8', color: '#5A4047' }} dir="ltr" />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: '#5A4047' }}>التصنيف</label>
              <input {...register('category')}
                className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                style={{ border: '1px solid #F0DDE0', background: '#FFF8F8', color: '#5A4047' }} />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: '#5A4047' }}>كود المنتج (SKU)</label>
              <input {...register('sku')}
                className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                style={{ border: '1px solid #F0DDE0', background: '#FFF8F8', color: '#5A4047' }} dir="ltr" />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: '#5A4047' }}>المخزون</label>
              <input type="number" {...register('stock', { min: 0 })}
                className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                style={{ border: '1px solid #F0DDE0', background: '#FFF8F8', color: '#5A4047' }} dir="ltr" />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: '#5A4047' }}>الوزن (كغ)</label>
              <input type="number" step="0.1" {...register('weight', { min: 0 })}
                className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                style={{ border: '1px solid #F0DDE0', background: '#FFF8F8', color: '#5A4047' }} dir="ltr" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold mb-1.5" style={{ color: '#5A4047' }}>الوصف</label>
            <textarea rows={3} {...register('description')}
              className="w-full rounded-xl px-3 py-2.5 text-sm outline-none resize-none"
              style={{ border: '1px solid #F0DDE0', background: '#FFF8F8', color: '#5A4047' }} />
          </div>
        </div>

        <div className="rounded-2xl p-5 space-y-4" style={{ background: '#FFFFFF', border: '1px solid #F0DDE0' }}>
          <h3 className="font-black text-sm" style={{ color: '#5A4047' }}>الصورة</h3>
          <input {...register('image')} placeholder="رابط الصورة URL"
            className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
            style={{ border: '1px solid #F0DDE0', background: '#FFF8F8', color: '#5A4047' }} dir="ltr" />
          {watchImage && <img src={watchImage} alt="preview" referrerPolicy="no-referrer" className="h-32 rounded-xl object-cover" />}
        </div>

        <div className="rounded-2xl p-5 space-y-4" style={{ background: '#FFFFFF', border: '1px solid #F0DDE0' }}>
          <h3 className="font-black text-sm" style={{ color: '#5A4047' }}>المقاسات والألوان</h3>
          <div>
            <p className="text-xs font-bold mb-2" style={{ color: '#D79AA8' }}>المقاسات</p>
            <div className="flex flex-wrap gap-2">
              {SIZES.map(s => (
                <button type="button" key={s} onClick={() => toggleArr('sizes', s)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold transition-colors"
                  style={{ background: watchSizes?.includes(s) ? '#D79AA8' : '#F3E6E8', color: watchSizes?.includes(s) ? 'white' : '#C77D8A' }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-bold mb-2" style={{ color: '#D79AA8' }}>الألوان</p>
            <div className="flex flex-wrap gap-2">
              {COLORS.map(c => (
                <button type="button" key={c} onClick={() => toggleArr('colors', c)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold transition-colors"
                  style={{ background: watchColors?.includes(c) ? '#D79AA8' : '#F3E6E8', color: watchColors?.includes(c) ? 'white' : '#C77D8A' }}>
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 justify-between rounded-2xl p-4" style={{ background: '#FFFFFF', border: '1px solid #F0DDE0' }}>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" {...register('isDraft')} className="w-4 h-4 accent-pink-400" />
            <span className="text-sm font-bold" style={{ color: '#5A4047' }}>حفظ كمسودة</span>
          </label>
          <div className="flex gap-2">
            <button type="button" onClick={() => navigate('/admin/products')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold"
              style={{ background: '#F3E6E8', color: '#C77D8A' }}>
              <X className="w-3.5 h-3.5" /> إلغاء
            </button>
            <button type="submit"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold"
              style={{ background: '#D79AA8', color: 'white' }}>
              <Save className="w-3.5 h-3.5" /> حفظ المنتج
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
