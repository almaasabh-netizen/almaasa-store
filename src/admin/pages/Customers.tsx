import React, { useState, useMemo } from 'react';
import { Search, Star } from 'lucide-react';
import { getStoredData } from '../../data';

export default function Customers() {
  const [search, setSearch] = useState('');
  const data = getStoredData();
  const orders = data.orders || [];

  const customers = useMemo(() => {
    const map: Record<string, any> = {};
    orders.forEach((o: any) => {
      const key = o.customerPhone || o.customerEmail || o.customerName;
      if (!key) return;
      if (!map[key]) {
        map[key] = {
          name: o.customerName, phone: o.customerPhone, email: o.customerEmail,
          city: o.customerCity, orders: [], total: 0,
        };
      }
      map[key].orders.push(o);
      if (o.status !== 'cancelled') map[key].total += o.total || 0;
    });
    return Object.values(map).sort((a: any, b: any) => b.total - a.total);
  }, [orders]);

  const filtered = search
    ? customers.filter((c: any) => c.name?.includes(search) || c.phone?.includes(search))
    : customers;

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-xl px-3 py-2.5 flex-1 max-w-sm" style={{ background: '#FFFFFF', border: '1px solid #F0DDE0' }}>
          <Search className="w-4 h-4 shrink-0" style={{ color: '#D79AA8' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث باسم العميل أو رقم الهاتف..."
            className="bg-transparent text-sm flex-1 outline-none" style={{ color: '#5A4047' }} dir="rtl" />
        </div>
        <span className="text-xs font-bold" style={{ color: '#D79AA8' }}>{filtered.length} عميل</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full py-20 text-center">
            <p className="text-4xl mb-3">👥</p>
            <p className="font-bold text-sm" style={{ color: '#5A4047' }}>لا يوجد عملاء</p>
          </div>
        ) : filtered.map((c: any, i: number) => (
          <div key={c.phone || i} className="rounded-2xl p-4" style={{ background: '#FFFFFF', border: '1px solid #F0DDE0' }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-black text-sm"
                style={{ background: 'linear-gradient(135deg,#D79AA8,#C77D8A)' }}>
                {c.name?.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="font-bold text-sm truncate" style={{ color: '#5A4047' }}>{c.name}</p>
                  {c.total >= 100 && <Star className="w-3.5 h-3.5 shrink-0" style={{ color: '#F59E0B' }} fill="#F59E0B" />}
                </div>
                <p className="text-xs" style={{ color: '#D79AA8' }}>{c.phone}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl py-2" style={{ background: '#FFF8F8' }}>
                <p className="font-black text-sm" style={{ color: '#C77D8A' }}>{c.orders.length}</p>
                <p className="text-[10px]" style={{ color: '#D79AA8' }}>طلب</p>
              </div>
              <div className="rounded-xl py-2" style={{ background: '#FFF8F8' }}>
                <p className="font-black text-sm" style={{ color: '#C77D8A' }}>{c.total.toFixed(0)}</p>
                <p className="text-[10px]" style={{ color: '#D79AA8' }}>د.ب</p>
              </div>
              <div className="rounded-xl py-2" style={{ background: '#FFF8F8' }}>
                <p className="font-black text-sm" style={{ color: '#C77D8A' }}>{c.city || '—'}</p>
                <p className="text-[10px]" style={{ color: '#D79AA8' }}>المدينة</p>
              </div>
            </div>
            {c.email && <p className="text-xs mt-2 truncate" style={{ color: '#D79AA8' }}>{c.email}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
