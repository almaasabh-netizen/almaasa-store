import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getStoredData } from '../../data';
import { statusColors } from '../theme';

const CARD_BORDER = '1px solid rgba(154,45,85,.12)';

function StatCard({ title, value, suffix = '', bg, icon }: { title: string; value: string | number; suffix?: string; bg: string; icon: React.ReactNode }) {
  return (
    <div style={{ background: '#FFFFFF', border: CARD_BORDER, borderRadius: 12, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ width: 42, height: 42, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#241419', lineHeight: 1.2 }}>{value}{suffix}</div>
        <div style={{ fontSize: 11, color: '#9a8a85', marginTop: 3 }}>{title}</div>
      </div>
    </div>
  );
}

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div style={{ height: 6, background: '#F3EAE2', borderRadius: 3, overflow: 'hidden', marginTop: 4 }}>
      <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 3, transition: 'width .4s' }} />
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const data = getStoredData();
  const orders: any[] = data.orders || [];
  const products: any[] = data.products || [];
  const reviews: any[] = data.reviews || [];

  const totalRevenue = orders.filter(o => o.shippingStatus !== 'cancelled' && o.shippingStatus !== 'returned').reduce((s: number, o: any) => s + (o.total || 0), 0);
  const uniqueCustomers = new Set(orders.map((o: any) => o.customer?.phone || o.customerPhone).filter(Boolean)).size;
  const avgOrder = orders.length > 0 ? totalRevenue / orders.length : 0;

  const topProducts = [...products].filter(p => !p.isDraft).sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0)).slice(0, 5);
  const lowStock = products.filter(p => p.stock > 0 && p.stock <= 5);
  const recentOrders = [...orders].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 6);
  const isEmpty = orders.length === 0 && products.length === 0;

  const statusDist = Object.entries(
    orders.reduce((acc: any, o: any) => { const s = o.shippingStatus || o.status || 'pending'; acc[s] = (acc[s] || 0) + 1; return acc; }, {})
  ).map(([status, count]) => ({
    label: statusColors[status]?.label ?? status,
    value: count as number,
    color: statusColors[status]?.text ?? '#9A2D55',
    bg: statusColors[status]?.bg ?? '#F6DCE4',
  }));

  const maxStatus = Math.max(...statusDist.map(s => s.value), 1);

  const statusBadgeStyle = (status: string) => {
    const c = statusColors[status] || { bg: '#F6DCE4', text: '#9A2D55', label: status };
    return { background: c.bg, color: c.text, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap' as const };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} dir="rtl">

      {isEmpty && (
        <div style={{
          borderRadius: 12, padding: '24px 20px', display: 'flex', alignItems: 'center', gap: 16,
          background: '#FFF0F4', border: CARD_BORDER,
        }}>
          <span style={{ fontSize: 36, flexShrink: 0 }}>✨</span>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#241419', margin: 0 }}>مرحباً بكِ في لوحة تحكم ألماسة!</p>
            <p style={{ fontSize: 12, color: '#9a8a85', marginTop: 4 }}>ابدئي بإضافة منتجاتك وتهيئة المتجر</p>
          </div>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <button onClick={() => navigate('/admin/products/new')} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#9A2D55', color: 'white', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: "'Cairo', sans-serif" }}>أضف منتج</button>
            <button onClick={() => navigate('/admin/settings')} style={{ padding: '8px 16px', borderRadius: 8, border: CARD_BORDER, background: '#FFFFFF', color: '#241419', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: "'Cairo', sans-serif" }}>الإعدادات</button>
          </div>
        </div>
      )}

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
        <StatCard title="إجمالي المبيعات" value={totalRevenue.toFixed(0)} suffix=" د.ب" bg="#F6DCE4" icon={<span style={{ fontSize: 18 }}>💰</span>} />
        <StatCard title="إجمالي الطلبات" value={orders.length} bg="#EBF5FF" icon={<span style={{ fontSize: 18 }}>🛍️</span>} />
        <StatCard title="العملاء" value={uniqueCustomers} bg="#F0FDF4" icon={<span style={{ fontSize: 18 }}>👥</span>} />
        <StatCard title="متوسط الطلب" value={avgOrder.toFixed(2)} suffix=" د.ب" bg="#FFF7ED" icon={<span style={{ fontSize: 18 }}>📈</span>} />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 14 }} className="dashboard-charts">
        {/* Status distribution */}
        <div style={{ background: '#FFFFFF', border: CARD_BORDER, borderRadius: 12, padding: '18px 20px' }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: '#241419', margin: '0 0 16px' }}>توزيع حالات الطلبات</h3>
          {statusDist.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {statusDist.map((s, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                    <span style={{ fontSize: 12, color: '#241419' }}>{s.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#241419' }}>{s.value}</span>
                  </div>
                  <MiniBar value={s.value} max={maxStatus} color={s.color} />
                </div>
              ))}
            </div>
          ) : (
            <div style={{ height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9a8a85', fontSize: 13 }}>لا توجد بيانات بعد</div>
          )}
        </div>

        {/* Top products */}
        <div style={{ background: '#FFFFFF', border: CARD_BORDER, borderRadius: 12, padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: '#241419', margin: 0 }}>أفضل المنتجات</h3>
            <button onClick={() => navigate('/admin/products')} style={{ fontSize: 11, color: '#9A2D55', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Cairo', sans-serif" }}>عرض الكل</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {topProducts.length > 0 ? topProducts.map((p, i) => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#B08D57', width: 18, flexShrink: 0, textAlign: 'center' }}>#{i + 1}</span>
                {p.image && <img src={p.image} alt={p.name} referrerPolicy="no-referrer" style={{ width: 34, height: 34, borderRadius: 8, objectFit: 'cover', flexShrink: 0, border: CARD_BORDER }} />}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: '#241419', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
                  <p style={{ fontSize: 10, color: '#9a8a85', margin: 0 }}>{p.price} د.ب</p>
                </div>
              </div>
            )) : <p style={{ fontSize: 12, color: '#9a8a85', textAlign: 'center', padding: '16px 0' }}>أضف منتجات لتظهر هنا</p>}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 14 }} className="dashboard-bottom">
        {/* Recent orders */}
        <div style={{ background: '#FFFFFF', border: CARD_BORDER, borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid rgba(154,45,85,.08)' }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: '#241419', margin: 0 }}>آخر الطلبات</h3>
            <button onClick={() => navigate('/admin/orders')} style={{ fontSize: 11, color: '#9A2D55', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Cairo', sans-serif" }}>عرض الكل ←</button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontFamily: "'Cairo', sans-serif" }}>
              <thead>
                <tr style={{ background: '#F3EAE2' }}>
                  {['رقم الطلب', 'العميل', 'المبلغ', 'الحالة', 'التاريخ'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', fontSize: 11, fontWeight: 600, color: '#6b5a5f' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding: '32px 16px', textAlign: 'center', fontSize: 12, color: '#9a8a85' }}>لا توجد طلبات بعد</td></tr>
                ) : recentOrders.map((o: any, i) => {
                  const status = o.shippingStatus || o.status || 'new';
                  const customer = o.customer?.name || o.customerName || '—';
                  return (
                    <tr key={o.id} style={{ borderTop: i > 0 ? '1px solid rgba(154,45,85,.07)' : 'none', cursor: 'pointer' }} onClick={() => navigate(`/admin/orders/${o.id}`)}>
                      <td style={{ padding: '10px 16px', fontSize: 12, fontWeight: 600, color: '#9A2D55' }}>#{o.id?.slice(-6)}</td>
                      <td style={{ padding: '10px 16px', fontSize: 12, color: '#241419' }}>{customer}</td>
                      <td style={{ padding: '10px 16px', fontSize: 12, fontWeight: 600, color: '#241419' }}>{o.total?.toFixed(2)} د.ب</td>
                      <td style={{ padding: '10px 16px' }}>
                        <span style={statusBadgeStyle(status)}>{statusColors[status]?.label ?? status}</span>
                      </td>
                      <td style={{ padding: '10px 16px', fontSize: 11, color: '#9a8a85' }}>{o.date?.substring(0, 10)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Low stock */}
          <div style={{ background: lowStock.length > 0 ? '#FFF7ED' : '#FFFFFF', border: `1px solid ${lowStock.length > 0 ? '#FED7AA' : 'rgba(154,45,85,.12)'}`, borderRadius: 12, padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 16 }}>{lowStock.length > 0 ? '⚠️' : '📦'}</span>
              <h3 style={{ fontSize: 12, fontWeight: 700, color: '#241419', margin: 0 }}>تنبيهات المخزون</h3>
            </div>
            {lowStock.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {lowStock.slice(0, 4).map(p => (
                  <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ fontSize: 11, color: '#241419', margin: 0, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 10, background: '#FEF2F2', color: '#EF4444', flexShrink: 0, marginRight: 6 }}>{p.stock} متبقي</span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: 11, color: '#9a8a85', margin: 0 }}>لا توجد منتجات على وشك النفاد ✓</p>
            )}
          </div>

          {/* Reviews */}
          <div style={{ background: '#FFFFFF', border: CARD_BORDER, borderRadius: 12, padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <h3 style={{ fontSize: 12, fontWeight: 700, color: '#241419', margin: 0 }}>التقييمات الأخيرة</h3>
              <span style={{ fontSize: 11, color: '#9a8a85' }}>{reviews.length} تقييم</span>
            </div>
            {reviews.slice(0, 3).map((r: any) => (
              <div key={r.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#F6DCE4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9A2D55', fontWeight: 700, fontSize: 11, flexShrink: 0 }}>
                  {r.customerName?.charAt(0)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#241419' }}>{r.customerName}</span>
                    <span style={{ fontSize: 10, color: '#F5A623' }}>{'★'.repeat(r.rating || 0)}</span>
                  </div>
                  <p style={{ fontSize: 10, color: '#9a8a85', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.comment}</p>
                </div>
              </div>
            ))}
            {reviews.length === 0 && <p style={{ fontSize: 11, color: '#9a8a85', textAlign: 'center', padding: '8px 0' }}>لا توجد تقييمات بعد</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
