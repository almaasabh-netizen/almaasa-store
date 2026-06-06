import React, { useMemo } from 'react';
import { ShoppingBag, Users, DollarSign, TrendingUp, Package, AlertTriangle, ArrowLeft } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import StatCard from '../components/StatCard';
import RevenueChart from '../components/RevenueChart';
import OrdersTable from '../components/OrdersTable';
import { getStoredData } from '../../data';
import { statusColors } from '../theme';

const PIE_COLORS = ['#D79AA8','#C77D8A','#F3E6E8','#B86070','#E8B4BE'];

export default function Dashboard() {
  const navigate = useNavigate();
  const data = getStoredData();
  const orders: any[] = data.orders || [];
  const products: any[] = data.products || [];
  const reviews: any[] = data.reviews || [];

  const totalRevenue = orders.filter(o => o.status !== 'cancelled').reduce((s: number, o: any) => s + (o.total || 0), 0);
  const uniqueCustomers = new Set(orders.map((o: any) => o.customerPhone)).size;
  const avgOrder = orders.length > 0 ? totalRevenue / orders.length : 0;

  const statusDist = Object.entries(
    orders.reduce((acc: any, o: any) => { acc[o.status] = (acc[o.status] || 0) + 1; return acc; }, {})
  ).map(([status, count]) => ({
    name: statusColors[status]?.label ?? status,
    value: count as number,
    color: statusColors[status]?.text ?? '#D79AA8',
  }));

  const topProducts = [...products]
    .filter(p => !p.isDraft)
    .sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0))
    .slice(0, 5);

  const lowStock = products.filter(p => p.stock > 0 && p.stock <= 5);

  const recentOrders = [...orders].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  const isEmpty = orders.length === 0 && products.length === 0;

  return (
    <div className="space-y-6" dir="rtl">

      {/* Welcome banner when store is empty */}
      {isEmpty && (
        <div className="rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6"
          style={{ background: 'linear-gradient(135deg, #FFF0F4, #F3E6E8)', border: '1px solid #F0DDE0' }}>
          <div className="text-4xl shrink-0">✨</div>
          <div className="flex-1 text-right">
            <p className="font-black text-base mb-1" style={{ color: '#5A4047' }}>مرحباً بكِ في لوحة تحكم ألماسة!</p>
            <p className="text-sm" style={{ color: '#9A7A82' }}>ابدئي بإضافة منتجاتك وتهيئة المتجر</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigate('/admin/products/new')}
              className="px-4 py-2 rounded-xl text-sm font-bold text-white"
              style={{ background: '#D79AA8' }}>
              أضف منتج
            </button>
            <button onClick={() => navigate('/admin/settings')}
              className="px-4 py-2 rounded-xl text-sm font-bold"
              style={{ background: '#FFFFFF', color: '#5A4047', border: '1px solid #F0DDE0' }}>
              الإعدادات
            </button>
          </div>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="إجمالي المبيعات"
          value={totalRevenue.toFixed(0)}
          suffix=" د.ب"
          change={16.8}
          iconBg="#F3E6E8"
          icon={<DollarSign className="w-5 h-5" style={{ color: '#C77D8A' }} />}
        />
        <StatCard
          title="إجمالي الطلبات"
          value={orders.length}
          change={12.5}
          iconBg="#EBF5FF"
          icon={<ShoppingBag className="w-5 h-5" style={{ color: '#3B82F6' }} />}
        />
        <StatCard
          title="العملاء الجدد"
          value={uniqueCustomers}
          change={8.2}
          iconBg="#F0FDF4"
          icon={<Users className="w-5 h-5" style={{ color: '#22C55E' }} />}
        />
        <StatCard
          title="متوسط قيمة الطلب"
          value={avgOrder.toFixed(2)}
          suffix=" د.ب"
          change={18.6}
          iconBg="#FFF7ED"
          icon={<TrendingUp className="w-5 h-5" style={{ color: '#F59E0B' }} />}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue chart */}
        <div className="lg:col-span-2 rounded-2xl p-5" style={{ background: '#FFFFFF', border: '1px solid #F0DDE0' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-sm" style={{ color: '#5A4047' }}>المبيعات</h3>
            <div className="flex gap-1">
              {['اليوم','الأسبوع','الشهر','السنة'].map((t,i) => (
                <button key={t} className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors ${i===2?'text-white':''}`}
                  style={{ background: i===2?'#D79AA8':'transparent', color: i===2?'white':'#D79AA8' }}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <RevenueChart type="area" />
        </div>

        {/* Pie chart */}
        <div className="rounded-2xl p-5" style={{ background: '#FFFFFF', border: '1px solid #F0DDE0' }}>
          <h3 className="font-black text-sm mb-4" style={{ color: '#5A4047' }}>توزيع المبيعات</h3>
          {statusDist.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={statusDist} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                    {statusDist.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: any) => [v, 'طلب']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {statusDist.slice(0,4).map((s, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="text-xs" style={{ color: '#5A4047' }}>{s.name}</span>
                    </div>
                    <span className="text-xs font-bold" style={{ color: '#5A4047' }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-48 flex items-center justify-center text-sm" style={{ color: '#D79AA8' }}>لا توجد بيانات بعد</div>
          )}
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Latest orders */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-black text-sm" style={{ color: '#5A4047' }}>آخر الطلبات</h3>
            <button className="text-xs font-bold flex items-center gap-1 hover:underline" style={{ color: '#C77D8A' }} onClick={() => navigate('/admin/orders')}>
              عرض الكل <ArrowLeft className="w-3 h-3" />
            </button>
          </div>
          <OrdersTable orders={recentOrders} />
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Top products */}
          <div className="rounded-2xl p-4" style={{ background: '#FFFFFF', border: '1px solid #F0DDE0' }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-black text-sm" style={{ color: '#5A4047' }}>أفضل المنتجات</h3>
              <button className="text-xs" style={{ color: '#C77D8A' }} onClick={() => navigate('/admin/products')}>عرض الكل</button>
            </div>
            <div className="space-y-2.5">
              {topProducts.length > 0 ? topProducts.map((p, i) => (
                <div key={p.id} className="flex items-center gap-3">
                  <span className="text-xs font-black w-5 shrink-0 text-center" style={{ color: '#D79AA8' }}>#{i+1}</span>
                  <img src={p.image} alt={p.name} referrerPolicy="no-referrer"
                    className="w-9 h-9 rounded-xl object-cover shrink-0" style={{ border: '1px solid #F0DDE0' }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate" style={{ color: '#5A4047' }}>{p.name}</p>
                    <p className="text-[10px]" style={{ color: '#D79AA8' }}>{p.reviewCount || 0} تقييم</p>
                  </div>
                  <span className="text-xs font-black shrink-0" style={{ color: '#C77D8A' }}>{p.price} د.ب</span>
                </div>
              )) : (
                <p className="text-xs text-center py-4" style={{ color: '#D79AA8' }}>أضف منتجات لتظهر هنا</p>
              )}
            </div>
          </div>

          {/* Low stock alerts */}
          <div className="rounded-2xl p-4" style={{ background: lowStock.length > 0 ? '#FFF7ED' : '#FFFFFF', border: `1px solid ${lowStock.length > 0 ? '#FED7AA' : '#F0DDE0'}` }}>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4" style={{ color: lowStock.length > 0 ? '#F59E0B' : '#D79AA8' }} />
              <h3 className="font-black text-sm" style={{ color: '#5A4047' }}>تنبيهات المخزون</h3>
            </div>
            {lowStock.length > 0 ? (
              <div className="space-y-2">
                {lowStock.slice(0,4).map(p => (
                  <div key={p.id} className="flex items-center justify-between">
                    <p className="text-xs font-medium truncate flex-1" style={{ color: '#5A4047' }}>{p.name}</p>
                    <span className="text-xs font-black px-2 py-0.5 rounded-full mr-2" style={{ background: '#FEF2F2', color: '#EF4444' }}>
                      {p.stock} متبقي
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs" style={{ color: '#D79AA8' }}>لا توجد منتجات على وشك النفاد ✓</p>
            )}
          </div>

          {/* Reviews summary */}
          <div className="rounded-2xl p-4" style={{ background: '#FFFFFF', border: '1px solid #F0DDE0' }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-black text-sm" style={{ color: '#5A4047' }}>التقييمات الأخيرة</h3>
              <span className="text-xs font-bold" style={{ color: '#D79AA8' }}>{reviews.length} تقييم</span>
            </div>
            {reviews.slice(0,3).map(r => (
              <div key={r.id} className="flex items-start gap-2 mb-2.5 last:mb-0">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-black shrink-0"
                  style={{ background: 'linear-gradient(135deg,#D79AA8,#C77D8A)' }}>
                  {r.customerName?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-bold" style={{ color: '#5A4047' }}>{r.customerName}</span>
                    <span className="text-[10px]" style={{ color: '#F5A623' }}>{'★'.repeat(r.rating)}</span>
                  </div>
                  <p className="text-[10px] truncate" style={{ color: '#D79AA8' }}>{r.comment}</p>
                </div>
              </div>
            ))}
            {reviews.length === 0 && <p className="text-xs text-center py-2" style={{ color: '#D79AA8' }}>لا توجد تقييمات بعد</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
