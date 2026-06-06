import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  iconBg?: string;
  suffix?: string;
  prefix?: string;
}

export default function StatCard({ title, value, change, icon, iconBg = '#F3E6E8', suffix, prefix }: StatCardProps) {
  const isPositive = (change ?? 0) >= 0;
  return (
    <div className="rounded-2xl p-5 flex flex-col gap-3 hover:shadow-md transition-shadow"
      style={{ background: '#FFFFFF', border: '1px solid #F0DDE0' }}>
      <div className="flex items-center justify-between">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: iconBg }}>
          {icon}
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full`}
            style={{ background: isPositive ? '#F0FDF4' : '#FEF2F2', color: isPositive ? '#16A34A' : '#EF4444' }}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <div>
        <p className="text-2xl font-black" style={{ color: '#5A4047' }}>
          {prefix}{typeof value === 'number' ? value.toLocaleString('ar') : value}{suffix}
        </p>
        <p className="text-xs mt-0.5 font-medium" style={{ color: '#D79AA8' }}>{title}</p>
      </div>
      {change !== undefined && (
        <p className="text-[11px]" style={{ color: '#D79AA8' }}>
          {isPositive ? '▲' : '▼'} {Math.abs(change)}% من الشهر الماضي
        </p>
      )}
    </div>
  );
}
