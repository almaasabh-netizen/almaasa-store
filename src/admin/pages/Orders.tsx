import React, { useState, useMemo } from 'react';
import { Search, Filter, Download, Eye, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getStoredData, saveStoredData } from '../../data';
import { statusColors } from '../theme';

const STATUSES = ['الكل','new','processing','shipping','delivered','cancelled','returned'];
const STATUS_LABELS: Record<string,string> = { 'الكل':'الكل', new:'جديد', processing:'قيد التجهيز', shipping:'تم الشحن', delivered:'تم التسليم', cancelled:'ملغي', returned:'مُرتجع' };

export default function Orders() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('الكل');
  const [data, setData] = useState(() => getStoredData());

  const orders = useMemo(() => {
    let list = [...(data.orders || [])].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
    if (statusFilter !== 'الكل') list = list.filter((o: any) => o.status === statusFilter);
    if (search) list = list.filter((o: any) => {
      const name = o.customer?.name || o.customerName || '';
      const phone = o.customer?.phone || o.customerPhone || '';
      return name.includes(search) || o.id?.includes(search) || phone.includes(search);
    });
    return list;
  }, [data.orders, statusFilter, search]);

  const updateStatus = (id: string, status: string) => {
    const updated = { ...data, orders: data.orders.map((o: any) => o.id === id ? { ...o, status } : o) };
    saveStoredData(updated);
    setData(updated);
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 rounded-xl px-3 py-2.5 flex-1 min-w-48"
          style={{ background: '#FFFFFF', border: '1px solid #F0DDE0' }}>
          <Search className="w-4 h-4 shrink-0" style={{ color: '#D79AA8' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث باسم العميل أو رقم الطلب..."
            className="bg-transparent text-sm flex-1 outline-none" style={{ color: '#5A4047' }} dir="rtl" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {STATUSES.map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold transition-colors"
              style={{
                background: statusFilter === s ? '#D79AA8' : '#FFFFFF',
                color: statusFilter === s ? 'white' : '#5A4047',
                border: '1px solid #F0DDE0'
              }}>
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold mr-auto"
          style={{ background: '#FFFFFF', border: '1px solid #F0DDE0', color: '#5A4047' }}>
          <Download className="w-3.5 h-3.5" style={{ color: '#D79AA8' }} />
          تصدير
        </button>
      </div>

      {/* Summary badges */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        {Object.entries(statusColors).map(([k, v]) => {
          const count = (data.orders || []).filter((o: any) => o.status === k).length;
          return (
            <div key={k} className="rounded-xl p-3 text-center cursor-pointer hover:shadow-sm transition-shadow"
              style={{ background: v.bg, border: `1px solid ${v.text}22` }}
              onClick={() => setStatusFilter(k)}>
              <p className="text-lg font-black" style={{ color: v.text }}>{count}</p>
              <p className="text-[10px] font-medium" style={{ color: v.text }}>{v.label}</p>
            </div>
          );
        })}
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: '#FFFFFF', border: '1px solid #F0DDE0' }}>
        {orders.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-4xl mb-3">🛍️</p>
            <p className="font-bold text-sm mb-1" style={{ color: '#5A4047' }}>لا توجد طلبات</p>
            <p className="text-xs" style={{ color: '#D79AA8' }}>سيظهر هنا الطلبات الواردة من العملاء</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr style={{ background: '#FFF8F8' }}>
                  {['رقم الطلب','العميل','المنتجات','المبلغ','الحالة','تاريخ الطلب','إجراءات'].map(h => (
                    <th key={h} className="px-4 py-3 text-xs font-bold" style={{ color: '#D79AA8' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((order: any) => {
                  const sc = statusColors[order.status] ?? statusColors.new;
                  return (
                    <tr key={order.id} className="border-t hover:bg-[#FFF8F8] transition-colors cursor-pointer"
                      style={{ borderColor: '#F0DDE0' }}
                      onClick={e => { if ((e.target as HTMLElement).closest('button,select') === null) navigate(`/admin/orders/${order.id}`); }}>
                      <td className="px-4 py-3">
                        <span className="font-black text-sm" style={{ color: '#C77D8A' }}>
                          #{order.id?.slice(-5)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black"
                            style={{ background: 'linear-gradient(135deg,#D79AA8,#C77D8A)' }}>
                            {(order.customer?.name || order.customerName || '?').charAt(0)}
                          </div>
                          <div>
                            <p className="text-xs font-bold" style={{ color: '#5A4047' }}>{order.customer?.name || order.customerName || '—'}</p>
                            <p className="text-[10px]" style={{ color: '#D79AA8' }}>{order.customer?.phone || order.customerPhone || ''}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs" style={{ color: '#5A4047' }}>{order.items?.length || 0} منتج</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-black text-sm" style={{ color: '#5A4047' }}>{order.total?.toFixed(2)} د.ب</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="relative group inline-block">
                          <button className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold"
                            style={{ background: sc.bg, color: sc.text }}>
                            {sc.label}
                            <ChevronDown className="w-3 h-3" />
                          </button>
                          <div className="absolute top-full right-0 mt-1 rounded-xl shadow-xl z-10 hidden group-hover:block"
                            style={{ background: '#FFFFFF', border: '1px solid #F0DDE0', minWidth: 140 }}>
                            {Object.entries(statusColors).map(([k, v]) => (
                              <button key={k} onClick={() => updateStatus(order.id, k)}
                                className="w-full text-right px-3 py-2 text-xs font-medium hover:bg-[#FFF8F8] transition-colors"
                                style={{ color: v.text }}>
                                {v.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs" style={{ color: '#D79AA8' }}>{order.date?.substring(0,10)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <button className="p-1.5 rounded-lg hover:bg-[#F3E6E8] transition-colors"
                          onClick={() => navigate(`/admin/orders/${order.id}`)}>
                          <Eye className="w-4 h-4" style={{ color: '#D79AA8' }} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
