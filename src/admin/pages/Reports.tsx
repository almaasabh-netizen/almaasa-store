import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { getStoredData } from '../../data';

const MONTHS = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-5" style={{ background: '#FFFFFF', border: '1px solid #F0DDE0' }}>
      <h3 className="font-black text-sm mb-4" style={{ color: '#5A4047' }}>{title}</h3>
      {children}
    </div>
  );
}

export default function Reports() {
  const data = getStoredData();
  const orders = data.orders || [];
  const products = data.products || [];

  const revenueByMonth = MONTHS.map((m, i) => ({
    name: m.slice(0,3),
    revenue: orders.filter((o: any) => new Date(o.date).getMonth() === i && o.status !== 'cancelled')
      .reduce((s: number, o: any) => s + (o.total || 0), 0),
    orders: orders.filter((o: any) => new Date(o.date).getMonth() === i).length,
  }));

  // Count actual sold units per product from orders
  const salesByProduct: Record<string, number> = {};
  orders.filter((o: any) => o.status !== 'cancelled').forEach((o: any) => {
    (o.items || []).forEach((item: any) => {
      const pid = item.product?.id || item.productId;
      if (pid) salesByProduct[pid] = (salesByProduct[pid] || 0) + (item.quantity || 1);
    });
  });
  const topProducts = [...products]
    .map(p => ({ name: p.name?.slice(0, 10), value: salesByProduct[p.id] || 0 }))
    .filter(p => p.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 7);

  const statusDist = ['new','processing','shipping','delivered','cancelled','returned'].map(s => ({
    name: { new:'جديد', processing:'تجهيز', shipping:'شحن', delivered:'تسليم', cancelled:'ملغي', returned:'مُرتجع' }[s],
    value: orders.filter((o: any) => o.status === s).length,
  })).filter(x => x.value > 0);

  const totalRevenue = orders.filter((o: any) => o.status !== 'cancelled').reduce((s: number, o: any) => s + (o.total || 0), 0);
  const deliveredOrders = orders.filter((o: any) => o.status === 'delivered').length;
  const conversionRate = orders.length > 0 ? ((deliveredOrders / orders.length) * 100).toFixed(1) : '0';

  const productsWithCost = products.filter((p: any) => p.originalPrice && p.price > 0);
  const avgMargin = productsWithCost.length > 0
    ? productsWithCost.reduce((s: number, p: any) => s + ((p.price - p.originalPrice) / p.price) * 100, 0) / productsWithCost.length
    : 0;
  const estimatedProfit = orders.filter((o: any) => o.status === 'delivered').reduce((sum: number, o: any) => {
    return sum + (o.items || []).reduce((s: number, item: any) => {
      const pid = item.product?.id || item.productId;
      const prod = products.find((p: any) => p.id === pid) || item.product;
      const price = item.product?.price || item.price || 0;
      if (prod?.originalPrice) return s + (prod.price - prod.originalPrice) * (item.quantity || 1);
      return s + price * (item.quantity || 1) * 0.3;
    }, 0);
  }, 0);
  const profitMarginByProduct = productsWithCost.map((p: any) => ({
    name: p.name?.slice(0, 12),
    margin: Math.round(((p.price - p.originalPrice) / p.price) * 100),
    profit: +(p.price - p.originalPrice).toFixed(3),
  })).sort((a, b) => b.margin - a.margin).slice(0, 8);

  return (
    <div className="space-y-4" dir="rtl">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'إجمالي الإيرادات', value: `${totalRevenue.toFixed(0)} د.ب`, color: '#C77D8A', bg: '#F3E6E8' },
          { label: 'الربح المقدر (مُسلَّم)', value: `${estimatedProfit.toFixed(0)} د.ب`, color: '#22C55E', bg: '#F0FDF4' },
          { label: 'متوسط هامش الربح', value: productsWithCost.length > 0 ? `${avgMargin.toFixed(1)}%` : 'أضف سعر التكلفة', color: '#8B5CF6', bg: '#F5F3FF' },
          { label: 'المنتجات النشطة', value: products.filter((p: any) => !p.isDraft).length, color: '#F59E0B', bg: '#FFF7ED' },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-4" style={{ background: s.bg }}>
            <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs mt-1 font-medium" style={{ color: s.color }}>{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="الإيرادات الشهرية">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={revenueByMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0DDE0" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#D79AA8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#D79AA8' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}`} />
              <Tooltip formatter={(v: any) => [`${v} د.ب`, 'الإيرادات']} />
              <Line type="monotone" dataKey="revenue" stroke="#D79AA8" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: '#C77D8A' }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card title="الطلبات الشهرية">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={revenueByMonth.slice(-7)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0DDE0" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#D79AA8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#D79AA8' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: any) => [v, 'طلب']} />
              <Bar dataKey="orders" fill="#D79AA8" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="أفضل المنتجات (حسب التقييمات)">
          {topProducts.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topProducts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#F0DDE0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#D79AA8' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#5A4047' }} axisLine={false} tickLine={false} width={70} />
                <Tooltip />
                <Bar dataKey="value" fill="#C77D8A" radius={[0, 6, 6, 0]} name="تقييمات" />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-center py-10" style={{ color: '#D79AA8' }}>لا توجد بيانات</p>}
        </Card>

        <Card title="توزيع حالات الطلبات">
          {statusDist.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={statusDist}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0DDE0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#D79AA8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#D79AA8' }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v: any) => [v, 'طلب']} />
                <Bar dataKey="value" fill="#D79AA8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-center py-10" style={{ color: '#D79AA8' }}>لا توجد بيانات</p>}
        </Card>
      </div>

      {profitMarginByProduct.length > 0 && (
        <Card title="هامش الربح لكل منتج">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ color: '#D79AA8' }}>
                  <th className="text-right pb-3 font-bold text-xs">المنتج</th>
                  <th className="text-center pb-3 font-bold text-xs">سعر البيع</th>
                  <th className="text-center pb-3 font-bold text-xs">سعر التكلفة</th>
                  <th className="text-center pb-3 font-bold text-xs">الربح</th>
                  <th className="text-center pb-3 font-bold text-xs">الهامش %</th>
                </tr>
              </thead>
              <tbody>
                {productsWithCost.sort((a: any, b: any) => ((b.price - b.originalPrice) / b.price) - ((a.price - a.originalPrice) / a.price)).map((p: any) => {
                  const margin = Math.round(((p.price - p.originalPrice) / p.price) * 100);
                  const profit = +(p.price - p.originalPrice).toFixed(3);
                  return (
                    <tr key={p.id} className="border-t" style={{ borderColor: '#F0DDE0' }}>
                      <td className="py-2.5 font-medium text-xs" style={{ color: '#5A4047' }}>{p.name?.slice(0, 20)}</td>
                      <td className="text-center text-xs" style={{ color: '#5A4047' }}>{p.price} د.ب</td>
                      <td className="text-center text-xs" style={{ color: '#9A7A82' }}>{p.originalPrice} د.ب</td>
                      <td className="text-center text-xs font-bold" style={{ color: '#22C55E' }}>{profit} د.ب</td>
                      <td className="text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black"
                          style={{ background: margin >= 40 ? '#F0FDF4' : margin >= 20 ? '#FFF7ED' : '#FEF2F2', color: margin >= 40 ? '#22C55E' : margin >= 20 ? '#F59E0B' : '#EF4444' }}>
                          {margin}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
