import React, { useState, useMemo } from 'react';
import { Search, Plus, Edit2, Trash2, Eye, EyeOff, Package, Instagram } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getStoredData, saveStoredData } from '../../data';

export default function Products() {
  const navigate = useNavigate();
  const [data, setData] = useState(() => getStoredData());
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('الكل');
  const [isImporting, setIsImporting] = useState(false);

  const importFromInstagram = async () => {
    setIsImporting(true);
    try {
      const res = await fetch('/api/instagram-feed');
      if (!res.ok) throw new Error();
      const json = await res.json();
      const posts = json.posts || json.feed || json;
      const newProducts = (Array.isArray(posts) ? posts : []).map((p: any) => ({
        id: `ig_${p.id || Date.now()}_${Math.random().toString(36).slice(2,6)}`,
        name: (p.caption || p.title || 'منتج من إنستقرام').slice(0, 60),
        price: 0, stock: 0, category: '', description: p.caption || '',
        image: p.perm_url || p.media_url || p.thumbnail_url || '',
        isDraft: true,
      }));
      if (newProducts.length === 0) { alert('لم يتم العثور على منشورات'); return; }
      const updated = { ...data, products: [...(data.products || []), ...newProducts] };
      saveStoredData(updated);
      setData(updated);
      alert(`تم استيراد ${newProducts.length} منتج بنجاح`);
    } catch {
      alert('فشل الاستيراد — تأكد من إعداد Behold API');
    } finally {
      setIsImporting(false);
    }
  };

  const products = useMemo(() => {
    let list = [...(data.products || [])];
    if (categoryFilter !== 'الكل') list = list.filter((p: any) => p.category === categoryFilter);
    if (search) list = list.filter((p: any) => p.name?.includes(search) || p.sku?.includes(search));
    return list;
  }, [data.products, categoryFilter, search]);

  const categories = ['الكل', ...Array.from(new Set((data.products || []).map((p: any) => p.category).filter(Boolean))) as string[]];

  const toggleDraft = (id: string) => {
    const updated = { ...data, products: data.products.map((p: any) => p.id === id ? { ...p, isDraft: !p.isDraft } : p) };
    saveStoredData(updated);
    setData(updated);
  };

  const deleteProduct = (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
    const updated = { ...data, products: data.products.filter((p: any) => p.id !== id) };
    saveStoredData(updated);
    setData(updated);
  };

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 rounded-xl px-3 py-2.5 flex-1 min-w-48" style={{ background: '#FFFFFF', border: '1px solid #F0DDE0' }}>
          <Search className="w-4 h-4 shrink-0" style={{ color: '#D79AA8' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث باسم المنتج أو الكود..."
            className="bg-transparent text-sm flex-1 outline-none" style={{ color: '#5A4047' }} dir="rtl" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {categories.map(c => (
            <button key={c} onClick={() => setCategoryFilter(c)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold transition-colors"
              style={{ background: categoryFilter === c ? '#D79AA8' : '#FFFFFF', color: categoryFilter === c ? 'white' : '#5A4047', border: '1px solid #F0DDE0' }}>
              {c}
            </button>
          ))}
        </div>
        <div className="flex gap-2 mr-auto">
          <button onClick={importFromInstagram} disabled={isImporting}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)', color: 'white' }}>
            <Instagram className="w-4 h-4" />
            {isImporting ? 'جاري الاستيراد...' : 'استيراد من إنستقرام'}
          </button>
          <button onClick={() => navigate('/admin/products/new')}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold"
            style={{ background: '#D79AA8', color: 'white' }}>
            <Plus className="w-4 h-4" /> إضافة منتج
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {products.length === 0 ? (
          <div className="col-span-full py-24 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-5" style={{ background: '#F3E6E8' }}>
              <Package className="w-10 h-10" style={{ color: '#D79AA8' }} />
            </div>
            <p className="font-black text-base mb-1" style={{ color: '#5A4047' }}>لا توجد منتجات بعد</p>
            <p className="text-sm mb-6" style={{ color: '#D79AA8' }}>ابدئي بإضافة أول منتج لمتجرك</p>
            <button onClick={() => navigate('/admin/products/new')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white transition-colors hover:opacity-90"
              style={{ background: '#D79AA8' }}>
              <Plus className="w-4 h-4" />
              أضف أول منتج
            </button>
          </div>
        ) : products.map((p: any) => (
          <div key={p.id} className="rounded-2xl overflow-hidden group relative"
            style={{ background: '#FFFFFF', border: '1px solid #F0DDE0' }}>
            <div className="relative">
              {p.image ? (
                <img src={p.image} alt={p.name} referrerPolicy="no-referrer"
                  className="w-full h-40 object-cover" />
              ) : (
                <div className="w-full h-40 flex items-center justify-center" style={{ background: '#F3E6E8' }}>
                  <Package className="w-8 h-8" style={{ color: '#D79AA8' }} />
                </div>
              )}
              {p.isDraft && (
                <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: '#FFF7ED', color: '#F59E0B' }}>مسودة</span>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <button onClick={() => navigate(`/admin/products/${p.id}`)}
                  className="p-2 rounded-xl shadow-lg" style={{ background: 'white' }}>
                  <Edit2 className="w-3.5 h-3.5" style={{ color: '#C77D8A' }} />
                </button>
                <button onClick={() => toggleDraft(p.id)}
                  className="p-2 rounded-xl shadow-lg" style={{ background: 'white' }}>
                  {p.isDraft ? <Eye className="w-3.5 h-3.5" style={{ color: '#22C55E' }} /> : <EyeOff className="w-3.5 h-3.5" style={{ color: '#F59E0B' }} />}
                </button>
                <button onClick={() => deleteProduct(p.id)}
                  className="p-2 rounded-xl shadow-lg" style={{ background: 'white' }}>
                  <Trash2 className="w-3.5 h-3.5" style={{ color: '#EF4444' }} />
                </button>
              </div>
            </div>
            <div className="p-3">
              <p className="font-bold text-xs truncate" style={{ color: '#5A4047' }}>{p.name}</p>
              <div className="flex items-center justify-between mt-1">
                <span className="font-black text-sm" style={{ color: '#C77D8A' }}>{p.price} د.ب</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: (p.stock || 0) <= 5 ? '#FEF2F2' : '#F0FDF4', color: (p.stock || 0) <= 5 ? '#EF4444' : '#22C55E' }}>
                  {p.stock || 0} قطعة
                </span>
              </div>
              <div className="flex gap-2 mt-2">
                <button onClick={() => navigate(`/admin/products/${p.id}`)}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-xl text-xs font-bold transition-colors hover:opacity-80"
                  style={{ background: '#F3E6E8', color: '#C77D8A' }}>
                  <Edit2 className="w-3 h-3" /> تعديل
                </button>
                <button onClick={() => toggleDraft(p.id)}
                  className="p-1.5 rounded-xl transition-colors hover:opacity-80"
                  style={{ background: '#F3E6E8' }}>
                  {p.isDraft ? <Eye className="w-3.5 h-3.5" style={{ color: '#22C55E' }} /> : <EyeOff className="w-3.5 h-3.5" style={{ color: '#F59E0B' }} />}
                </button>
                <button onClick={() => deleteProduct(p.id)}
                  className="p-1.5 rounded-xl transition-colors hover:opacity-80"
                  style={{ background: '#FEF2F2' }}>
                  <Trash2 className="w-3.5 h-3.5" style={{ color: '#EF4444' }} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
