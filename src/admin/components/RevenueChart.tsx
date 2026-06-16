import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { getStoredData } from '../../data';

const MONTHS = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];

function buildChartData() {
  const orders = getStoredData().orders || [];
  const now = new Date();
  return MONTHS.map((name, i) => {
    const monthOrders = orders.filter((o: any) => {
      const d = new Date(o.date || o.createdAt || '');
      return d.getFullYear() === now.getFullYear() && d.getMonth() === i;
    });
    return {
      name,
      revenue: monthOrders.reduce((s: number, o: any) => s + (o.total || 0), 0),
      orders: monthOrders.length,
    };
  });
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="rounded-xl p-3 shadow-lg text-right" style={{ background: '#FFFFFF', border: '1px solid #F0DDE0' }}>
        <p className="text-xs font-bold mb-1" style={{ color: '#5A4047' }}>{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} className="text-xs" style={{ color: p.color }}>
            {p.name === 'revenue' ? 'الإيرادات' : 'الطلبات'}: <span className="font-black">{p.value.toLocaleString('ar')}</span>
            {p.name === 'revenue' ? ' د.ب' : ''}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function RevenueChart({ type = 'area' }: { type?: 'area' | 'bar' }) {
  const data = buildChartData();
  return (
    <ResponsiveContainer width="100%" height={240}>
      {type === 'area' ? (
        <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#D79AA8" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#D79AA8" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#F0DDE0" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#D79AA8' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#D79AA8' }} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : String(v)} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="revenue" stroke="#D79AA8" strokeWidth={2.5} fill="url(#revGrad)" dot={false} activeDot={{ r: 5, fill: '#C77D8A' }} />
        </AreaChart>
      ) : (
        <BarChart data={data.slice(-7)} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F0DDE0" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#D79AA8' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#D79AA8' }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="orders" fill="#D79AA8" radius={[6, 6, 0, 0]} />
        </BarChart>
      )}
    </ResponsiveContainer>
  );
}
