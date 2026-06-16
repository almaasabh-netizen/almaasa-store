import React, { useState } from 'react';
import { Bell, Search, Sun, Moon, ChevronDown, Menu } from 'lucide-react';
import { getStoredData } from '../../data';

interface HeaderProps {
  darkMode: boolean;
  onToggleDark: () => void;
  onMenuOpen: () => void;
  title: string;
}

export default function Header({ darkMode, onToggleDark, onMenuOpen, title }: HeaderProps) {
  const [showNotifs, setShowNotifs] = useState(false);
  const data = getStoredData();
  const newOrders = data.orders?.filter((o: any) => o.status === 'new').length || 0;
  const lowStock = data.products?.filter((p: any) => p.stock > 0 && p.stock <= 5).length || 0;

  const notifs = [
    ...(newOrders > 0 ? [{ icon: '🛍️', text: `${newOrders} طلب جديد بانتظار المعالجة`, time: 'الآن', color: '#3B82F6' }] : []),
    ...(lowStock > 0 ? [{ icon: '📦', text: `${lowStock} منتج على وشك النفاد`, time: 'منذ 5 دقائق', color: '#F59E0B' }] : []),
  ];

  return (
    <header
      className="flex items-center gap-3 px-5 py-3 border-b"
      style={{ background: '#FFFFFF', borderColor: '#F0DDE0', height: 64 }}
    >
      {/* Mobile menu button */}
      <button onClick={onMenuOpen} className="lg:hidden p-2 rounded-lg hover:bg-[#F3E6E8]">
        <Menu className="w-5 h-5" style={{ color: '#5A4047' }} />
      </button>

      {/* Title */}
      <h1 className="font-black text-lg hidden sm:block" style={{ color: '#5A4047' }}>{title}</h1>

      {/* Search */}
      <div className="flex-1 max-w-xs hidden md:flex items-center gap-2 rounded-xl px-3 py-2 mr-4"
        style={{ background: '#FFF8F8', border: '1px solid #F0DDE0' }}>
        <Search className="w-4 h-4 shrink-0" style={{ color: '#D79AA8' }} />
        <input
          type="text"
          placeholder="بحث عن طلب، منتج، عميل..."
          className="bg-transparent text-sm flex-1 outline-none"
          style={{ color: '#5A4047' }}
          dir="rtl"
        />
      </div>

      <div className="flex items-center gap-2 mr-auto">
        {/* Dark mode */}
        <button
          onClick={onToggleDark}
          className="p-2 rounded-xl transition-colors hover:bg-[#F3E6E8]"
        >
          {darkMode
            ? <Sun className="w-4.5 h-4.5" style={{ width: 18, height: 18, color: '#D79AA8' }} />
            : <Moon className="w-4.5 h-4.5" style={{ width: 18, height: 18, color: '#D79AA8' }} />
          }
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="relative p-2 rounded-xl transition-colors hover:bg-[#F3E6E8]"
          >
            <Bell style={{ width: 18, height: 18, color: '#D79AA8' }} />
            {notifs.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ background: '#E05C6E' }} />
            )}
          </button>

          {showNotifs && (
            <div
              className="absolute left-0 top-full mt-2 w-80 rounded-2xl shadow-xl z-50 overflow-hidden"
              style={{ background: '#FFFFFF', border: '1px solid #F0DDE0' }}
            >
              <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: '#F0DDE0' }}>
                <p className="font-black text-sm" style={{ color: '#5A4047' }}>الإشعارات</p>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: '#F3E6E8', color: '#C77D8A' }}>{notifs.length}</span>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifs.map((n, i) => (
                  <div key={i} className="flex items-start gap-3 px-4 py-3 hover:bg-[#FFF8F8] transition-colors border-b last:border-0" style={{ borderColor: '#F0DDE0' }}>
                    <span className="text-lg shrink-0">{n.icon}</span>
                    <div className="flex-1">
                      <p className="text-xs font-medium" style={{ color: '#5A4047' }}>{n.text}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: '#D79AA8' }}>{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User */}
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-[#F3E6E8] transition-colors">
          <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-sm text-white"
            style={{ background: 'linear-gradient(135deg,#D79AA8,#C77D8A)' }}>م</div>
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold" style={{ color: '#5A4047' }}>مدير المتجر</p>
            <p className="text-[10px]" style={{ color: '#D79AA8' }}>مدير النظام</p>
          </div>
          <ChevronDown className="w-3 h-3" style={{ color: '#D79AA8' }} />
        </button>
      </div>
    </header>
  );
}
