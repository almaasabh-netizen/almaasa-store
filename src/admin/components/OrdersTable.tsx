import React from 'react';
import { useNavigate } from 'react-router-dom';
import { statusColors } from '../theme';
import { Eye } from 'lucide-react';
import type { Order } from '../../types';

interface Props { orders: Order[]; limit?: number; showViewAll?: boolean; }

export default function OrdersTable({ orders, limit, showViewAll }: Props) {
  const navigate = useNavigate();
  const shown = limit ? orders.slice(0, limit) : orders;

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #F0DDE0', background: '#FFFFFF' }}>
      <div className="overflow-x-auto">
        <table className="w-full text-right">
          <thead>
            <tr style={{ background: '#FFF8F8' }}>
              {['رقم الطلب','العميل','المبلغ','الحالة','التاريخ',''].map(h => (
                <th key={h} className="px-4 py-3 text-xs font-bold" style={{ color: '#D79AA8' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shown.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-sm" style={{ color: '#D79AA8' }}>لا توجد طلبات</td></tr>
            ) : shown.map(order => {
              const sc = statusColors[order.status] ?? statusColors.new;
              return (
                <tr key={order.id} className="border-t hover:bg-[#FFF8F8] transition-colors cursor-pointer"
                  style={{ borderColor: '#F0DDE0' }}
                  onClick={() => navigate(`/admin/orders/${order.id}`)}>
                  <td className="px-4 py-3">
                    <span className="font-black text-sm" style={{ color: '#C77D8A' }}>#{order.id.slice(-5)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-black shrink-0"
                        style={{ background: 'linear-gradient(135deg,#D79AA8,#C77D8A)' }}>
                        {order.customerName?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-bold" style={{ color: '#5A4047' }}>{order.customerName}</p>
                        <p className="text-[10px]" style={{ color: '#D79AA8' }}>{order.customerPhone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-black text-sm" style={{ color: '#5A4047' }}>{order.total?.toFixed(2)} د.ب</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold"
                      style={{ background: sc.bg, color: sc.text }}>{sc.label}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs" style={{ color: '#D79AA8' }}>{order.date?.substring(0,10)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button className="p-1.5 rounded-lg hover:bg-[#F3E6E8] transition-colors" onClick={e => { e.stopPropagation(); navigate(`/admin/orders/${order.id}`); }}>
                      <Eye className="w-4 h-4" style={{ color: '#D79AA8' }} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {showViewAll && shown.length > 0 && (
        <div className="px-4 py-3 border-t text-center" style={{ borderColor: '#F0DDE0' }}>
          <button className="text-xs font-bold hover:underline" style={{ color: '#C77D8A' }} onClick={() => navigate('/admin/orders')}>
            عرض جميع الطلبات ←
          </button>
        </div>
      )}
    </div>
  );
}
