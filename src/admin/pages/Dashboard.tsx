import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, ShoppingBag, Users, TrendingUp, Package, AlertTriangle, Star } from 'lucide-react';
import { getStoredData } from '../../data';
import { statusColors } from '../theme';
import DraggableWidgetGrid, { type WidgetItem } from '@/components/ui/draggable-widget-grid';

type WidgetId = 'revenue' | 'orders' | 'customers' | 'avg' | 'status' | 'top' | 'recent' | 'stock' | 'products' | 'reviews';

// 16 cells total, so the layout tiles exactly at 4 columns.
const DEFAULT_LAYOUT: WidgetItem[] = [
  { id: 'revenue', size: 'sm', label: 'إجمالي المبيعات' },
  { id: 'orders', size: 'sm', label: 'إجمالي الطلبات' },
  { id: 'customers', size: 'sm', label: 'العملاء' },
  { id: 'avg', size: 'sm', label: 'متوسط الطلب' },
  { id: 'recent', size: 'lg', label: 'آخر الطلبات' },
  { id: 'status', size: 'wide', label: 'توزيع حالات الطلبات' },
  { id: 'stock', size: 'sm', label: 'تنبيهات المخزون' },
  { id: 'products', size: 'sm', label: 'المنتجات' },
  { id: 'top', size: 'tall', label: 'أفضل المنتجات' },
  { id: 'reviews', size: 'tall', label: 'التقييمات الأخيرة' },
];

const LAYOUT_KEY = 'ama_dashboard_layout';

// Restore the saved order; unknown ids are dropped and new widgets appended.
function initialLayout(): WidgetItem[] {
  try {
    const saved: string[] = JSON.parse(localStorage.getItem(LAYOUT_KEY) || '[]');
    const byId = new Map(DEFAULT_LAYOUT.map(w => [w.id, w]));
    const ordered = saved.map(id => byId.get(id)).filter(Boolean) as WidgetItem[];
    return [...ordered, ...DEFAULT_LAYOUT.filter(w => !saved.includes(w.id))];
  } catch {
    return DEFAULT_LAYOUT;
  }
}

function saveLayout(items: WidgetItem[]) {
  try { localStorage.setItem(LAYOUT_KEY, JSON.stringify(items.map(i => i.id))); } catch { /* storage unavailable */ }
}

function Shell({ title, icon, action, children }: { title: string; icon?: React.ReactNode; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="flex h-full flex-col gap-3 p-4" style={{ fontFamily: "'Cairo', sans-serif" }}>
      <header className="flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 truncate text-[13px] font-bold text-foreground">
          {icon && <span className="text-muted-foreground">{icon}</span>}
          {title}
        </h3>
        {action}
      </header>
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </section>
  );
}

function Stat({ title, value, unit, icon, tint }: { title: string; value: string | number; unit?: string; icon: React.ReactNode; tint: string }) {
  return (
    <Shell title={title}>
      <div className="mt-auto flex items-end justify-between gap-2">
        <p className="text-[28px] leading-none font-bold text-foreground tabular-nums">
          {value}{unit && <span className="text-[13px] font-normal text-muted-foreground"> {unit}</span>}
        </p>
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl" style={{ background: tint }}>{icon}</span>
      </div>
    </Shell>
  );
}

const CARD_BORDER = '1px solid rgba(154,45,85,.12)';

export default function Dashboard() {
  const navigate = useNavigate();
  const data = getStoredData();
  const orders: any[] = data.orders || [];
  const products: any[] = data.products || [];
  const reviews: any[] = data.reviews || [];

  const totalRevenue = orders.filter(o => o.shippingStatus !== 'cancelled' && o.shippingStatus !== 'returned').reduce((s: number, o: any) => s + (o.total || 0), 0);
  const uniqueCustomers = new Set(orders.map((o: any) => o.customer?.phone || o.customerPhone).filter(Boolean)).size;
  const avgOrder = orders.length > 0 ? totalRevenue / orders.length : 0;

  const soldCount = (id: string) => orders.reduce((n: number, o: any) =>
    n + (o.items || []).filter((i: any) => i.product?.id === id).reduce((q: number, i: any) => q + (i.quantity || 0), 0), 0);
  const topProducts = [...products].filter(p => !p.isDraft).map(p => ({ ...p, sold: soldCount(p.id) }))
    .sort((a, b) => b.sold - a.sold).slice(0, 5);
  const lowStock = products.filter(p => p.stock > 0 && p.stock <= 5);
  const outOfStock = products.filter(p => p.stock === 0).length;
  const drafts = products.filter(p => p.isDraft).length;
  const recentOrders = [...orders].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 6);
  const isEmpty = orders.length === 0 && products.length === 0;

  const statusDist = Object.entries(
    orders.reduce((acc: any, o: any) => { const s = o.shippingStatus || o.status || 'pending'; acc[s] = (acc[s] || 0) + 1; return acc; }, {})
  ).map(([status, count]) => ({
    label: statusColors[status]?.label ?? status,
    value: count as number,
    color: statusColors[status]?.text ?? '#9A2D55',
  }));
  const maxStatus = Math.max(...statusDist.map(s => s.value), 1);

  const statusBadgeStyle = (status: string) => {
    const c = statusColors[status] || { bg: '#F6DCE4', text: '#9A2D55', label: status };
    return { background: c.bg, color: c.text, padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 600, whiteSpace: 'nowrap' as const };
  };

  const viewAll = (to: string, label = 'عرض الكل') => (
    <button onClick={() => navigate(to)} className="shrink-0 text-[11px] text-[#9A2D55] hover:underline">{label}</button>
  );

  const widgets: Record<WidgetId, React.ReactNode> = {
    revenue: <Stat title="إجمالي المبيعات" value={totalRevenue.toFixed(0)} unit="د.ب" tint="#F6DCE4" icon={<Wallet className="size-5 text-[#9A2D55]" />} />,
    orders: <Stat title="إجمالي الطلبات" value={orders.length} tint="#EBF5FF" icon={<ShoppingBag className="size-5 text-blue-500" />} />,
    customers: <Stat title="العملاء" value={uniqueCustomers} tint="#F0FDF4" icon={<Users className="size-5 text-green-500" />} />,
    avg: <Stat title="متوسط الطلب" value={avgOrder.toFixed(2)} unit="د.ب" tint="#FFF7ED" icon={<TrendingUp className="size-5 text-orange-500" />} />,

    products: (
      <Shell title="المنتجات" icon={<Package className="size-4" />} action={viewAll('/admin/products')}>
        <p className="text-[28px] leading-none font-bold text-foreground tabular-nums">{products.length}</p>
        <dl className="mt-auto space-y-1 text-[12px]">
          <div className="flex justify-between"><dt className="text-muted-foreground">مسودات</dt><dd className="font-semibold text-foreground">{drafts}</dd></div>
          <div className="flex justify-between"><dt className="text-muted-foreground">نفدت الكمية</dt><dd className="font-semibold text-foreground">{outOfStock}</dd></div>
        </dl>
      </Shell>
    ),

    stock: (
      <Shell title="تنبيهات المخزون" icon={<AlertTriangle className={`size-4 ${lowStock.length ? 'text-orange-500' : ''}`} />} action={viewAll('/admin/inventory')}>
        {lowStock.length > 0 ? (
          <ul className="space-y-1.5 overflow-hidden">
            {lowStock.slice(0, 3).map(p => (
              <li key={p.id} className="flex items-center justify-between gap-2 text-[11px]">
                <span className="truncate text-foreground">{p.name}</span>
                <span className="shrink-0 rounded-full bg-red-50 px-2 py-0.5 font-bold text-red-500">{p.stock}</span>
              </li>
            ))}
          </ul>
        ) : <p className="mt-auto text-[12px] text-muted-foreground">لا توجد منتجات على وشك النفاد</p>}
      </Shell>
    ),

    status: (
      <Shell title="توزيع حالات الطلبات">
        {statusDist.length > 0 ? (
          <div className="mt-auto space-y-2">
            {statusDist.slice(0, 5).map(s => (
              <div key={s.label} className="flex items-center gap-3 text-[12px]">
                <span className="w-24 shrink-0 truncate text-foreground">{s.label}</span>
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#F3EAE2]">
                  <span className="block h-full rounded-full" style={{ width: `${(s.value / maxStatus) * 100}%`, background: s.color }} />
                </span>
                <span className="w-6 shrink-0 text-left font-bold text-foreground tabular-nums">{s.value}</span>
              </div>
            ))}
          </div>
        ) : <p className="m-auto text-[13px] text-muted-foreground">لا توجد بيانات بعد</p>}
      </Shell>
    ),

    top: (
      <Shell title="أفضل المنتجات" action={viewAll('/admin/products')}>
        {topProducts.length > 0 ? (
          <ol className="space-y-3 overflow-hidden">
            {topProducts.map((p, i) => (
              <li key={p.id} className="flex items-center gap-2.5">
                <span className="w-5 shrink-0 text-center text-[11px] font-bold text-[#B08D57]">#{i + 1}</span>
                {p.image && <img src={p.image} alt="" referrerPolicy="no-referrer" className="size-9 shrink-0 rounded-lg object-cover ring-1 ring-border" />}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[11px] font-semibold text-foreground">{p.name}</p>
                  <p className="text-[10px] text-muted-foreground">{p.sold} مبيع · {p.price} د.ب</p>
                </div>
              </li>
            ))}
          </ol>
        ) : <p className="m-auto text-[12px] text-muted-foreground">أضيفي منتجات لتظهر هنا</p>}
      </Shell>
    ),

    recent: (
      <Shell title="آخر الطلبات" icon={<ShoppingBag className="size-4" />} action={viewAll('/admin/orders', 'عرض الكل ←')}>
        {recentOrders.length > 0 ? (
          <ul className="divide-y divide-[rgba(154,45,85,.07)] overflow-hidden">
            {recentOrders.map((o: any) => {
              const status = o.shippingStatus || o.status || 'new';
              return (
                <li key={o.id}>
                  <button onClick={() => navigate(`/admin/orders/${o.id}`)} className="flex w-full items-center gap-3 py-2.5 text-right hover:bg-[#FFF8F8]">
                    <span className="w-16 shrink-0 text-[12px] font-semibold text-[#9A2D55]">#{o.id?.slice(-6)}</span>
                    <span className="min-w-0 flex-1 truncate text-[12px] text-foreground">{o.customer?.name || o.customerName || '—'}</span>
                    <span style={statusBadgeStyle(status)}>{statusColors[status]?.label ?? status}</span>
                    <span className="w-20 shrink-0 text-left text-[12px] font-semibold text-foreground tabular-nums">{o.total?.toFixed(2)} د.ب</span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : <p className="m-auto text-[13px] text-muted-foreground">لا توجد طلبات بعد</p>}
      </Shell>
    ),

    reviews: (
      <Shell title="التقييمات الأخيرة" icon={<Star className="size-4" />} action={<span className="text-[11px] text-muted-foreground">{reviews.length} تقييم</span>}>
        {reviews.length > 0 ? (
          <ul className="space-y-3 overflow-hidden">
            {reviews.slice(0, 4).map((r: any) => (
              <li key={r.id} className="flex items-start gap-2">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#F6DCE4] text-[11px] font-bold text-[#9A2D55]">{r.customerName?.charAt(0)}</span>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1 text-[11px] font-bold text-foreground">
                    <span className="truncate">{r.customerName}</span>
                    <span className="shrink-0 text-[#F5A623]" aria-label={`${r.rating} من 5`}>{'★'.repeat(r.rating || 0)}</span>
                  </p>
                  <p className="line-clamp-2 text-[11px] text-muted-foreground">{r.comment}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : <p className="m-auto text-[12px] text-muted-foreground">لا توجد تقييمات بعد</p>}
      </Shell>
    ),
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

      <p className="text-xs text-muted-foreground">اسحبي البطاقات لترتيب لوحة التحكم كما تحبين. يُحفظ الترتيب على هذا الجهاز.</p>

      {/* Grid math assumes left-to-right columns; widget content stays RTL. */}
      <div dir="ltr">
        <DraggableWidgetGrid
          items={initialLayout()}
          onChange={saveLayout}
          radius={14}
          renderItem={(item) => <div dir="rtl" className="h-full">{widgets[item.id as WidgetId]}</div>}
        />
      </div>
    </div>
  );
}
