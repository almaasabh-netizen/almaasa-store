import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, Printer, Package, Truck, CheckCircle, XCircle, ChevronDown } from 'lucide-react';
import { getStoredData, saveStoredData } from '../../data';
import { statusColors } from '../theme';

const STEPS = [
  { key: 'new',        label: 'جديد',         icon: Package },
  { key: 'processing', label: 'قيد التجهيز',  icon: Package },
  { key: 'shipping',   label: 'تم الشحن',      icon: Truck },
  { key: 'delivered',  label: 'تم التسليم',    icon: CheckCircle },
];

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(() => getStoredData());
  const [statusOpen, setStatusOpen] = useState(false);
  const [refCode, setRefCode] = useState('');
  const [refSaved, setRefSaved] = useState(false);
  const statusRef = useRef<HTMLDivElement>(null);

  const order = data.orders?.find((o: any) => o.id === id);

  useEffect(() => {
    if (order?.paymentRef) setRefCode(order.paymentRef);
  }, [order?.paymentRef]);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (statusRef.current && !statusRef.current.contains(e.target as Node)) setStatusOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!order) return (
    <div className="text-center py-20" dir="rtl">
      <p className="text-4xl mb-3">🔍</p>
      <p className="font-bold" style={{ color: '#5A4047' }}>الطلب غير موجود</p>
      <button className="mt-4 text-sm font-bold" style={{ color: '#C77D8A' }} onClick={() => navigate('/admin/orders')}>← العودة للطلبات</button>
    </div>
  );

  // Support both flat fields (old orders) and nested customer object (new orders)
  const c = order.customer || {};
  const customerName    = c.name    || order.customerName    || '—';
  const customerPhone   = c.phone   || order.customerPhone   || '';
  const customerEmail   = c.email   || order.customerEmail   || '';
  const customerCity    = c.city    || order.customerCity    || '';
  const customerAddress = c.address || order.customerAddress || '';
  const customerNotes   = c.notes   || order.notes           || order.customerNotes || '';

  const saveRefCode = () => {
    const updated = { ...data, orders: data.orders.map((o: any) => o.id === id ? { ...o, paymentRef: refCode } : o) };
    saveStoredData(updated);
    setData(updated);
    setRefSaved(true);
    setTimeout(() => setRefSaved(false), 2000);
  };

  const printInvoice = () => {
    const items = order.items || [];
    const rows = items.map((item: any) => {
      const prod = item.product || {};
      const name = prod.name || item.name || '—';
      const price = prod.price ?? item.price ?? 0;
      const qty = item.quantity || 1;
      const size = item.selectedSize || item.size || '';
      const color = item.selectedColor || item.color || '';
      return `<tr>
        <td style="padding:8px 10px;border-bottom:1px solid #f0e0e4">${name}${size ? ' - ' + size : ''}${color ? ' / ' + color : ''}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #f0e0e4;text-align:center">${qty}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #f0e0e4;text-align:center">${price.toFixed(3)}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #f0e0e4;text-align:center;font-weight:900;color:#c4607a">${(price * qty).toFixed(3)}</td>
      </tr>`;
    }).join('');

    const html = `<!DOCTYPE html><html dir="rtl" lang="ar">
<head><meta charset="UTF-8">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: 'Tajawal', Arial, sans-serif; color:#3a2a2e; background:#fff; }
  @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;900&display=swap');
  .page { max-width:700px; margin:0 auto; padding:30px; }
  .header { display:flex; align-items:center; justify-content:space-between; border-bottom:2px solid #f0dde0; padding-bottom:20px; margin-bottom:24px; }
  .logo { display:flex; align-items:center; gap:12px; }
  .logo img { width:52px; height:52px; border-radius:12px; object-fit:cover; }
  .logo-text h1 { font-size:20px; font-weight:900; color:#5a4047; }
  .logo-text p { font-size:11px; color:#d79aa8; }
  .badge { background:#f3e6e8; color:#c4607a; font-weight:900; padding:6px 16px; border-radius:20px; font-size:13px; }
  .meta { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:22px; }
  .meta-item { background:#fff8f8; border:1px solid #f0dde0; border-radius:10px; padding:10px 14px; }
  .meta-item span { display:block; font-size:10px; color:#d79aa8; margin-bottom:2px; }
  .meta-item strong { font-size:13px; color:#5a4047; }
  table { width:100%; border-collapse:collapse; margin-bottom:18px; }
  thead tr { background:#f3e6e8; }
  thead th { padding:9px 10px; font-size:11px; color:#c4607a; text-align:right; }
  tbody tr:hover { background:#fff8f8; }
  .totals { border:1px solid #f0dde0; border-radius:10px; padding:14px 18px; }
  .totals .row { display:flex; justify-content:space-between; padding:4px 0; font-size:12px; color:#9a7a82; }
  .totals .total { font-size:16px; font-weight:900; color:#c4607a; border-top:1px solid #f0dde0; margin-top:8px; padding-top:8px; display:flex; justify-content:space-between; }
  .footer { text-align:center; margin-top:24px; font-size:11px; color:#d79aa8; border-top:1px dashed #f0dde0; padding-top:16px; }
</style></head>
<body><div class="page">
  <div class="header">
    <div class="logo">
      <img src="/logo.jpg" onerror="this.style.display='none'"/>
      <div class="logo-text"><h1>ألماسة</h1><p>للمخاوير والأزياء الخليجية</p></div>
    </div>
    <div style="text-align:left">
      <div class="badge">فاتورة ضريبية</div>
      <p style="font-size:11px;color:#d79aa8;margin-top:6px">التاريخ: ${order.date?.substring(0,10) || ''}</p>
    </div>
  </div>

  <div class="meta">
    <div class="meta-item"><span>رقم الطلب</span><strong>#${order.id?.slice(-6) || ''}</strong></div>
    <div class="meta-item"><span>حالة الطلب</span><strong>${{ new:'جديد', processing:'قيد التجهيز', shipping:'تم الشحن', delivered:'تم التسليم', cancelled:'ملغي', returned:'مُرتجع' }[order.status] || order.status || '—'}</strong></div>
    <div class="meta-item"><span>العميل</span><strong>${customerName}</strong></div>
    <div class="meta-item"><span>رقم الهاتف</span><strong>${customerPhone}</strong></div>
    <div class="meta-item"><span>المدينة</span><strong>${customerCity || '—'}</strong></div>
    <div class="meta-item"><span>العنوان</span><strong>${customerAddress || '—'}</strong></div>
    ${refCode ? `<div class="meta-item" style="grid-column:span 2"><span>مرجع الدفع</span><strong>${refCode}</strong></div>` : ''}
  </div>

  <table>
    <thead><tr>
      <th>المنتج</th><th style="text-align:center">الكمية</th><th style="text-align:center">السعر</th><th style="text-align:center">الإجمالي</th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>

  <div class="totals">
    <div class="row"><span>المجموع الفرعي</span><span>${((order.total || 0) - (order.shippingFee || 0) + (order.discount || 0)).toFixed(3)} د.ب</span></div>
    ${(order.shippingFee > 0) ? `<div class="row"><span>الشحن</span><span>${order.shippingFee?.toFixed(3)} د.ب</span></div>` : ''}
    ${(order.discount > 0) ? `<div class="row" style="color:#22c55e"><span>الخصم</span><span>-${order.discount?.toFixed(3)} د.ب</span></div>` : ''}
    <div class="total"><span>الإجمالي النهائي</span><span>${order.total?.toFixed(3)} د.ب</span></div>
  </div>

  <div class="footer">شكراً لتسوقكم من ألماسة 🌸 | almaasa-store.onrender.com</div>
</div>
<script>window.onload=()=>{window.print();window.close();}</script>
</body></html>`;

    const w = window.open('', '_blank', 'width=750,height=900');
    if (w) { w.document.write(html); w.document.close(); }
  };

  const sc = statusColors[order.status] ?? statusColors.new;
  const stepIdx = STEPS.findIndex(s => s.key === order.status);
  const products = data.products || [];

  const updateStatus = (status: string) => {
    const updated = { ...data, orders: data.orders.map((o: any) => o.id === id ? { ...o, status } : o) };
    saveStoredData(updated);
    setData(updated);
  };

  return (
    <div className="space-y-5 max-w-5xl" dir="rtl">
      {/* Back + title */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/admin/orders')} className="p-2 rounded-xl hover:bg-[#F3E6E8] transition-colors">
          <ArrowRight className="w-4 h-4" style={{ color: '#D79AA8' }} />
        </button>
        <div>
          <h2 className="font-black text-lg" style={{ color: '#5A4047' }}>تفاصيل الطلب #{order.id?.slice(-5)}</h2>
          <p className="text-xs" style={{ color: '#D79AA8' }}>{order.date?.substring(0,10)}</p>
        </div>
        <div className="mr-auto flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-full text-xs font-bold" style={{ background: sc.bg, color: sc.text }}>{sc.label}</span>
          <div className="relative" ref={statusRef}>
            <button onClick={() => setStatusOpen(o => !o)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold border hover:bg-[#F3E6E8] transition-colors"
              style={{ color: '#5A4047', borderColor: '#F0DDE0' }}>
              تغيير الحالة <ChevronDown className="w-3 h-3" />
            </button>
            {statusOpen && (
              <div className="absolute top-full left-0 mt-1 rounded-xl shadow-xl z-20"
                style={{ background: '#FFFFFF', border: '1px solid #F0DDE0', minWidth: 150 }}>
                {Object.entries(statusColors).map(([k, v]) => (
                  <button key={k} onClick={() => { updateStatus(k); setStatusOpen(false); }}
                    className="w-full text-right px-3 py-2 text-xs font-medium hover:bg-[#FFF8F8] transition-colors"
                    style={{ color: v.text }}>{v.label}</button>
                ))}
              </div>
            )}
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
            style={{ background: '#F3E6E8', color: '#C77D8A' }} onClick={printInvoice}>
            <Printer className="w-3.5 h-3.5" /> طباعة الفاتورة
          </button>
        </div>
      </div>

      {/* Progress bar */}
      {order.status !== 'cancelled' && order.status !== 'returned' && (
        <div className="rounded-2xl p-5" style={{ background: '#FFFFFF', border: '1px solid #F0DDE0' }}>
          <p className="text-xs font-bold mb-4" style={{ color: '#D79AA8' }}>اضغط على الخطوة لتغيير حالة الطلب</p>
          <div className="flex items-center justify-between" dir="ltr">
            {STEPS.map((step, i) => {
              const done = i <= stepIdx;
              const isCurrent = i === stepIdx;
              const Icon = step.icon;
              return (
                <React.Fragment key={step.key}>
                  <button onClick={() => updateStatus(step.key)}
                    className="flex flex-col items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                      style={{ background: done ? '#D79AA8' : '#F3E6E8', boxShadow: isCurrent ? '0 0 0 3px #F0DDE0' : 'none' }}>
                      <Icon style={{ width: 18, height: 18, color: done ? 'white' : '#D79AA8' }} />
                    </div>
                    <p className="text-[10px] font-bold" style={{ color: done ? '#C77D8A' : '#D79AA8' }}>{step.label}</p>
                  </button>
                  {i < STEPS.length - 1 && (
                    <div className="flex-1 h-0.5 mx-2" style={{ background: i < stepIdx ? '#D79AA8' : '#F0DDE0' }} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Order items */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl p-4" style={{ background: '#FFFFFF', border: '1px solid #F0DDE0' }}>
            <h3 className="font-black text-sm mb-4" style={{ color: '#5A4047' }}>المنتجات المطلوبة</h3>
            <div className="space-y-3">
              {order.items?.map((item: any, i: number) => {
                // Support both old flat format and new nested {product, quantity} format
                const prod = item.product || products.find((pr: any) => pr.id === item.productId) || {};
                const name  = prod.name  || item.name  || '—';
                const image = prod.image || item.image || '';
                const price = prod.price || item.price || 0;
                const size  = item.selectedSize  || item.size  || '';
                const color = item.selectedColor || item.color || '';
                return (
                  <div key={i} className="flex items-center gap-3 pb-3 border-b last:border-0 last:pb-0" style={{ borderColor: '#F0DDE0' }}>
                    {image
                      ? <img src={image} alt={name} className="w-14 h-14 rounded-xl object-cover object-top shrink-0" style={{ border: '1px solid #F0DDE0' }} />
                      : <div className="w-14 h-14 rounded-xl shrink-0 flex items-center justify-center" style={{ background: '#F3E6E8', border: '1px solid #F0DDE0' }}>
                          <Package className="w-5 h-5" style={{ color: '#D79AA8' }} />
                        </div>
                    }
                    <div className="flex-1">
                      <p className="text-sm font-bold" style={{ color: '#5A4047' }}>{name}</p>
                      <p className="text-xs" style={{ color: '#D79AA8' }}>
                        {size && `المقاس: ${size}`}{size && color && ' | '}{color && `اللون: ${color}`}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-black" style={{ color: '#C77D8A' }}>{(price * item.quantity).toFixed(3)} د.ب</p>
                      <p className="text-xs" style={{ color: '#D79AA8' }}>{price.toFixed(3)} × {item.quantity}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Totals */}
            <div className="mt-4 pt-4 border-t space-y-1.5" style={{ borderColor: '#F0DDE0' }}>
              <div className="flex justify-between text-xs" style={{ color: '#D79AA8' }}>
                <span>المجموع الفرعي</span>
                <span>{((order.total || 0) - (order.shippingCost || 0) + (order.discountAmount || 0)).toFixed(2)} د.ب</span>
              </div>
              {order.shippingCost > 0 && (
                <div className="flex justify-between text-xs" style={{ color: '#D79AA8' }}>
                  <span>الشحن</span><span>{order.shippingCost?.toFixed(2)} د.ب</span>
                </div>
              )}
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-xs" style={{ color: '#4CAF82' }}>
                  <span>الخصم</span><span>-{order.discountAmount?.toFixed(2)} د.ب</span>
                </div>
              )}
              <div className="flex justify-between font-black text-sm pt-1.5 border-t" style={{ borderColor: '#F0DDE0', color: '#5A4047' }}>
                <span>الإجمالي</span>
                <span style={{ color: '#C77D8A' }}>{order.total?.toFixed(2)} د.ب</span>
              </div>
              {order.paymentRef && (
                <div className="flex justify-between text-xs pt-1.5 border-t" style={{ borderColor: '#F0DDE0' }}>
                  <span style={{ color: '#D79AA8' }}>مرجع الدفع</span>
                  <span className="font-mono font-bold" style={{ color: '#5A4047' }}>{order.paymentRef}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Customer + shipping info */}
        <div className="space-y-4">
          <div className="rounded-2xl p-4" style={{ background: '#FFFFFF', border: '1px solid #F0DDE0' }}>
            <h3 className="font-black text-sm mb-3" style={{ color: '#5A4047' }}>معلومات العميل</h3>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black"
                style={{ background: 'linear-gradient(135deg,#D79AA8,#C77D8A)' }}>
                {customerName.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-sm" style={{ color: '#5A4047' }}>{customerName}</p>
                <p className="text-xs" style={{ color: '#D79AA8' }}>{customerPhone}</p>
              </div>
            </div>
            {[
              { label: 'الإيميل', value: customerEmail },
              { label: 'المدينة', value: customerCity },
              { label: 'العنوان', value: customerAddress },
              { label: 'طريقة الدفع', value: order.paymentMethod?.toUpperCase() },
            ].filter(x => x.value).map(({ label, value }) => (
              <div key={label} className="flex justify-between py-1.5 border-b text-xs last:border-0" style={{ borderColor: '#F0DDE0' }}>
                <span style={{ color: '#D79AA8' }}>{label}</span>
                <span className="font-medium text-right" style={{ color: '#5A4047' }}>{value}</span>
              </div>
            ))}
          </div>

          {customerNotes && (
            <div className="rounded-2xl p-4" style={{ background: '#FFF7ED', border: '1px solid #FED7AA' }}>
              <p className="text-xs font-bold mb-1.5" style={{ color: '#F59E0B' }}>ملاحظات العميل</p>
              <p className="text-xs" style={{ color: '#5A4047' }}>{customerNotes}</p>
            </div>
          )}

          {/* Payment reference - compact */}
          <div className="rounded-2xl p-4" style={{ background: '#FFFFFF', border: '1px solid #F0DDE0' }}>
            <p className="text-xs font-black mb-2" style={{ color: '#5A4047' }}>مرجع الدفع (للفاتورة)</p>
            <div className="flex gap-2">
              <input value={refCode} onChange={e => setRefCode(e.target.value)}
                placeholder="رقم التحويل أو المرجع..." dir="ltr"
                className="flex-1 rounded-xl px-3 py-2 text-sm outline-none"
                style={{ border: '1px solid #F0DDE0', background: '#FFF8F8', color: '#5A4047' }} />
              <button onClick={saveRefCode}
                className="px-3 py-2 rounded-xl text-xs font-bold"
                style={{ background: refSaved ? '#22C55E' : '#D79AA8', color: 'white' }}>
                {refSaved ? '✓' : 'حفظ'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
