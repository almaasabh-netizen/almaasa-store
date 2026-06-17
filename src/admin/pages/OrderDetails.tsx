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
        <td><div class="prod-name">${name}</div>${(size||color) ? `<div class="prod-meta">${size ? 'المقاس: '+size : ''}${size&&color?' | ':''}${color ? 'اللون: '+color : ''}</div>` : ''}</td>
        <td class="num">${qty}</td>
        <td class="price">${price.toFixed(3)} د.ب</td>
        <td class="total">${(price * qty).toFixed(3)} د.ب</td>
      </tr>`;
    }).join('');

    const statusLabel: Record<string,string> = { new:'جديد', processing:'قيد التجهيز', shipping:'تم الشحن', delivered:'تم التسليم', cancelled:'ملغي', returned:'مُرتجع' };
    const subtotal = ((order.total || 0) - (order.shippingFee || 0) + (order.discount || 0));

    const html = `<!DOCTYPE html><html dir="rtl" lang="ar">
<head><meta charset="UTF-8"><title>فاتورة #${order.id?.slice(-6)}</title>
<link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;700;900&display=swap" rel="stylesheet">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Tajawal',sans-serif;background:#f9f0ee;color:#3a2a2e;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  @page{margin:0;size:A4}
  .wrap{max-width:794px;margin:0 auto;background:#fff;min-height:100vh;position:relative;overflow:hidden}

  /* Decorative top band */
  .top-band{height:8px;background:linear-gradient(135deg,#c4607a,#d79aa8,#e8b8c4)}

  /* Header */
  .header{display:flex;align-items:center;justify-content:space-between;padding:28px 40px 22px;background:#fff;border-bottom:1px solid #f0dde0}
  .brand{display:flex;align-items:center;gap:14px}
  .brand img{width:58px;height:58px;border-radius:14px;object-fit:cover;border:2px solid #f0dde0}
  .brand-name{font-size:26px;font-weight:900;color:#5a4047;letter-spacing:-0.5px}
  .brand-sub{font-size:11px;color:#d79aa8;margin-top:2px}
  .invoice-tag{text-align:left}
  .invoice-tag h2{font-size:22px;font-weight:900;color:#c4607a}
  .invoice-tag .inv-num{font-size:13px;color:#9a7a82;margin-top:3px;direction:ltr}
  .invoice-tag .inv-date{font-size:11px;color:#d79aa8;margin-top:2px}

  /* Two-column info */
  .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:0;border-bottom:1px solid #f0dde0}
  .info-col{padding:20px 40px}
  .info-col:first-child{border-left:1px solid #f0dde0}
  .info-col h4{font-size:10px;font-weight:700;color:#d79aa8;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px}
  .info-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px}
  .info-row .lbl{font-size:11px;color:#9a7a82}
  .info-row .val{font-size:12px;font-weight:700;color:#5a4047;text-align:left;direction:ltr}

  /* Items table */
  .table-wrap{padding:24px 40px 0}
  .table-title{font-size:12px;font-weight:700;color:#d79aa8;letter-spacing:1px;margin-bottom:10px;text-transform:uppercase}
  table{width:100%;border-collapse:collapse}
  thead tr{background:linear-gradient(135deg,#c4607a,#d79aa8)}
  thead th{padding:11px 14px;font-size:11px;font-weight:700;color:#fff;text-align:right}
  thead th:last-child{text-align:left;direction:ltr}
  tbody tr{border-bottom:1px solid #f9f0ee}
  tbody tr:nth-child(even){background:#fdf8f8}
  tbody td{padding:12px 14px;font-size:12px;color:#5a4047;vertical-align:middle}
  tbody td.num{text-align:center;font-weight:700;color:#9a7a82}
  tbody td.price{text-align:left;direction:ltr;color:#9a7a82}
  tbody td.total{text-align:left;direction:ltr;font-weight:900;color:#c4607a}
  .prod-name{font-weight:700;color:#3a2a2e}
  .prod-meta{font-size:10px;color:#d79aa8;margin-top:2px}

  /* Totals */
  .totals-wrap{display:flex;justify-content:flex-start;padding:20px 40px 24px}
  .totals-box{background:#f9f0ee;border-radius:14px;padding:18px 24px;min-width:260px;border:1px solid #f0dde0}
  .tot-row{display:flex;justify-content:space-between;align-items:center;padding:5px 0;font-size:12px;color:#9a7a82}
  .tot-row .amt{direction:ltr;text-align:left}
  .tot-final{display:flex;justify-content:space-between;align-items:center;border-top:2px solid #d79aa8;margin-top:10px;padding-top:12px}
  .tot-final .lbl{font-size:14px;font-weight:900;color:#5a4047}
  .tot-final .amt{font-size:18px;font-weight:900;color:#c4607a;direction:ltr}
  ${refCode ? `.ref-box{margin:0 40px;background:#fff8f8;border:1.5px dashed #d79aa8;border-radius:10px;padding:10px 18px;display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}
  .ref-box .lbl{font-size:11px;color:#d79aa8;font-weight:700}.ref-box .val{font-size:13px;font-weight:900;color:#c4607a;direction:ltr;letter-spacing:1px}` : ''}

  /* Footer */
  .footer{margin-top:auto;padding:18px 40px;border-top:1px solid #f0dde0;display:flex;justify-content:space-between;align-items:center}
  .footer-brand{font-size:13px;font-weight:900;color:#c4607a}
  .footer-note{font-size:10px;color:#d79aa8;text-align:center}
  .footer-site{font-size:10px;color:#d79aa8;direction:ltr}
  .bottom-band{height:6px;background:linear-gradient(135deg,#e8b8c4,#d79aa8,#c4607a)}

  @media print{body{background:#fff}.wrap{box-shadow:none}}
</style></head>
<body><div class="wrap">
  <div class="top-band"></div>

  <div class="header">
    <div class="brand">
      <img src="/logo.jpg" onerror="this.style.display='none'"/>
      <div><div class="brand-name">ألماسة</div><div class="brand-sub">للمخاوير والأزياء الخليجية الفاخرة</div></div>
    </div>
    <div class="invoice-tag">
      <h2>فاتـورة</h2>
      <div class="inv-num">#${order.id?.slice(-6) || ''}</div>
      <div class="inv-date">${order.date?.substring(0,10) || ''}</div>
    </div>
  </div>

  <div class="info-grid">
    <div class="info-col">
      <h4>بيانات العميل</h4>
      <div class="info-row"><span class="lbl">الاسم</span><span class="val" style="direction:rtl">${customerName}</span></div>
      <div class="info-row"><span class="lbl">الهاتف</span><span class="val">${customerPhone}</span></div>
      ${customerEmail && customerEmail !== 'guest@almaasa.bh' ? `<div class="info-row"><span class="lbl">الإيميل</span><span class="val">${customerEmail}</span></div>` : ''}
      ${customerCity ? `<div class="info-row"><span class="lbl">المدينة</span><span class="val" style="direction:rtl">${customerCity}</span></div>` : ''}
      ${customerAddress ? `<div class="info-row"><span class="lbl">العنوان</span><span class="val" style="direction:rtl;max-width:160px;text-align:right">${customerAddress}</span></div>` : ''}
    </div>
    <div class="info-col">
      <h4>تفاصيل الطلب</h4>
      <div class="info-row"><span class="lbl">رقم الطلب</span><span class="val">#${order.id?.slice(-6) || ''}</span></div>
      <div class="info-row"><span class="lbl">الحالة</span><span class="val" style="direction:rtl;color:#c4607a">${statusLabel[order.status] || '—'}</span></div>
      <div class="info-row"><span class="lbl">طريقة الدفع</span><span class="val">${order.paymentMethod?.toUpperCase() || '—'}</span></div>
      <div class="info-row"><span class="lbl">تاريخ الطلب</span><span class="val">${order.date?.substring(0,10) || ''}</span></div>
    </div>
  </div>

  <div class="table-wrap">
    <div class="table-title">المنتجات المطلوبة</div>
    <table>
      <thead><tr>
        <th style="width:50%">المنتج</th>
        <th style="text-align:center;width:12%">الكمية</th>
        <th style="text-align:left;direction:ltr;width:18%">سعر الوحدة</th>
        <th style="text-align:left;direction:ltr;width:20%">الإجمالي</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </div>

  <div class="totals-wrap">
    <div class="totals-box">
      <div class="tot-row"><span>المجموع الفرعي</span><span class="amt">${subtotal.toFixed(3)} د.ب</span></div>
      ${(order.shippingFee > 0) ? `<div class="tot-row"><span>رسوم الشحن</span><span class="amt">${order.shippingFee?.toFixed(3)} د.ب</span></div>` : ''}
      ${(order.discount > 0) ? `<div class="tot-row" style="color:#16a34a"><span>الخصم</span><span class="amt">- ${order.discount?.toFixed(3)} د.ب</span></div>` : ''}
      <div class="tot-final"><span class="lbl">الإجمالي النهائي</span><span class="amt">${order.total?.toFixed(3)} د.ب</span></div>
    </div>
  </div>

  ${refCode ? `<div class="ref-box"><span class="lbl">🔖 مرجع الدفع</span><span class="val">${refCode}</span></div>` : ''}

  <div class="footer">
    <div class="footer-brand">ألماسة 🌸</div>
    <div class="footer-note">شكراً لثقتكم — نسعد بخدمتكم دائماً</div>
    <div class="footer-site">almaasa.bh</div>
  </div>
  <div class="bottom-band"></div>
</div>
<script>window.onload=()=>{window.print();}</script>
</body></html>`;

    const w = window.open('', '_blank', 'width=750,height=900');
    if (w) { w.document.write(html); w.document.close(); }
  };

  const orderStatus = order.shippingStatus || order.status;
  const sc = statusColors[orderStatus] ?? statusColors.new;
  const stepIdx = STEPS.findIndex(s => s.key === orderStatus);
  const products = data.products || [];

  const updateStatus = (status: string) => {
    const updated = { ...data, orders: data.orders.map((o: any) => o.id === id ? { ...o, status, shippingStatus: status } : o) };
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
                <span>{((order.total || 0) - (order.shippingFee || order.shippingCost || 0) + (order.discount || order.discountAmount || 0)).toFixed(2)} د.ب</span>
              </div>
              {(order.shippingFee || order.shippingCost) > 0 && (
                <div className="flex justify-between text-xs" style={{ color: '#D79AA8' }}>
                  <span>الشحن</span><span>{(order.shippingFee || order.shippingCost)?.toFixed(2)} د.ب</span>
                </div>
              )}
              {(order.discount || order.discountAmount) > 0 && (
                <div className="flex justify-between text-xs" style={{ color: '#4CAF82' }}>
                  <span>الخصم</span><span>-{(order.discount || order.discountAmount)?.toFixed(2)} د.ب</span>
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
