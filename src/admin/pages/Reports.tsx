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

  const topProducts = [...products].sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0)).slice(0, 7).map(p => ({
    name: p.name?.slice(0, 10), value: p.reviewCount || 0,
  }));

  const statusDist = ['new','processing','shipping','delivered','cancelled','returned'].map(s => ({
    name: { new:'جديد', processing:'تجهيز', shipping:'شحن', delivered:'تسليم', cancelled:'ملغي', returned:'مُرتجع' }[s],
    value: orders.filter((o: any) => o.status === s).length,
  })).filter(x => x.value > 0);

  const totalRevenue = orders.filter((o: any) => o.status !== 'cancelled').reduce((s: number, o: any) => s + (o.total || 0), 0);
  const deliveredOrders = orders.filter((o: any) => o.status === 'delivered').length;
  const conversionRate = orders.length > 0 ? ((deliveredOrders / orders.length) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-4" dir="rtl">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'إجمالي الإيرادات', value: `${totalRevenue.toFixed(0)} د.ب`, color: '#C77D8A', bg: '#F3E6E8' },
          { label: 'إجمالي الطلبات', value: orders.length, color: '#3B82F6', bg: '#EBF5FF' },
          { label: 'معدل التسليم', value: `${conversionRate}%`, color: '#22C55E', bg: '#F0FDF4' },
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
    </div>
  );
}
