import React, { useState, useEffect, useRef } from 'react';
import {
  ShoppingBag, Search, Truck, Heart, ArrowRight, CheckCircle,
  Clock, Check, X, Phone, MapPin, Tag, Plus, Minus,
  Star, ShieldCheck, CreditCard, ChevronRight,
  Home, Menu, Instagram, Package, Zap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, Order, Coupon, SizeGuide, Review, StoreSettings, OrderItem, Category } from '../types';
import { getStoredData, saveStoredData, addOperationLog } from '../data';

type Page = 'home' | 'shop' | 'cart' | 'about' | 'contact' | 'tracking';

interface StorefrontProps {
  onNavigateToAdmin: () => void;
  activeTab: Page | 'shop' | 'tracking';
  setActiveTab: (tab: Page) => void;
}

interface Toast { id: number; msg: string; type: 'success' | 'info' | 'error'; }

// Placeholder image pattern
const PH = 'repeating-linear-gradient(45deg,#ECD9DD,#ECD9DD 12px,#F6EAEC 12px,#F6EAEC 24px)';

export default function Storefront({ onNavigateToAdmin, activeTab, setActiveTab }: StorefrontProps) {
  /* ── DATA STATE ─────────────────────────────────────────────── */
  const [products, setProducts] = useState<Product[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [sizeGuides, setSizeGuides] = useState<SizeGuide[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  /* ── UI STATE ───────────────────────────────────────────────── */
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showSizeGuide, setShowSizeGuide] = useState<string | null>(null);
  const [showReviewsPopup, setShowReviewsPopup] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);

  /* ── PRODUCT OPTIONS ───────────────────────────────────────── */
  const [chosenSize, setChosenSize] = useState('');
  const [chosenColor, setChosenColor] = useState('');
  const [quantity, setQuantity] = useState(1);

  /* ── CART STATE ─────────────────────────────────────────────── */
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [couponCode, setCouponCode] = useState('');
  const [activeCoupon, setActiveCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState('');

  /* ── CHECKOUT ───────────────────────────────────────────────── */
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'details' | 'payment' | 'success'>('cart');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerCity, setCustomerCity] = useState('المنامة');
  const [customerCountry, setCustomerCountry] = useState('البحرين');
  const [customerNotes, setCustomerNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'benefit' | 'knet' | 'card' | 'applepay'>('benefit');
  const [shippingZones, setShippingZones] = useState<any[]>([]);
  const [selectedShippingMethod, setSelectedShippingMethod] = useState<any>(null);
  const [benefitPhone, setBenefitPhone] = useState('');
  const [knetCardNum, setKnetCardNum] = useState('');
  const [knetPin, setKnetPin] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [isPaying, setIsPaying] = useState(false);
  const [newOrder, setNewOrder] = useState<Order | null>(null);

  /* ── TRACKING ───────────────────────────────────────────────── */
  const [trackSearchQuery, setTrackSearchQuery] = useState('');
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);
  const [trackError, setTrackError] = useState('');

  /* ── CONTACT FORM ───────────────────────────────────────────── */
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMsg, setContactMsg] = useState('');
  const [contactSent, setContactSent] = useState(false);

  /* ── EFFECTS ────────────────────────────────────────────────── */
  useEffect(() => {
    const data = getStoredData();
    setProducts(data.products);
    setCoupons(data.coupons);
    setSizeGuides(data.sizeGuides);
    setReviews(data.reviews.filter((r: Review) => r.approved));
    setSettings(data.settings);
    setCategories(data.categories);

    const params = new URLSearchParams(window.location.search);
    const trackingCode = params.get('track');
    if (trackingCode) {
      setActiveTab('tracking');
      setTrackSearchQuery(trackingCode);
      const matched = data.orders.find((o: Order) => o.trackingCode.toLowerCase() === trackingCode.toLowerCase());
      if (matched) setTrackedOrder(matched);
    }

    const savedZones = localStorage.getItem('ama_shipping_zones');
    if (savedZones) {
      try { setShippingZones(JSON.parse(savedZones)); }
      catch { /* invalid JSON in localStorage */ }
    } else {
      const defaultZones = [
        {
          id: 'zone-1', name: 'محلي - BH',
          countries: ['البحرين'],
          cities: ['المنامة', 'الرفاع', 'المحرق', 'مدينة عيسى'],
          methods: [
            { id: 'm-1-1', name: 'استلام', provider: 'LOCAL', priceType: 'free', price: 0, description: 'استلام من الفرع مجاناً' },
            { id: 'm-1-2', name: 'توصيل محلي', provider: 'LOCAL', priceType: 'fixed', price: 2.0, description: 'سعر ثابت' },
            { id: 'm-1-3', name: 'شحن', provider: 'SMSA', priceType: 'calculated', price: 3.5, description: 'محسوب (SMSA)' },
          ],
        },
        {
          id: 'zone-2', name: 'GCC',
          countries: ['السعودية', 'الكويت', 'الإمارات', 'قطر', 'عمان'],
          cities: [],
          methods: [],
        },
      ];
      setShippingZones(defaultZones);
      localStorage.setItem('ama_shipping_zones', JSON.stringify(defaultZones));
    }

    const saved = localStorage.getItem('ama_wishlist');
    if (saved) { try { setWishlist(JSON.parse(saved)); } catch (e) {} }
  }, []);

  useEffect(() => {
    const fn = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const matchingZone = shippingZones.find(z =>
    z.countries.some((c: string) => c.includes(customerCountry) || customerCountry.includes(c))
  ) || shippingZones[0];
  const availableShippingMethods = matchingZone ? matchingZone.methods : [];

  useEffect(() => {
    if (availableShippingMethods?.length > 0) setSelectedShippingMethod(availableShippingMethods[0]);
    else setSelectedShippingMethod(null);
  }, [customerCountry, shippingZones]);

  /* ── TOAST ──────────────────────────────────────────────────── */
  const addToast = (msg: string, type: Toast['type'] = 'success') => {
    const id = ++toastId.current;
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3200);
  };

  /* ── WISHLIST ───────────────────────────────────────────────── */
  const toggleWishlist = (productId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setWishlist(prev => {
      const next = prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId];
      localStorage.setItem('ama_wishlist', JSON.stringify(next));
      addToast(prev.includes(productId) ? 'تمت الإزالة من المفضلة' : 'أُضيف إلى المفضلة', 'info');
      return next;
    });
  };

  /* ── PRODUCT HANDLERS ──────────────────────────────────────── */
  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setChosenSize(product.sizes[0] || 'M');
    setChosenColor(product.colors[0] || 'وردي');
    setQuantity(1);
  };

  const handleAddToCart = () => {
    if (!selectedProduct) return;
    const newItem: OrderItem = { product: selectedProduct, quantity, selectedSize: chosenSize, selectedColor: chosenColor };
    const existingIndex = cart.findIndex(
      item => item.product.id === selectedProduct.id && item.selectedColor === chosenColor && item.selectedSize === chosenSize
    );
    if (existingIndex > -1) {
      const updated = [...cart];
      updated[existingIndex].quantity += quantity;
      setCart(updated);
    } else {
      setCart([...cart, newItem]);
    }
    setSelectedProduct(null);
    addToast(`تمت إضافة "${selectedProduct.name}" للسلة`);
  };

  const updateCartQty = (index: number, newQty: number) => {
    if (newQty < 1) return;
    const updated = [...cart];
    updated[index].quantity = newQty;
    setCart(updated);
  };

  const removeFromCart = (index: number) => setCart(cart.filter((_, i) => i !== index));

  const applyCoupon = () => {
    setCouponError('');
    if (!couponCode.trim()) return;
    const found = coupons.find(c => c.code.toUpperCase() === couponCode.trim().toUpperCase() && c.isActive);
    if (found) { setActiveCoupon(found); addToast(`كوبون ${found.code} مفعّل`); }
    else { setCouponError('الكوبون غير فعال أو غير صحيح.'); setActiveCoupon(null); }
  };

  /* ── CALCULATIONS ───────────────────────────────────────────── */
  const calculatedSubtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const calculatedDiscount = activeCoupon
    ? activeCoupon.type === 'percentage' ? calculatedSubtotal * activeCoupon.discount / 100 : activeCoupon.discount
    : 0;
  const shippingCharge = selectedShippingMethod
    ? selectedShippingMethod.priceType === 'free' ? 0 : parseFloat(selectedShippingMethod.price)
    : settings ? (calculatedSubtotal >= settings.freeShippingThreshold ? 0 : settings.shippingCost) : 2.5;
  const totalCost = Math.max(0, calculatedSubtotal - calculatedDiscount + shippingCharge);

  /* ── PAYMENT ────────────────────────────────────────────────── */
  const triggerPayment = () => {
    setIsPaying(true);
    setTimeout(() => {
      setIsPaying(false);
      const trackingNum = `AL-${Math.floor(10000 + Math.random() * 90000)}-${customerCountry === 'البحرين' ? 'BH' : 'GCC'}`;
      const orderId = `ord-${Date.now().toString().substring(9)}`;
      const brandNewOrder: Order = {
        id: orderId, trackingCode: trackingNum,
        customer: { name: customerName, email: customerEmail || 'guest@almaasa.bh', phone: customerPhone, address: customerAddress, city: customerCity, country: customerCountry },
        items: cart, subtotal: calculatedSubtotal, discount: calculatedDiscount,
        shippingFee: shippingCharge, total: totalCost, paymentMethod,
        paymentStatus: 'paid', shippingStatus: 'pending',
        date: new Date().toISOString(), notes: customerNotes,
        timeline: [
          { title: 'تم استلام الطلب', description: 'تم تسجيل الطلبية في نظام ألماسة بنجاح.', date: new Date().toISOString().replace('T', ' ').substring(0, 16), status: 'pending' },
          { title: 'تأكيد السداد', description: `تم ترخيص الدفع بـ ${paymentMethod.toUpperCase()} بقيمة ${totalCost.toFixed(2)} د.ب.`, date: new Date().toISOString().replace('T', ' ').substring(0, 16), status: 'pending' },
        ],
      };
      const { orders } = getStoredData();
      saveStoredData({ orders: [brandNewOrder, ...orders] });
      addOperationLog(`طلب جديد #${orderId}`, `${customerName} - ${totalCost.toFixed(2)} د.ب`, 'بوابة الدفع', 'order', 'success');
      if (activeCoupon) {
        const uc = coupons.map(c => c.code === activeCoupon.code ? { ...c, usageCount: c.usageCount + 1 } : c);
        setCoupons(uc); saveStoredData({ coupons: uc });
      }
      const { products: dbP } = getStoredData();
      const mp = dbP.map((p: Product) => {
        const ci = cart.find(i => i.product.id === p.id);
        return ci ? { ...p, stock: Math.max(0, p.stock - ci.quantity) } : p;
      });
      setProducts(mp); saveStoredData({ products: mp });
      setNewOrder(brandNewOrder); setCart([]); setCheckoutStep('success'); setActiveCoupon(null); setCouponCode('');
    }, 2000);
  };

  /* ── TRACKING ───────────────────────────────────────────────── */
  const handleTrackSearch = () => {
    setTrackError(''); setTrackedOrder(null);
    if (!trackSearchQuery.trim()) return;
    const { orders } = getStoredData();
    const q = trackSearchQuery.trim().toLowerCase();
    const matched = orders.find((o: Order) =>
      o.trackingCode.toLowerCase() === q || o.customer.phone.replace(/[\s+]/g, '').includes(q.replace(/[\s+]/g, ''))
    );
    matched ? setTrackedOrder(matched) : setTrackError('لم نجد طلبًا بهذا الرقم أو الهاتف.');
  };

  /* ── FILTER ─────────────────────────────────────────────────── */
  const filteredProducts = products.filter(p => {
    const cat = selectedCategory === 'all' || p.category === selectedCategory;
    const q = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return cat && q;
  });

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const wa = `https://wa.me/${(settings?.whatsappNumber || '97337037697').replace(/\D/g, '')}`;
  const ig = `https://instagram.com/${settings?.instagramUsername || 'almaasa.bh'}`;

  /* ═══════════════════════════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════════════════════════ */
  return (
    <div style={{ background: '#FBF7F2', fontFamily: "'Cairo', sans-serif", color: '#241419', minHeight: '100vh' }} dir="rtl">

      {/* ── TOASTS ────────────────────────────────────────────── */}
      <div className="fixed top-5 left-5 z-[100] space-y-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div key={t.id}
              initial={{ x: -60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -60, opacity: 0 }}
              className="pointer-events-auto px-4 py-3 rounded text-white text-xs font-semibold shadow-xl"
              style={{
                background: t.type === 'success' ? '#9A2D55' : t.type === 'error' ? '#c0392b' : '#B08D57',
                borderRadius: 2,
              }}
            >{t.msg}</motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ══════════════════════════════════════════════════════════
          HEADER
      ══════════════════════════════════════════════════════════ */}
      <header style={{
        background: '#FBF7F2',
        position: 'sticky', top: 0, zIndex: 40,
        boxShadow: isScrolled ? '0 2px 12px rgba(36,20,25,0.08)' : 'none',
        transition: 'box-shadow 0.3s',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Desktop nav row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: 1240, padding: '20px 40px', boxSizing: 'border-box' }}>
            {/* Logo */}
            <button onClick={() => setActiveTab('home')} style={{ fontFamily: "'Amiri', serif", fontSize: 32, fontWeight: 700, color: '#9A2D55', textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer' }}>
              ألماسة
            </button>

            {/* Desktop nav links - hidden on mobile */}
            <nav className="hidden md:flex" style={{ gap: 34, fontSize: 15, fontWeight: 500 }}>
              {[
                { label: 'الرئيسية', page: 'home' as Page },
                { label: 'المخاوير', page: 'shop' as Page },
                { label: 'من نحن', page: 'about' as Page },
                { label: 'تواصلي معنا', page: 'contact' as Page },
              ].map(({ label, page }) => (
                <button key={page} onClick={() => setActiveTab(page)} style={{
                  color: activeTab === page ? '#9A2D55' : '#241419',
                  textDecoration: 'none',
                  borderBottom: activeTab === page ? '2px solid #B08D57' : '2px solid transparent',
                  background: 'none', border: 'none', borderBottomWidth: 2,
                  borderBottomStyle: 'solid',
                  borderBottomColor: activeTab === page ? '#B08D57' : 'transparent',
                  cursor: 'pointer', padding: '2px 0', fontSize: 15, fontWeight: 500,
                  fontFamily: "'Cairo', sans-serif",
                }}>
                  {label}
                </button>
              ))}
            </nav>

            {/* Cart + mobile menu */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {/* Cart */}
              <button onClick={() => setActiveTab('cart')} style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#241419', textDecoration: 'none', fontSize: 15, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
                <span>السلة</span>
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22, borderRadius: '50%', background: '#9A2D55', color: '#fff', fontSize: 11, fontWeight: 700 }}>
                  {cartCount}
                </span>
              </button>

              {/* Mobile menu button */}
              <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#241419', padding: 4 }}>
                <Menu style={{ width: 22, height: 22 }} />
              </button>
            </div>
          </div>

          {/* Divider */}
          <div style={{ width: '100%', borderBottom: '1px solid rgba(154,45,85,.18)' }} />

          {/* Mobile nav dropdown */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                style={{ width: '100%', background: '#FBF7F2', overflow: 'hidden' }}>
                <div style={{ padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {[
                    { label: 'الرئيسية', page: 'home' as Page },
                    { label: 'المخاوير', page: 'shop' as Page },
                    { label: 'من نحن', page: 'about' as Page },
                    { label: 'تواصلي معنا', page: 'contact' as Page },
                    { label: 'تتبع طلبي', page: 'tracking' as Page },
                  ].map(({ label, page }) => (
                    <button key={page} onClick={() => { setActiveTab(page); setMobileMenuOpen(false); }}
                      style={{ textAlign: 'right', padding: '10px 12px', fontSize: 15, fontWeight: activeTab === page ? 600 : 400, color: activeTab === page ? '#9A2D55' : '#241419', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Cairo', sans-serif", borderRadius: 2 }}>
                      {label}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════
          MAIN CONTENT
      ══════════════════════════════════════════════════════════ */}

      {/* ── HOME PAGE ──────────────────────────────────────────── */}
      {activeTab === 'home' && (
        <main style={{ background: '#FAF7F3', overflowX: 'hidden' }}>

          {/* ── CSS KEYFRAMES (injected once) ── */}
          <style>{`
            @keyframes _ticker { from{transform:translateX(0)} to{transform:translateX(-50%)} }
            @keyframes _fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
            @keyframes _scrollPulse { 0%,100%{height:48px;opacity:1} 50%{height:28px;opacity:.5} }
            ._anim1{animation:_fadeUp .7s cubic-bezier(.22,.68,0,1.2) .1s both}
            ._anim2{animation:_fadeUp .7s cubic-bezier(.22,.68,0,1.2) .24s both}
            ._anim3{animation:_fadeUp .7s cubic-bezier(.22,.68,0,1.2) .38s both}
            ._anim4{animation:_fadeUp .7s cubic-bezier(.22,.68,0,1.2) .52s both}
            ._hpcard:hover{transform:translateY(-6px)!important}
            ._hpcard:hover ._pimg-inner{transform:scale(1.06)!important}
            ._pimg-inner{transition:transform .6s cubic-bezier(.22,.68,0,1.2)}
            ._catbtn:hover ._cbg{transform:scale(1.06)!important}
            ._cbg{transition:transform .6s cubic-bezier(.22,.68,0,1.2)}
            ._catbtn:hover ._carrow{opacity:1!important;transform:translateY(0)!important}
            ._carrow{transition:opacity .2s,transform .2s}
            ._rcard:hover{box-shadow:0 12px 40px rgba(22,11,16,.07)!important;transform:translateY(-3px)!important}
          `}</style>

          {/* ── HERO ── */}
          <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 'calc(100vh - 58px)' }}>
            {/* Text side */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 'clamp(40px,6vw,88px) clamp(24px,5vw,72px)', background: '#FAF7F3', position: 'relative' }}>
              <div className="_anim1" style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 32, fontSize: 10, letterSpacing: '0.28em', fontWeight: 700, color: '#C4A882', textTransform: 'uppercase' }}>
                <span style={{ width: 28, height: 1, background: '#C4A882', display: 'inline-block', flexShrink: 0 }}></span>
                AUTUMN / WINTER 2026
              </div>
              <h1 className="_anim2" style={{ fontFamily: "'Amiri', serif", fontSize: 'clamp(2.6rem,5.2vw,68px)', lineHeight: 1.12, color: '#160B10', margin: '0 0 26px', fontWeight: 400 }}>
                أزياء تُولد<br />
                <em style={{ fontStyle: 'italic', color: '#9A2D55', display: 'block', fontSize: '1.1em' }}>من فخامة</em>
              </h1>
              <p className="_anim3" style={{ fontSize: 14.5, color: '#6A4850', lineHeight: 2.0, margin: '0 0 48px', maxWidth: 380 }}>
                مخاوير وأزياء نسائية مصممة بعناية استثنائية، تجمع بين الهوية الخليجية الراقية والتفاصيل العصرية الدقيقة.
              </p>
              <div className="_anim4" style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                <button onClick={() => setActiveTab('shop')} style={{ padding: '14px 40px', background: '#160B10', color: '#FFF', border: 'none', fontSize: 12.5, fontWeight: 700, letterSpacing: '0.07em', cursor: 'pointer', fontFamily: "'Cairo', sans-serif", transition: 'background .18s,transform .18s', position: 'relative', overflow: 'hidden' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#9A2D55'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#160B10'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}>
                  تسوّقي المجموعة
                </button>
                <button onClick={() => setActiveTab('about')} style={{ padding: '14px 30px', background: 'transparent', color: '#160B10', border: '1px solid rgba(22,11,16,.14)', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: "'Cairo', sans-serif", transition: 'border-color .18s,color .18s,transform .18s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#9A2D55'; (e.currentTarget as HTMLElement).style.color = '#9A2D55'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(22,11,16,.14)'; (e.currentTarget as HTMLElement).style.color = '#160B10'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}>
                  اكتشفي أكثر
                </button>
              </div>
              {/* Scroll indicator */}
              <div style={{ position: 'absolute', bottom: 32, right: 'clamp(24px,5vw,56px)', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
                <span style={{ fontSize: 9, letterSpacing: '0.24em', color: '#B8989E', fontWeight: 700 }}>SCROLL</span>
                <span style={{ width: 1, background: 'linear-gradient(to bottom,#C4A882,transparent)', animationName: '_scrollPulse', animationDuration: '2s', animationTimingFunction: 'ease-in-out', animationIterationCount: 'infinite', height: 48, display: 'block' }}></span>
              </div>
            </div>
            {/* Image side */}
            <div style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(145deg,#EDE0D4,#E0CCBC)' }}>
              <div style={{ position: 'absolute', inset: 0, transition: 'transform .8s cubic-bezier(.22,.68,0,1.2)', backgroundImage: products[0]?.image ? `url(${products[0].image})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.03)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}>
                {!products[0]?.image && <span style={{ fontFamily: "'Amiri', serif", fontSize: 'clamp(80px,12vw,160px)', color: 'rgba(154,45,85,.08)', fontStyle: 'italic', lineHeight: 1, userSelect: 'none' }}>◆</span>}
              </div>
              <div style={{ position: 'absolute', top: 28, left: 28, background: '#FFF', padding: '9px 16px', fontSize: 9.5, letterSpacing: '0.18em', fontWeight: 700, color: '#9A2D55', border: '1px solid rgba(154,45,85,.15)', zIndex: 2 }}>
                NEW SEASON
              </div>
              <div style={{ position: 'absolute', bottom: 28, left: 28, fontFamily: "'Cormorant Garamond', serif", fontSize: 64, fontStyle: 'italic', fontWeight: 300, color: 'rgba(255,255,255,.18)', lineHeight: 1, zIndex: 2, pointerEvents: 'none' }}>01</div>
            </div>
          </section>

          {/* ── TICKER ── */}
          <div style={{ overflow: 'hidden', borderTop: '1px solid rgba(22,11,16,.07)', borderBottom: '1px solid rgba(22,11,16,.07)', background: '#FFF', padding: '11px 0' }}>
            <div style={{ display: 'flex', width: 'max-content', whiteSpace: 'nowrap', animationName: '_ticker', animationDuration: '32s', animationTimingFunction: 'linear', animationIterationCount: 'infinite' }}>
              {['مجموعة الخريف ٢٠٢٦', 'AUTUMN COLLECTION', 'تصاميم حصرية', 'شحن مجاني فوق ٣٠ د.ب', 'EXCLUSIVE DESIGNS', 'مخاوير فاخرة', 'FREE SHIPPING +30 BD',
                'مجموعة الخريف ٢٠٢٦', 'AUTUMN COLLECTION', 'تصاميم حصرية', 'شحن مجاني فوق ٣٠ د.ب', 'EXCLUSIVE DESIGNS', 'مخاوير فاخرة', 'FREE SHIPPING +30 BD'].map((t, i) => (
                <React.Fragment key={i}>
                  <span style={{ fontSize: 11, letterSpacing: '0.16em', fontWeight: 600, color: '#B8989E', padding: '0 24px', textTransform: 'uppercase' }}>{t}</span>
                  <span style={{ color: '#9A2D55', letterSpacing: 0, padding: '0 8px', fontSize: 11 }}>◆</span>
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* ── PRODUCTS ── */}
          <section style={{ padding: '88px 44px', background: '#FAF7F3' }}>
            <div style={{ maxWidth: 1360, margin: '0 auto' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 44 }}>
                <h2 style={{ fontFamily: "'Amiri', serif", fontSize: 30, color: '#160B10', margin: 0, fontWeight: 400 }}>وصل حديثاً</h2>
                <button onClick={() => setActiveTab('shop')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11.5, fontWeight: 700, color: '#B8989E', fontFamily: "'Cairo', sans-serif", letterSpacing: '0.07em', textDecoration: 'underline', textUnderlineOffset: 4, transition: 'color .15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#9A2D55'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#B8989E'; }}>
                  عرض المجموعة كاملة ←
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 4 }}>
                {(products.length > 0 ? products.slice(0, 4) : [
                  { id: 'p1', name: 'مخوار كلاسيك فاخر', price: 35, originalPrice: null, image: '', colors: ['#1A1218','#8B3A5A','#D4C0B0'] },
                  { id: 'p2', name: 'عباءة ساتان أنيقة', price: 48, originalPrice: 60, image: '', colors: [] },
                  { id: 'p3', name: 'مخوار مطرز خاص', price: 65, originalPrice: null, image: '', colors: ['#2D1820','#7A4060'] },
                  { id: 'p4', name: 'فستان سهرة راقٍ', price: 89, originalPrice: null, image: '', colors: [] },
                ] as any[]).map((p: any, i) => (
                  <button key={p.id} onClick={() => p.price && handleProductClick(p)} className="_hpcard"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'right', display: 'flex', flexDirection: 'column', position: 'relative', transition: 'transform .3s cubic-bezier(.22,.68,0,1.2)', marginTop: i === 1 ? 48 : i === 3 ? 72 : 0 }}>
                    <div style={{ overflow: 'hidden', background: ['#EDE0D4','#E8DCCC','#E4D4C8','#EAE0D4'][i], position: 'relative', aspectRatio: '3/4' }}>
                      <div className="_pimg-inner" style={{ width: '100%', height: '100%', backgroundImage: p.image ? `url(${p.image})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {!p.image && <span style={{ fontFamily: "'Amiri', serif", fontSize: 36, color: 'rgba(154,45,85,.13)', fontStyle: 'italic' }}>◆</span>}
                      </div>
                      {p.originalPrice && <div style={{ position: 'absolute', top: 12, right: 12, background: '#9A2D55', color: '#FFF', fontSize: 8.5, fontWeight: 800, letterSpacing: '0.1em', padding: '4px 10px' }}>SALE</div>}
                    </div>
                    <div style={{ padding: '14px 2px 10px' }}>
                      <div style={{ fontSize: 13.5, color: '#160B10', fontWeight: 500, marginBottom: 5, lineHeight: 1.4 }}>{p.name}</div>
                      <div>
                        {p.originalPrice && <span style={{ fontSize: 11.5, color: '#B8989E', textDecoration: 'line-through', marginLeft: 6 }}>{typeof p.originalPrice === 'number' ? p.originalPrice.toFixed(2) : p.originalPrice}</span>}
                        <span style={{ fontSize: 13, color: '#9A2D55', fontWeight: 700 }}>{p.price?.toFixed ? p.price.toFixed(2) : p.price} <small style={{ fontSize: 11, fontWeight: 500 }}>د.ب</small></span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* ── FEATURE ── */}
          {products.length > 0 && (
            <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: '#FFF' }}>
              <div style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(145deg,#EAE0D4,#DCCEBF)', minHeight: 520, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                onMouseEnter={e => { const bg = e.currentTarget.querySelector('._fbg') as HTMLElement; if (bg) bg.style.transform = 'scale(1.04)'; }}
                onMouseLeave={e => { const bg = e.currentTarget.querySelector('._fbg') as HTMLElement; if (bg) bg.style.transform = 'scale(1)'; }}>
                <div className="_fbg" style={{ position: 'absolute', inset: 0, backgroundImage: products[0]?.image ? `url(${products[0].image})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center', transition: 'transform .7s cubic-bezier(.22,.68,0,1.2)' }}></div>
                {!products[0]?.image && <span style={{ fontFamily: "'Amiri', serif", fontSize: 110, color: 'rgba(154,45,85,.09)', fontStyle: 'italic', position: 'relative', zIndex: 1, lineHeight: 1, userSelect: 'none' }}>◆</span>}
                <div style={{ position: 'absolute', bottom: 24, left: 24, fontFamily: "'Cormorant Garamond', serif", fontSize: 44, fontStyle: 'italic', fontWeight: 300, color: 'rgba(22,11,16,.16)', lineHeight: 1, zIndex: 2 }}>02</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 'clamp(40px,6vw,80px) clamp(28px,5.5vw,72px)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 10, letterSpacing: '0.26em', fontWeight: 700, color: '#C4A882', textTransform: 'uppercase', marginBottom: 22 }}>
                  <span style={{ width: 22, height: 1, background: '#C4A882', display: 'block' }}></span>
                  FEATURED PIECE
                </div>
                <h2 style={{ fontFamily: "'Amiri', serif", fontSize: 'clamp(1.9rem,3.2vw,46px)', color: '#160B10', fontWeight: 400, lineHeight: 1.2, margin: '0 0 18px' }}>
                  {products[0]?.name || 'مخوار المجموعة الخاصة'}
                </h2>
                <div style={{ width: 34, height: 1.5, background: '#C4A882', margin: '0 0 22px' }}></div>
                <p style={{ fontSize: 14, color: '#6A4850', lineHeight: 2.0, margin: '0 0 28px', maxWidth: 380 }}>
                  {products[0]?.description || 'قطعة مصممة بأرقى الخامات، تجمع بين الأناقة الشرقية الأصيلة والتفاصيل العصرية الدقيقة — لإطلالة تتحدث عن ذوقكِ الرفيع.'}
                </p>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 34, fontStyle: 'italic', fontWeight: 300, color: '#9A2D55', marginBottom: 32, lineHeight: 1 }}>
                  <small style={{ fontSize: 18, marginLeft: 4 }}>د.ب</small>
                  {products[0]?.price?.toFixed(2) || '—'}
                </div>
                <button onClick={() => handleProductClick(products[0])} style={{ padding: '14px 40px', background: '#160B10', color: '#FFF', border: 'none', fontSize: 12.5, fontWeight: 700, letterSpacing: '0.07em', cursor: 'pointer', fontFamily: "'Cairo', sans-serif", width: 'fit-content', transition: 'background .18s,transform .18s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#9A2D55'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#160B10'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}>
                  تسوّقي هذه القطعة
                </button>
              </div>
            </section>
          )}

          {/* ── CATEGORIES ── */}
          <section style={{ padding: '80px 44px', background: '#F3EDE7' }}>
            <div style={{ maxWidth: 1360, margin: '0 auto' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 40 }}>
                <h2 style={{ fontFamily: "'Amiri', serif", fontSize: 30, color: '#160B10', margin: 0, fontWeight: 400 }}>تسوّقي حسب الفئة</h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1.55fr 1fr 1fr', gridTemplateRows: '250px 250px', gap: 6 }}>
                {(categories.filter(c => c.id !== 'all').slice(0, 4).length > 0
                  ? categories.filter(c => c.id !== 'all').slice(0, 4)
                  : [{ id: 'c1', name: 'المخاوير', image: '' }, { id: 'c2', name: 'الفساتين', image: '' }, { id: 'c3', name: 'الإكسسوارات', image: '' }, { id: 'c4', name: 'العروس', image: '' }]
                ).map((cat: any, i) => (
                  <button key={cat.id} className="_catbtn"
                    onClick={() => { setActiveTab('shop'); setSelectedCategory(cat.id); }}
                    style={{ position: 'relative', border: 'none', cursor: 'pointer', padding: 0, overflow: 'hidden', gridRow: i === 0 ? '1 / 3' : undefined, background: ['#E8D8CC','#E0D0C4','#DDD4C8','#E4DCCE'][i] }}>
                    {cat.image ? (
                      <img src={cat.image} alt={cat.name} className="_cbg" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    ) : (
                      <div className="_cbg" style={{ position: 'absolute', inset: 0, background: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontFamily: "'Amiri', serif", fontSize: i === 0 ? 72 : 44, color: 'rgba(154,45,85,.1)', fontStyle: 'italic', userSelect: 'none' }}>◆</span>
                      </div>
                    )}
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(22,11,16,.6) 0%,rgba(22,11,16,0) 55%)', transition: 'background .3s' }}></div>
                    <span style={{ position: 'absolute', bottom: i === 0 ? 58 : 44, right: 20, fontSize: 9, letterSpacing: '0.2em', fontWeight: 700, color: 'rgba(255,255,255,.5)', textTransform: 'uppercase' }}>
                      {['COLLECTION I','COLLECTION II','COLLECTION III','COLLECTION IV'][i]}
                    </span>
                    <span style={{ position: 'absolute', bottom: 20, right: 20, fontFamily: "'Amiri', serif", fontSize: i === 0 ? 30 : 20, color: '#FFF', fontWeight: 400 }}>{cat.name}</span>
                    <div className="_carrow" style={{ position: 'absolute', bottom: 20, left: 20, width: 30, height: 30, borderRadius: '50%', border: '1px solid rgba(255,255,255,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,.7)', fontSize: 13, opacity: 0, transform: 'translateY(6px)' }}>←</div>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* ── BRAND PROMISE ── */}
          <section style={{ background: '#160B10', display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'center', padding: '88px 44px', gap: 0, minHeight: 380 }}>
            <div style={{ paddingLeft: 0, paddingRight: 'clamp(24px,5vw,72px)' }}>
              <div style={{ fontSize: 10, letterSpacing: '0.28em', fontWeight: 700, color: 'rgba(255,255,255,.28)', textTransform: 'uppercase', marginBottom: 18 }}>OUR PROMISE</div>
              <h2 style={{ fontFamily: "'Amiri', serif", fontSize: 'clamp(2rem,3.2vw,44px)', color: '#FFF', fontWeight: 400, lineHeight: 1.22, margin: '0 0 18px' }}>
                كل قطعة<br />
                <em style={{ fontStyle: 'italic', color: '#C4A882' }}>تحكي قصة</em>
              </h2>
              <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,.5)', lineHeight: 2.0, margin: '0 0 34px', maxWidth: 400 }}>
                في ألماسة، نؤمن أن الفخامة الحقيقية تكمن في التفاصيل الهادئة — في خيطٍ محكم، ونسيجٍ ناعم، وتصميمٍ يدوم. لهذا تُصنع كل قطعة بعناية استثنائية.
              </p>
              <button onClick={() => setActiveTab('about')} style={{ padding: '14px 38px', background: '#FFF', color: '#160B10', border: 'none', fontSize: 12.5, fontWeight: 700, letterSpacing: '0.06em', cursor: 'pointer', fontFamily: "'Cairo', sans-serif", transition: 'background .18s,transform .18s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#E8D8C4'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#FFF'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}>
                اقرئي قصتنا
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              {[
                { num: '+٥٠٠', label: 'تصميم حصري' },
                { num: '+٢٠٠٠', label: 'عميلة سعيدة' },
                { num: '٧', label: 'سنوات فخامة' },
                { num: '١٠٠٪', label: 'جودة مضمونة' },
              ].map((s, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,.04)', padding: '32px 24px', border: '1px solid rgba(255,255,255,.06)', textAlign: 'center' }}>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 40, fontStyle: 'italic', fontWeight: 300, color: '#C4A882', lineHeight: 1, marginBottom: 8 }}>{s.num}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,.38)', fontWeight: 600, letterSpacing: '0.06em' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </section>

          {/* ── REVIEWS ── */}
          {(reviews.length > 0 || true) && (
            <section style={{ padding: '88px 44px', background: '#FAF7F3' }}>
              <div style={{ maxWidth: 1360, margin: '0 auto' }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 44 }}>
                  <h2 style={{ fontFamily: "'Amiri', serif", fontSize: 30, color: '#160B10', margin: 0, fontWeight: 400 }}>ماذا تقول عميلاتنا</h2>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 22 }}>
                  {(reviews.length > 0 ? reviews.slice(0, 3) : [
                    { id: 'r1', rating: 5, comment: 'جودة استثنائية وتصميم راقٍ جداً. وصل بسرعة ومغلف بشكل أنيق يليق بالعلامة.', customerName: 'نورة العلي — المنامة' },
                    { id: 'r2', rating: 5, comment: 'المخوار تجاوز توقعاتي! الخامة ممتازة والخياطة دقيقة جداً. سأعود للطلب مجدداً.', customerName: 'سارة المنصوري — أبوظبي' },
                    { id: 'r3', rating: 4, comment: 'تجربة تسوق رائعة من البداية للنهاية. التصميم عصري ومريح في نفس الوقت.', customerName: 'لمياء الزهراني — الرياض' },
                  ] as any[]).map((r: any, i) => (
                    <div key={r.id || i} className="_rcard" style={{ padding: '30px 26px', background: '#FFF', border: '1px solid rgba(22,11,16,.07)', transition: 'box-shadow .2s,transform .2s cubic-bezier(.22,.68,0,1.2)' }}>
                      <div style={{ display: 'flex', gap: 3, marginBottom: 16 }}>
                        {Array.from({ length: 5 }).map((_, j) => (
                          <span key={j} style={{ color: j < (r.rating || 5) ? '#C4A882' : '#E8E0D8', fontSize: 13 }}>★</span>
                        ))}
                      </div>
                      <p style={{ fontSize: 13.5, color: '#6A4850', lineHeight: 1.9, margin: '0 0 18px', fontStyle: 'italic' }}>"{r.comment}"</p>
                      <div style={{ fontSize: 11, color: '#9A2D55', fontWeight: 800, letterSpacing: '0.06em' }}>{r.customerName}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* ── NEWSLETTER ── */}
          <section style={{ padding: '96px 44px', textAlign: 'center', background: '#F3EDE7', position: 'relative', overflow: 'hidden' }}>
            <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontFamily: "'Amiri', serif", fontSize: 'clamp(200px,34vw,460px)', color: 'rgba(154,45,85,.04)', pointerEvents: 'none', userSelect: 'none', lineHeight: 1 }}>◆</span>
            <div style={{ position: 'relative', zIndex: 1, maxWidth: 480, margin: '0 auto' }}>
              <div style={{ fontSize: 10, letterSpacing: '0.28em', fontWeight: 700, color: '#C4A882', textTransform: 'uppercase', marginBottom: 16 }}>NEWSLETTER</div>
              <h2 style={{ fontFamily: "'Amiri', serif", fontSize: 'clamp(1.9rem,3vw,40px)', color: '#160B10', fontWeight: 400, margin: '0 0 12px', lineHeight: 1.2 }}>كوني أول من تعلم</h2>
              <p style={{ fontSize: 13.5, color: '#6A4850', lineHeight: 1.85, margin: '0 0 32px' }}>أحدث المجموعات والعروض الحصرية مباشرة إلى بريدك — قبل الجميع</p>
              <div style={{ display: 'flex', background: '#FFF', border: '1px solid rgba(22,11,16,.1)' }}>
                <input type="email" placeholder="بريدك الإلكتروني" style={{ flex: 1, padding: '14px 18px', border: 'none', fontSize: 13, fontFamily: "'Cairo', sans-serif", outline: 'none', background: 'transparent', color: '#160B10', direction: 'rtl' }} />
                <button style={{ padding: '14px 28px', background: '#9A2D55', color: '#FFF', border: 'none', fontSize: 12.5, fontWeight: 800, letterSpacing: '0.06em', cursor: 'pointer', fontFamily: "'Cairo', sans-serif", whiteSpace: 'nowrap', transition: 'background .15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#7B2244'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#9A2D55'; }}>
                  اشتركي
                </button>
              </div>
            </div>
          </section>

          {/* ── FOOTER ── */}
          <footer style={{ background: '#160B10', padding: '60px 44px 28px' }}>
            <div style={{ maxWidth: 1360, margin: '0 auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2.2fr 1fr 1fr 1fr', gap: 44, marginBottom: 44 }}>
                <div>
                  <div style={{ fontFamily: "'Amiri', serif", fontSize: 28, color: '#FFF', marginBottom: 14 }}>
                    ألماسة <span style={{ color: '#C4A882' }}>◆</span>
                  </div>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,.45)', lineHeight: 1.85, margin: '0 0 22px', maxWidth: 220 }}>أزياء نسائية فاخرة — البحرين<br />تصاميم تجمع الأصالة بالعصرية</p>
                  <div style={{ display: 'flex', gap: 18 }}>
                    {[{ label: 'Instagram', href: ig }, { label: 'WhatsApp', href: wa }].map(s => (
                      <a key={s.label} href={s.href} target="_blank" rel="noreferrer"
                        style={{ fontSize: 11.5, color: '#C4A882', textDecoration: 'none', fontWeight: 700, borderBottom: '1px solid rgba(196,168,130,.3)', paddingBottom: 1, letterSpacing: '0.06em', transition: 'border-color .15s' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#C4A882'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(196,168,130,.3)'; }}>
                        {s.label}
                      </a>
                    ))}
                  </div>
                </div>
                {[
                  { title: 'تسوّقي', links: [{ label: 'المجموعة الكاملة', fn: () => setActiveTab('shop') }, { label: 'وصل حديثاً', fn: () => setActiveTab('shop') }] },
                  { title: 'خدمة العملاء', links: [{ label: 'تتبع الطلب', fn: () => setActiveTab('tracking') }, { label: 'تواصلي معنا', fn: () => setActiveTab('contact') }] },
                  { title: 'عن ألماسة', links: [{ label: 'قصتنا', fn: () => setActiveTab('about') }, { label: 'سياسة الخصوصية', fn: () => {} }] },
                ].map(col => (
                  <div key={col.title}>
                    <div style={{ fontSize: 9.5, letterSpacing: '0.2em', fontWeight: 800, color: 'rgba(255,255,255,.28)', textTransform: 'uppercase', marginBottom: 18 }}>{col.title}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {col.links.map(l => (
                        <button key={l.label} onClick={l.fn} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,.48)', fontSize: 13, fontFamily: "'Cairo', sans-serif", textAlign: 'right', padding: 0, transition: 'color .15s' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#FFF'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,.48)'; }}>
                          {l.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: '1px solid rgba(255,255,255,.07)', paddingTop: 22, fontSize: 11, color: 'rgba(255,255,255,.3)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                <span>© ٢٠٢٦ ألماسة. جميع الحقوق محفوظة.</span>
                <span style={{ letterSpacing: '0.08em' }}>ALMAASA FASHION — BAHRAIN</span>
              </div>
            </div>
          </footer>

        </main>
      )}

      {/* ── SHOP PAGE ──────────────────────────────────────────── */}
      {activeTab === 'shop' && (
        <main>
          {/* Breadcrumb */}
          <div style={{ width: '100%', maxWidth: 1240, margin: '0 auto', padding: '30px 60px 0', boxSizing: 'border-box', fontSize: 13, color: '#9a8a85' }}>
            <button onClick={() => setActiveTab('home')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontFamily: "'Cairo', sans-serif", fontSize: 13 }}>الرئيسية</button>
            {' / '}
            <span style={{ color: '#241419' }}>المخاوير</span>
          </div>

          {/* Title */}
          <div style={{ width: '100%', maxWidth: 1240, margin: '0 auto', padding: '20px 60px 0', boxSizing: 'border-box', textAlign: 'center' }}>
            <h1 style={{ fontFamily: "'Amiri', serif", fontSize: 38, color: '#241419', margin: 0 }}>
              {selectedCategory === 'all' ? 'مجموعة المخاوير' : categories.find(c => c.id === selectedCategory)?.name || 'المنتجات'}
            </h1>
            <div style={{ fontSize: 14, color: '#6b5a5f', marginTop: 10 }}>{filteredProducts.length} منتج</div>
          </div>

          {/* Layout: sidebar + grid */}
          <div style={{ width: '100%', maxWidth: 1240, margin: '0 auto', padding: '44px 60px 80px', boxSizing: 'border-box', display: 'grid', gridTemplateColumns: '240px 1fr', gap: 40 }}
            className="md:grid block">

            {/* Sidebar Filters */}
            <aside className="hidden md:block">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
                {/* Search */}
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#241419', marginBottom: 14 }}>البحث</div>
                  <div style={{ position: 'relative' }}>
                    <Search style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#9a8a85' }} />
                    <input type="text" placeholder="ابحثي..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                      style={{ width: '100%', padding: '10px 36px 10px 12px', border: '1px solid rgba(154,45,85,.25)', borderRadius: 2, fontSize: 13, fontFamily: "'Cairo', sans-serif", outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                </div>

                {/* Category filter */}
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#241419', marginBottom: 14 }}>الفئة</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14, color: '#4a3d40' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                      <input type="radio" name="cat" checked={selectedCategory === 'all'} onChange={() => setSelectedCategory('all')} style={{ accentColor: '#9A2D55' }} />
                      الكل ({products.length})
                    </label>
                    {categories.filter(c => c.id !== 'all').map(cat => (
                      <label key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                        <input type="radio" name="cat" checked={selectedCategory === cat.id} onChange={() => setSelectedCategory(cat.id)} style={{ accentColor: '#9A2D55' }} />
                        {cat.name}
                      </label>
                    ))}
                  </div>
                </div>

                {/* WhatsApp CTA */}
                <div style={{ padding: '16px', background: '#F3EAE2', borderRadius: 2 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#241419', marginBottom: 8 }}>تحتاجين مساعدة؟</div>
                  <a href={wa} target="_blank" rel="noreferrer"
                    style={{ fontSize: 13, color: '#9A2D55', textDecoration: 'underline' }}>تواصلي معنا عبر واتساب</a>
                </div>
              </div>
            </aside>

            {/* Product Grid */}
            <div>
              {/* Mobile search + filter */}
              <div className="md:hidden" style={{ marginBottom: 20, display: 'flex', gap: 10 }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Search style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#9a8a85' }} />
                  <input type="text" placeholder="ابحثي..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    style={{ width: '100%', padding: '10px 32px 10px 10px', border: '1px solid rgba(154,45,85,.25)', borderRadius: 2, fontSize: 13, fontFamily: "'Cairo', sans-serif", outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>

              {/* Mobile category tabs */}
              <div className="md:hidden" style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 20, paddingBottom: 4 }}>
                <button onClick={() => setSelectedCategory('all')}
                  style={{ flexShrink: 0, padding: '6px 14px', border: '1px solid', borderRadius: 2, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'Cairo', sans-serif", background: selectedCategory === 'all' ? '#9A2D55' : 'transparent', color: selectedCategory === 'all' ? '#fff' : '#241419', borderColor: selectedCategory === 'all' ? '#9A2D55' : 'rgba(154,45,85,.3)' }}>
                  الكل
                </button>
                {categories.filter(c => c.id !== 'all').map(cat => (
                  <button key={cat.id} onClick={() => setSelectedCategory(cat.id)}
                    style={{ flexShrink: 0, padding: '6px 14px', border: '1px solid', borderRadius: 2, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'Cairo', sans-serif", background: selectedCategory === cat.id ? '#9A2D55' : 'transparent', color: selectedCategory === cat.id ? '#fff' : '#241419', borderColor: selectedCategory === cat.id ? '#9A2D55' : 'rgba(154,45,85,.3)' }}>
                    {cat.name}
                  </button>
                ))}
              </div>

              {filteredProducts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9a8a85' }}>
                  <ShoppingBag style={{ width: 40, height: 40, margin: '0 auto 16px', color: '#ECD9DD' }} />
                  <p style={{ fontSize: 16, fontWeight: 600, color: '#241419', marginBottom: 8 }}>لا توجد منتجات مطابقة</p>
                  <button onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
                    style={{ padding: '10px 24px', background: '#9A2D55', color: '#fff', border: 'none', borderRadius: 2, cursor: 'pointer', fontSize: 13, fontFamily: "'Cairo', sans-serif" }}>
                    عرض الكل
                  </button>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(190px,1fr))', gap: 24 }}>
                  {filteredProducts.map(product => (
                    <div key={product.id} onClick={() => handleProductClick(product)}
                      style={{ background: '#fff', cursor: 'pointer', border: '1px solid rgba(154,45,85,.12)', display: 'flex', flexDirection: 'column' }}>
                      {/* Image */}
                      <div style={{ position: 'relative', aspectRatio: '1/1', width: '100%', overflow: 'hidden' }}>
                        {product.image ? (
                          <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', backgroundImage: PH, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9A2D55', font: '500 10px ui-monospace,Menlo,monospace' }}>صورة المنتج</div>
                        )}
                        {product.stock === 0 && (
                          <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: 12, fontWeight: 700, color: '#9A2D55', background: '#fff', padding: '6px 14px', border: '1px solid rgba(154,45,85,.3)' }}>نفدت الكمية</span>
                          </div>
                        )}
                        {product.originalPrice && (
                          <span style={{ position: 'absolute', top: 8, right: 8, background: '#9A2D55', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 2 }}>
                            -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                          </span>
                        )}
                        <button onClick={e => toggleWishlist(product.id, e)}
                          style={{ position: 'absolute', top: 8, left: 8, width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                          <Heart style={{ width: 14, height: 14, color: wishlist.includes(product.id) ? '#9A2D55' : '#9a8a85', fill: wishlist.includes(product.id) ? '#9A2D55' : 'transparent' }} />
                        </button>
                      </div>
                      {/* Info */}
                      <div style={{ padding: '14px 14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} style={{ width: 11, height: 11, fill: i < Math.round(product.rating) ? '#B08D57' : 'transparent', color: '#B08D57' }} />
                          ))}
                          <span style={{ fontSize: 11, color: '#9a8a85', marginRight: 4 }}>({product.reviewCount})</span>
                        </div>
                        <div style={{ fontFamily: "'Amiri', serif", fontSize: 17, color: '#241419', marginBottom: 8, lineHeight: 1.3 }}>{product.name}</div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div>
                            <span style={{ fontSize: 15, fontWeight: 700, color: '#9A2D55' }}>{product.price.toFixed(2)}</span>
                            <span style={{ fontSize: 11, color: '#9A2D55', marginRight: 2 }}>د.ب</span>
                            {product.originalPrice && (
                              <div style={{ fontSize: 11, color: '#9a8a85', textDecoration: 'line-through' }}>{product.originalPrice.toFixed(2)} د.ب</div>
                            )}
                          </div>
                          <button onClick={e => { e.stopPropagation(); handleProductClick(product); }}
                            disabled={product.stock === 0}
                            style={{ width: 32, height: 32, background: product.stock === 0 ? '#F3EAE2' : '#9A2D55', color: '#fff', border: 'none', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: product.stock === 0 ? 'not-allowed' : 'pointer' }}>
                            <Plus style={{ width: 16, height: 16 }} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      )}

      {/* ── CART PAGE ──────────────────────────────────────────── */}
      {activeTab === 'cart' && (
        <main style={{ width: '100%', maxWidth: 1240, margin: '0 auto', padding: '36px 60px', boxSizing: 'border-box' }}>
          <h1 style={{ fontFamily: "'Amiri', serif", fontSize: 34, color: '#241419', marginBottom: 40, textAlign: 'center' }}>سلة التسوّق</h1>

          {checkoutStep === 'success' && newOrder ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', maxWidth: 480, margin: '0 auto' }}>
              <CheckCircle style={{ width: 56, height: 56, color: '#4CAF50', margin: '0 auto 20px' }} />
              <h2 style={{ fontFamily: "'Amiri', serif", fontSize: 28, color: '#241419', marginBottom: 12 }}>تم الطلب بنجاح!</h2>
              <p style={{ fontSize: 14, color: '#6b5a5f', marginBottom: 24 }}>سيتم التواصل معكِ قريباً لتأكيد الطلب</p>
              <div style={{ background: '#F3EAE2', padding: 20, marginBottom: 24, textAlign: 'right' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14 }}>
                  <span style={{ color: '#6b5a5f' }}>رقم التتبع:</span>
                  <strong style={{ color: '#9A2D55', fontFamily: 'monospace' }}>{newOrder.trackingCode}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                  <span style={{ color: '#6b5a5f' }}>الإجمالي:</span>
                  <strong style={{ color: '#241419' }}>{newOrder.total.toFixed(2)} د.ب</strong>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button onClick={() => { setTrackSearchQuery(newOrder.trackingCode); setTrackedOrder(newOrder); setActiveTab('tracking'); setCheckoutStep('cart'); }}
                  style={{ padding: '14px 24px', background: '#9A2D55', color: '#fff', border: 'none', borderRadius: 2, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: "'Cairo', sans-serif" }}>
                  تتبع شحنتي
                </button>
                <button onClick={() => { setActiveTab('home'); setCheckoutStep('cart'); setNewOrder(null); }}
                  style={{ padding: '14px 24px', background: 'transparent', color: '#241419', border: '1px solid rgba(154,45,85,.3)', borderRadius: 2, fontSize: 14, cursor: 'pointer', fontFamily: "'Cairo', sans-serif" }}>
                  متابعة التسوق
                </button>
              </div>
            </div>
          ) : cart.length === 0 && checkoutStep !== 'success' ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9a8a85' }}>
              <ShoppingBag style={{ width: 48, height: 48, margin: '0 auto 16px', color: '#ECD9DD' }} />
              <p style={{ fontSize: 16, fontWeight: 600, color: '#241419', marginBottom: 8 }}>سلتك فارغة</p>
              <button onClick={() => setActiveTab('shop')}
                style={{ padding: '12px 28px', background: '#9A2D55', color: '#fff', border: 'none', borderRadius: 2, fontSize: 14, cursor: 'pointer', fontFamily: "'Cairo', sans-serif" }}>
                تصفحي المخاوير
              </button>
            </div>
          ) : (
            <>
              {/* Steps */}
              {checkoutStep !== 'success' && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 32, fontSize: 13, fontWeight: 600 }}>
                  {[['cart', 'السلة'], ['details', 'بيانات الشحن'], ['payment', 'الدفع']].map(([step, label], i) => (
                    <React.Fragment key={step}>
                      <span style={{ color: checkoutStep === step ? '#9A2D55' : '#9a8a85' }}>{i + 1}. {label}</span>
                      {i < 2 && <span style={{ color: '#ECD9DD' }}>—</span>}
                    </React.Fragment>
                  ))}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 50 }} className="md:grid block">

                {/* Left: items / form */}
                <div>
                  {/* CART STEP */}
                  {checkoutStep === 'cart' && (
                    <div>
                      {cart.map((item, index) => (
                        <div key={index} style={{ display: 'flex', gap: 22, padding: '24px 0', borderBottom: '1px solid rgba(154,45,85,.14)' }}>
                          <div style={{ width: 120, height: 140, flexShrink: 0, backgroundImage: item.product.image ? `url(${item.product.image})` : PH, backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9A2D55', font: '500 10px ui-monospace,Menlo,monospace' }}>
                            {!item.product.image && 'صورة'}
                          </div>
                          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8 }}>
                            <div style={{ fontSize: 15, fontWeight: 600, color: '#241419' }}>{item.product.name}</div>
                            <div style={{ fontSize: 13, color: '#9a8a85' }}>المقاس: {item.selectedSize} · اللون: {item.selectedColor}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 6 }}>
                              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid rgba(154,45,85,.3)', borderRadius: 2 }}>
                                <button onClick={() => updateCartQty(index, item.quantity - 1)} style={{ width: 32, height: 34, border: 'none', background: 'none', fontSize: 14, color: '#9A2D55', cursor: 'pointer' }}>−</button>
                                <div style={{ width: 32, textAlign: 'center', fontSize: 13 }}>{item.quantity}</div>
                                <button onClick={() => updateCartQty(index, item.quantity + 1)} style={{ width: 32, height: 34, border: 'none', background: 'none', fontSize: 14, color: '#9A2D55', cursor: 'pointer' }}>+</button>
                              </div>
                              <button onClick={() => removeFromCart(index)} style={{ border: 'none', background: 'none', color: '#9a8a85', fontSize: 13, textDecoration: 'underline', cursor: 'pointer', fontFamily: "'Cairo', sans-serif" }}>إزالة</button>
                            </div>
                          </div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: '#9A2D55', alignSelf: 'center', flexShrink: 0 }}>{(item.product.price * item.quantity).toFixed(2)} د.ب</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* DETAILS STEP */}
                  {checkoutStep === 'details' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      <h3 style={{ fontFamily: "'Amiri', serif", fontSize: 22, color: '#241419', marginBottom: 8 }}>بيانات الشحن</h3>
                      {[
                        { label: 'الاسم الكامل *', type: 'text', val: customerName, set: setCustomerName, ph: 'فاطمة البوعينين' },
                        { label: 'رقم الواتساب *', type: 'tel', val: customerPhone, set: setCustomerPhone, ph: '97337037697' },
                        { label: 'البريد الإلكتروني', type: 'email', val: customerEmail, set: setCustomerEmail, ph: 'aisha@example.com' },
                      ].map(f => (
                        <div key={f.label}>
                          <label style={{ display: 'block', fontSize: 13, color: '#6b5a5f', marginBottom: 6 }}>{f.label}</label>
                          <input type={f.type} placeholder={f.ph} value={f.val} onChange={e => f.set(e.target.value)}
                            style={{ width: '100%', padding: '14px 16px', border: '1px solid rgba(154,45,85,.25)', borderRadius: 2, fontSize: 14, fontFamily: "'Cairo', sans-serif", outline: 'none', boxSizing: 'border-box' }} />
                        </div>
                      ))}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div>
                          <label style={{ display: 'block', fontSize: 13, color: '#6b5a5f', marginBottom: 6 }}>الدولة *</label>
                          <select value={customerCountry} onChange={e => setCustomerCountry(e.target.value)}
                            style={{ width: '100%', padding: '14px 16px', border: '1px solid rgba(154,45,85,.25)', borderRadius: 2, fontSize: 13, fontFamily: "'Cairo', sans-serif", outline: 'none', background: '#fff', boxSizing: 'border-box' }}>
                            {['البحرين', 'السعودية', 'الكويت', 'الإمارات', 'قطر', 'عمان'].map(c => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: 13, color: '#6b5a5f', marginBottom: 6 }}>المدينة *</label>
                          <input type="text" placeholder="المنامة" value={customerCity} onChange={e => setCustomerCity(e.target.value)}
                            style={{ width: '100%', padding: '14px 16px', border: '1px solid rgba(154,45,85,.25)', borderRadius: 2, fontSize: 13, fontFamily: "'Cairo', sans-serif", outline: 'none', boxSizing: 'border-box' }} />
                        </div>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 13, color: '#6b5a5f', marginBottom: 6 }}>العنوان الكامل *</label>
                        <textarea rows={2} placeholder="طريق 1221، فيلا 93" value={customerAddress} onChange={e => setCustomerAddress(e.target.value)}
                          style={{ width: '100%', padding: '14px 16px', border: '1px solid rgba(154,45,85,.25)', borderRadius: 2, fontSize: 13, fontFamily: "'Cairo', sans-serif", outline: 'none', resize: 'none', boxSizing: 'border-box' }} />
                      </div>
                      {/* Shipping methods */}
                      {availableShippingMethods.length > 0 && (
                        <div>
                          <label style={{ display: 'block', fontSize: 13, color: '#6b5a5f', marginBottom: 10, fontWeight: 600 }}>طريقة التوصيل</label>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {availableShippingMethods.map((method: any) => (
                              <label key={method.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', border: `1px solid ${selectedShippingMethod?.id === method.id ? '#9A2D55' : 'rgba(154,45,85,.2)'}`, borderRadius: 2, cursor: 'pointer', background: selectedShippingMethod?.id === method.id ? '#F3EAE2' : '#fff' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                  <input type="radio" name="shipping" checked={selectedShippingMethod?.id === method.id} onChange={() => setSelectedShippingMethod(method)} style={{ accentColor: '#9A2D55' }} />
                                  <div>
                                    <div style={{ fontSize: 14, fontWeight: 600, color: '#241419' }}>{method.name}</div>
                                    {method.description && <div style={{ fontSize: 12, color: '#9a8a85' }}>{method.description}</div>}
                                  </div>
                                </div>
                                <span style={{ fontSize: 14, fontWeight: 700, color: '#9A2D55' }}>{method.priceType === 'free' ? 'مجاني' : `${parseFloat(method.price).toFixed(3)} د.ب`}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* PAYMENT STEP */}
                  {checkoutStep === 'payment' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      <h3 style={{ fontFamily: "'Amiri', serif", fontSize: 22, color: '#241419', marginBottom: 8 }}>الدفع الآمن</h3>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        {[
                          { id: 'benefit', label: 'BenefitPay', sub: 'البحرين' },
                          { id: 'knet', label: 'KNet', sub: 'الكويت' },
                          { id: 'card', label: 'بطاقة بنكية', sub: 'Visa / Mastercard' },
                          { id: 'applepay', label: 'Apple Pay', sub: 'المحفظة' },
                        ].map(m => (
                          <button key={m.id} onClick={() => setPaymentMethod(m.id as any)}
                            style={{ padding: '12px', border: `1px solid ${paymentMethod === m.id ? '#9A2D55' : 'rgba(154,45,85,.2)'}`, borderRadius: 2, background: paymentMethod === m.id ? '#F3EAE2' : '#fff', cursor: 'pointer', textAlign: 'center', fontFamily: "'Cairo', sans-serif" }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: paymentMethod === m.id ? '#9A2D55' : '#241419' }}>{m.label}</div>
                            <div style={{ fontSize: 11, color: '#9a8a85' }}>{m.sub}</div>
                          </button>
                        ))}
                      </div>
                      <div style={{ padding: 16, background: '#F3EAE2', borderRadius: 2 }}>
                        {paymentMethod === 'benefit' && (
                          <div>
                            <p style={{ fontSize: 13, fontWeight: 600, color: '#9A2D55', marginBottom: 10 }}>أدخلي رقم الهاتف لـ BenefitPay</p>
                            <input type="tel" placeholder="37037697" value={benefitPhone} onChange={e => setBenefitPhone(e.target.value)}
                              style={{ width: '100%', padding: '12px 16px', border: '1px solid rgba(154,45,85,.25)', borderRadius: 2, fontSize: 14, fontFamily: "'Cairo', sans-serif", outline: 'none', textAlign: 'center', boxSizing: 'border-box' }} />
                          </div>
                        )}
                        {paymentMethod === 'knet' && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <input type="text" placeholder="رقم البطاقة" value={knetCardNum} onChange={e => setKnetCardNum(e.target.value)}
                              style={{ padding: '12px 16px', border: '1px solid rgba(154,45,85,.25)', borderRadius: 2, fontSize: 13, fontFamily: "'Cairo', sans-serif", outline: 'none' }} />
                            <input type="password" placeholder="الرقم السري (PIN)" value={knetPin} onChange={e => setKnetPin(e.target.value)} maxLength={4}
                              style={{ padding: '12px 16px', border: '1px solid rgba(154,45,85,.25)', borderRadius: 2, fontSize: 13, fontFamily: "'Cairo', sans-serif", outline: 'none' }} />
                          </div>
                        )}
                        {paymentMethod === 'card' && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <input type="text" placeholder="الاسم على البطاقة" value={cardName} onChange={e => setCardName(e.target.value)}
                              style={{ padding: '12px 16px', border: '1px solid rgba(154,45,85,.25)', borderRadius: 2, fontSize: 13, fontFamily: "'Cairo', sans-serif", outline: 'none' }} />
                            <input type="text" placeholder="رقم البطاقة" value={cardNumber} onChange={e => setCardNumber(e.target.value)}
                              style={{ padding: '12px 16px', border: '1px solid rgba(154,45,85,.25)', borderRadius: 2, fontSize: 13, fontFamily: 'monospace', outline: 'none', textAlign: 'center' }} />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                              <input type="text" placeholder="MM/YY" value={cardExpiry} onChange={e => setCardExpiry(e.target.value)}
                                style={{ padding: '12px 16px', border: '1px solid rgba(154,45,85,.25)', borderRadius: 2, fontSize: 13, fontFamily: 'monospace', outline: 'none', textAlign: 'center' }} />
                              <input type="password" placeholder="CVV" value={cardCvv} onChange={e => setCardCvv(e.target.value)} maxLength={3}
                                style={{ padding: '12px 16px', border: '1px solid rgba(154,45,85,.25)', borderRadius: 2, fontSize: 13, fontFamily: 'monospace', outline: 'none', textAlign: 'center' }} />
                            </div>
                          </div>
                        )}
                        {paymentMethod === 'applepay' && (
                          <p style={{ fontSize: 13, color: '#9a8a85', textAlign: 'center', padding: '12px 0' }}>جاري الاتصال بـ Face ID / Touch ID...</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right: order summary */}
                <div style={{ background: '#F3EAE2', padding: 30, height: 'fit-content', display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <h3 style={{ fontFamily: "'Amiri', serif", fontSize: 20, color: '#241419', margin: 0 }}>ملخص الطلب</h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, borderBottom: '1px solid rgba(154,45,85,.14)', paddingBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#4a3d40' }}>
                      <span>المجموع الفرعي</span>
                      <span>{calculatedSubtotal.toFixed(2)} د.ب</span>
                    </div>
                    {calculatedDiscount > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#27ae60' }}>
                        <span>الخصم</span>
                        <span>-{calculatedDiscount.toFixed(2)} د.ب</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#4a3d40' }}>
                      <span>الشحن</span>
                      <span>{shippingCharge === 0 ? 'مجاني' : `${shippingCharge.toFixed(2)} د.ب`}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 700 }}>
                    <span style={{ color: '#241419' }}>الإجمالي</span>
                    <span style={{ color: '#9A2D55' }}>{totalCost.toFixed(2)} د.ب</span>
                  </div>

                  {/* Coupon (only on cart step) */}
                  {checkoutStep === 'cart' && (
                    <div>
                      <label style={{ display: 'block', fontSize: 13, color: '#6b5a5f', marginBottom: 8 }}>كوبون الخصم</label>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <input type="text" placeholder="ALMAASA10" value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())}
                          style={{ flex: 1, padding: '10px 12px', border: '1px solid rgba(154,45,85,.3)', borderRadius: 2, fontSize: 13, fontFamily: "'Cairo', sans-serif", outline: 'none', background: '#fff' }} />
                        <button onClick={applyCoupon}
                          style={{ padding: '10px 16px', background: '#9A2D55', color: '#fff', border: 'none', borderRadius: 2, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'Cairo', sans-serif" }}>
                          تفعيل
                        </button>
                      </div>
                      {activeCoupon && <p style={{ fontSize: 12, color: '#27ae60', marginTop: 6 }}>✓ خصم {activeCoupon.type === 'percentage' ? `${activeCoupon.discount}%` : `${activeCoupon.discount.toFixed(2)} د.ب`} مطبّق</p>}
                      {couponError && <p style={{ fontSize: 12, color: '#c0392b', marginTop: 6 }}>{couponError}</p>}
                    </div>
                  )}

                  {/* Action buttons */}
                  {checkoutStep === 'cart' && (
                    <button onClick={() => setCheckoutStep('details')}
                      style={{ padding: '15px 0', background: '#9A2D55', color: '#fff', border: 'none', borderRadius: 2, fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: "'Cairo', sans-serif" }}>
                      متابعة الطلب
                    </button>
                  )}
                  {checkoutStep === 'details' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <button onClick={() => {
                        if (!customerName || !customerPhone || !customerAddress) { addToast('يرجى تعبئة الحقول الأساسية', 'error'); return; }
                        setCheckoutStep('payment');
                      }}
                        style={{ padding: '15px 0', background: '#9A2D55', color: '#fff', border: 'none', borderRadius: 2, fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: "'Cairo', sans-serif" }}>
                        إلى الدفع
                      </button>
                      <button onClick={() => setCheckoutStep('cart')}
                        style={{ padding: '12px 0', background: 'transparent', color: '#241419', border: '1px solid rgba(154,45,85,.3)', borderRadius: 2, fontSize: 13, cursor: 'pointer', fontFamily: "'Cairo', sans-serif" }}>
                        رجوع
                      </button>
                    </div>
                  )}
                  {checkoutStep === 'payment' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <button onClick={triggerPayment} disabled={isPaying}
                        style={{ padding: '15px 0', background: isPaying ? '#9a8a85' : '#9A2D55', color: '#fff', border: 'none', borderRadius: 2, fontSize: 15, fontWeight: 600, cursor: isPaying ? 'wait' : 'pointer', fontFamily: "'Cairo', sans-serif" }}>
                        {isPaying ? 'جاري الدفع...' : 'تأكيد الطلب والدفع'}
                      </button>
                      <button onClick={() => setCheckoutStep('details')}
                        style={{ padding: '12px 0', background: 'transparent', color: '#241419', border: '1px solid rgba(154,45,85,.3)', borderRadius: 2, fontSize: 13, cursor: 'pointer', fontFamily: "'Cairo', sans-serif" }}>
                        رجوع
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </main>
      )}

      {/* ── ABOUT PAGE ─────────────────────────────────────────── */}
      {activeTab === 'about' && (
        <main>
          {/* Story section */}
          <div style={{ width: '100%', maxWidth: 1240, margin: '0 auto', padding: '64px 60px', boxSizing: 'border-box', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}
            className="md:grid block">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ fontSize: 13, letterSpacing: '0.25em', color: '#B08D57', fontWeight: 600 }}>قصتنا</div>
              <h1 style={{ fontFamily: "'Amiri', serif", fontSize: 'clamp(1.8rem,4vw,42px)', lineHeight: 1.3, color: '#241419', margin: 0 }}>فخامة تحمل بصمة هوية أصيلة</h1>
              <p style={{ fontSize: 15, lineHeight: 2, color: '#4a3d40' }}>
                ولدت ألماسة من شغف بالتفاصيل التراثية الخليجية، لنقدّم لكِ مخاوير وأزياء نسائية تجمع بين الأصالة والحداثة. كل قطعة نصممها تحمل حكاية من الحرفية اليدوية والخامات الفاخرة، لنمنحكِ إطلالة تليق بلحظاتكِ المميزة.
              </p>
            </div>
            <div style={{ height: 420, backgroundImage: PH, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9A2D55', font: '500 12px/1.4 ui-monospace,Menlo,monospace' }}>
              صورة — ورشة التصميم
            </div>
          </div>

          {/* Values section */}
          <div style={{ width: '100%', background: '#F3EAE2' }}>
            <div style={{ width: '100%', maxWidth: 1240, margin: '0 auto', padding: '70px 60px', boxSizing: 'border-box', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 40, textAlign: 'center' }}
              className="md:grid block">
              {[
                { title: 'حرفية يدوية', desc: 'تطريز دقيق بأيدٍ ماهرة يبرز جمال كل قطعة' },
                { title: 'خامات فاخرة', desc: 'حرير وأقمشة مختارة بعناية لراحة تدوم طوال اليوم' },
                { title: 'توصيل سريع', desc: 'تصلك طلباتك أينما كنتِ خلال أيام معدودة' },
              ].map((v, i) => (
                <div key={i} style={{ padding: '20px 10px' }}>
                  <div style={{ fontFamily: "'Amiri', serif", fontSize: 26, color: '#9A2D55', marginBottom: 12 }}>{v.title}</div>
                  <div style={{ fontSize: 14, lineHeight: 1.9, color: '#4a3d40' }}>{v.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </main>
      )}

      {/* ── CONTACT PAGE ───────────────────────────────────────── */}
      {activeTab === 'contact' && (
        <main>
          <div style={{ width: '100%', maxWidth: 1240, margin: '0 auto', padding: '64px 60px', boxSizing: 'border-box', textAlign: 'center' }}>
            <h1 style={{ fontFamily: "'Amiri', serif", fontSize: 38, color: '#241419', marginBottom: 12 }}>تواصلي معنا</h1>
            <p style={{ fontSize: 15, color: '#6b5a5f' }}>يسعدنا استقبال استفساراتكِ — فريقنا يرد خلال ساعات العمل</p>
          </div>

          <div style={{ width: '100%', maxWidth: 1240, margin: '0 auto', padding: '0 60px 80px', boxSizing: 'border-box', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60 }}
            className="md:grid block">
            {/* Form */}
            {contactSent ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
                <CheckCircle style={{ width: 48, height: 48, color: '#4CAF50' }} />
                <div style={{ fontFamily: "'Amiri', serif", fontSize: 24, color: '#241419' }}>شكراً لتواصلكِ!</div>
                <p style={{ fontSize: 14, color: '#6b5a5f' }}>سيتم الرد عليكِ قريباً</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <input placeholder="الاسم الكامل" value={contactName} onChange={e => setContactName(e.target.value)}
                  style={{ padding: 16, border: '1px solid rgba(154,45,85,.25)', borderRadius: 2, fontFamily: "'Cairo', sans-serif", fontSize: 14, outline: 'none' }} />
                <input placeholder="رقم الجوال" value={contactPhone} onChange={e => setContactPhone(e.target.value)}
                  style={{ padding: 16, border: '1px solid rgba(154,45,85,.25)', borderRadius: 2, fontFamily: "'Cairo', sans-serif", fontSize: 14, outline: 'none' }} />
                <input placeholder="البريد الإلكتروني" value={contactEmail} onChange={e => setContactEmail(e.target.value)}
                  style={{ padding: 16, border: '1px solid rgba(154,45,85,.25)', borderRadius: 2, fontFamily: "'Cairo', sans-serif", fontSize: 14, outline: 'none' }} />
                <textarea placeholder="رسالتكِ" rows={5} value={contactMsg} onChange={e => setContactMsg(e.target.value)}
                  style={{ padding: 16, border: '1px solid rgba(154,45,85,.25)', borderRadius: 2, fontFamily: "'Cairo', sans-serif", fontSize: 14, outline: 'none', resize: 'vertical' }} />
                <button onClick={() => { if (contactName && contactMsg) setContactSent(true); }}
                  style={{ padding: 16, background: '#9A2D55', color: '#fff', border: 'none', fontSize: 15, fontWeight: 600, borderRadius: 2, cursor: 'pointer', fontFamily: "'Cairo', sans-serif" }}>
                  إرسال الرسالة
                </button>
              </div>
            )}

            {/* Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
              {[
                { label: 'واتساب', value: settings?.whatsappNumber || '05xxxxxxxx' },
                { label: 'إنستغرام', value: settings?.instagramUsername || 'almaasa.bh' },
                { label: 'أوقات العمل', value: 'السبت – الخميس: ٩ص – ١١م' },
              ].map((info, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid rgba(154,45,85,.14)', fontSize: 14 }}>
                  <span style={{ fontWeight: 600, color: '#241419' }}>{info.label}</span>
                  <span style={{ color: '#4a3d40' }}>{info.value}</span>
                </div>
              ))}
              <a href={wa} target="_blank" rel="noreferrer"
                style={{ display: 'block', textAlign: 'center', padding: '14px 0', background: '#9A2D55', color: '#fff', textDecoration: 'none', fontSize: 14, fontWeight: 600, borderRadius: 2, fontFamily: "'Cairo', sans-serif" }}>
                تواصلي عبر واتساب
              </a>
            </div>
          </div>
        </main>
      )}

      {/* ── TRACKING PAGE ──────────────────────────────────────── */}
      {activeTab === 'tracking' && (
        <main style={{ minHeight: '60vh', background: '#FBF7F2', padding: '60px 20px' }}>
          <div style={{ maxWidth: 600, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div style={{ width: 60, height: 60, background: '#9A2D55', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Truck style={{ width: 28, height: 28, color: '#fff' }} />
              </div>
              <h1 style={{ fontFamily: "'Amiri', serif", fontSize: 32, color: '#241419', marginBottom: 8 }}>تتبع شحنتكِ</h1>
              <p style={{ fontSize: 14, color: '#6b5a5f' }}>أدخلي رقم التتبع أو رقم الهاتف لمتابعة شحنتكِ</p>
            </div>

            <div style={{ background: '#fff', border: '1px solid rgba(154,45,85,.14)', padding: 32 }}>
              <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                <input type="text" placeholder="رقم التتبع (AL-XXXXX-BH) أو الهاتف..."
                  value={trackSearchQuery} onChange={e => setTrackSearchQuery(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleTrackSearch(); }}
                  style={{ flex: 1, padding: '12px 16px', border: '1px solid rgba(154,45,85,.25)', borderRadius: 2, fontSize: 13, fontFamily: "'Cairo', sans-serif", outline: 'none' }} />
                <button onClick={handleTrackSearch}
                  style={{ padding: '12px 20px', background: '#9A2D55', color: '#fff', border: 'none', borderRadius: 2, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'Cairo', sans-serif" }}>
                  تتبع
                </button>
              </div>

              {trackError && (
                <div style={{ marginBottom: 16, padding: 12, background: '#fdecea', color: '#c0392b', border: '1px solid #f5c6cb', fontSize: 13, borderRadius: 2 }}>
                  {trackError}
                </div>
              )}

              <AnimatePresence mode="wait">
                {trackedOrder ? (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F3EAE2', padding: '16px 20px', marginBottom: 24 }}>
                      <div>
                        <div style={{ fontSize: 11, color: '#9a8a85', fontWeight: 600 }}>رقم التتبع</div>
                        <div style={{ fontFamily: 'monospace', fontWeight: 700, color: '#9A2D55', fontSize: 18 }}>{trackedOrder.trackingCode}</div>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, padding: '6px 14px', background: trackedOrder.shippingStatus === 'delivered' ? '#d4edda' : trackedOrder.shippingStatus === 'shipped' ? '#d1ecf1' : '#F3EAE2', color: trackedOrder.shippingStatus === 'delivered' ? '#155724' : trackedOrder.shippingStatus === 'shipped' ? '#0c5460' : '#9A2D55', borderRadius: 2 }}>
                        {trackedOrder.shippingStatus === 'delivered' ? 'تم التسليم ✓' : trackedOrder.shippingStatus === 'shipped' ? 'قيد الشحن' : trackedOrder.shippingStatus === 'processing' ? 'جاري التجهيز' : 'قيد الانتظار'}
                      </span>
                    </div>

                    <div style={{ position: 'relative', paddingRight: 24 }}>
                      {trackedOrder.timeline.map((event, idx) => (
                        <div key={idx} style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', gap: 16, paddingBottom: 24 }}>
                          <div style={{ position: 'absolute', right: -12, top: 4, width: 16, height: 16, borderRadius: '50%', border: `3px solid ${idx === trackedOrder.timeline.length - 1 ? '#9A2D55' : '#ECD9DD'}`, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {idx === trackedOrder.timeline.length - 1 && <div style={{ width: 6, height: 6, background: '#9A2D55', borderRadius: '50%' }} />}
                          </div>
                          <div style={{ background: '#F3EAE2', padding: '12px 16px', flex: 1 }}>
                            <div style={{ fontSize: 11, color: '#9a8a85', fontFamily: 'monospace' }}>{event.date}</div>
                            <div style={{ fontWeight: 600, fontSize: 14, color: '#241419', marginTop: 2 }}>{event.title}</div>
                            <div style={{ fontSize: 13, color: '#6b5a5f', marginTop: 2 }}>{event.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div style={{ marginTop: 16, padding: 14, background: '#F3EAE2', fontSize: 13, color: '#6b5a5f', textAlign: 'center' }}>
                      استفسار؟ تواصلي معنا على{' '}
                      <a href={wa} style={{ color: '#9A2D55', textDecoration: 'underline' }}>واتساب</a>
                    </div>
                  </motion.div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: '#9a8a85', border: '1px dashed rgba(154,45,85,.2)', borderRadius: 2 }}>
                    <Clock style={{ width: 32, height: 32, color: '#ECD9DD', margin: '0 auto 10px' }} />
                    <p style={{ fontSize: 13, fontWeight: 600 }}>أدخلي رقم الطلب أو الهاتف للبدء</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </main>
      )}

      {/* ══════════════════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════════════════ */}
      <footer style={{ background: '#241419', color: '#EADFD8', display: 'flex', justifyContent: 'center', fontFamily: "'Cairo', sans-serif" }}>
        <div style={{ width: '100%', maxWidth: 1240, padding: '50px 40px', boxSizing: 'border-box', display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: 30, textAlign: 'right' }}
          className="md:grid block">
          {/* Brand */}
          <div>
            <div style={{ fontFamily: "'Amiri', serif", fontSize: 24, color: '#fff', marginBottom: 10 }}>ألماسة</div>
            <div style={{ fontSize: 13, lineHeight: 1.9, color: '#b8a9a2' }}>وجهتك الأولى للأزياء الراقية والمخاوير الفاخرة</div>
          </div>

          {/* Quick links */}
          <div style={{ fontSize: 13, lineHeight: 2.4, color: '#d8c9c2' }}>
            <div style={{ color: '#B08D57', fontWeight: 600, marginBottom: 6 }}>روابط سريعة</div>
            {[
              { label: 'المخاوير', page: 'shop' as Page },
              { label: 'من نحن', page: 'about' as Page },
              { label: 'تواصل معنا', page: 'contact' as Page },
              { label: 'تتبع الطلب', page: 'tracking' as Page },
            ].map(({ label, page }) => (
              <button key={page} onClick={() => setActiveTab(page)}
                style={{ color: 'inherit', background: 'none', border: 'none', cursor: 'pointer', display: 'block', fontSize: 13, fontFamily: "'Cairo', sans-serif", padding: 0, lineHeight: 2.4 }}>
                {label}
              </button>
            ))}
          </div>

          {/* Contact */}
          <div style={{ fontSize: 13, lineHeight: 2.4, color: '#d8c9c2' }}>
            <div style={{ color: '#B08D57', fontWeight: 600, marginBottom: 6 }}>تواصلي معنا</div>
            <div>واتساب: {settings?.whatsappNumber || '05xxxxxxxx'}</div>
            <div>إنستغرام: {settings?.instagramUsername || 'almaasa.bh'}</div>
            <div style={{ marginTop: 12, display: 'flex', gap: 10 }}>
              <a href={wa} target="_blank" rel="noreferrer" style={{ color: '#d8c9c2', textDecoration: 'none' }}>
                <Phone style={{ width: 16, height: 16 }} />
              </a>
              <a href={ig} target="_blank" rel="noreferrer" style={{ color: '#d8c9c2', textDecoration: 'none' }}>
                <Instagram style={{ width: 16, height: 16 }} />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div style={{ display: 'none' }} /> {/* spacer for ts */}
      </footer>

      {/* Copyright bar */}
      <div style={{ background: '#1a100d', color: '#6b5a5f', padding: '12px 40px', textAlign: 'center', fontSize: 12, fontFamily: "'Cairo', sans-serif" }}>
        <span>© {new Date().getFullYear()} مخاوير ألماسة — جميع الحقوق محفوظة</span>
        <button onClick={onNavigateToAdmin} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'transparent', fontSize: 1, marginRight: 8 }}>·</button>
      </div>

      {/* ── MOBILE BOTTOM NAV ──────────────────────────────────── */}
      <div className="md:hidden" style={{ position: 'fixed', bottom: 0, right: 0, left: 0, zIndex: 50, background: '#FBF7F2', borderTop: '1px solid rgba(154,45,85,.18)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '8px 4px' }}>
          {[
            { icon: Home, label: 'الرئيسية', page: 'home' as Page },
            { icon: ShoppingBag, label: 'المخاوير', page: 'shop' as Page },
            { icon: Package, label: 'السلة', page: 'cart' as Page, badge: cartCount },
            { icon: Truck, label: 'تتبع', page: 'tracking' as Page },
          ].map(({ icon: Icon, label, page, badge }) => (
            <button key={page} onClick={() => setActiveTab(page)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '4px 12px', background: 'none', border: 'none', cursor: 'pointer', position: 'relative', color: activeTab === page ? '#9A2D55' : '#9a8a85' }}>
              <Icon style={{ width: 20, height: 20 }} />
              <span style={{ fontSize: 10, fontFamily: "'Cairo', sans-serif", fontWeight: activeTab === page ? 600 : 400 }}>{label}</span>
              {badge != null && badge > 0 && (
                <span style={{ position: 'absolute', top: 0, right: 8, background: '#9A2D55', color: '#fff', fontSize: 9, fontWeight: 700, width: 14, height: 14, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          MODALS
      ═══════════════════════════════════════════════════════════ */}

      {/* ── Product Detail Modal ───────────────────────────────── */}
      <AnimatePresence>
        {selectedProduct && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(36,20,25,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 20 }}
            onClick={() => setSelectedProduct(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.97, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }}
              style={{ background: '#FBF7F2', width: '100%', maxWidth: 760, maxHeight: '90vh', overflowY: 'auto', display: 'grid', gridTemplateColumns: '1fr 1fr' }}
              className="md:grid block"
              onClick={e => e.stopPropagation()}>

              {/* Image */}
              <div style={{ position: 'relative', minHeight: 320 }}>
                {selectedProduct.image ? (
                  <img src={selectedProduct.image} alt={selectedProduct.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', minHeight: 320, backgroundImage: PH, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9A2D55', font: '500 12px/1.4 ui-monospace,Menlo,monospace' }}>صورة المنتج</div>
                )}
                <button onClick={() => setSelectedProduct(null)}
                  style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <X style={{ width: 16, height: 16, color: '#241419' }} />
                </button>
                <button onClick={e => toggleWishlist(selectedProduct.id, e)}
                  style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <Heart style={{ width: 14, height: 14, color: '#9A2D55', fill: wishlist.includes(selectedProduct.id) ? '#9A2D55' : 'transparent' }} />
                </button>
              </div>

              {/* Details */}
              <div style={{ padding: '28px 28px', display: 'flex', flexDirection: 'column', gap: 18 }}>
                {/* Breadcrumb */}
                <div style={{ fontSize: 12, color: '#9a8a85' }}>
                  {categories.find(c => c.id === selectedProduct.category)?.name || 'مخور'}
                </div>

                <h2 style={{ fontFamily: "'Amiri', serif", fontSize: 28, color: '#241419', margin: 0, lineHeight: 1.2 }}>{selectedProduct.name}</h2>

                {/* Stars */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} style={{ width: 14, height: 14, fill: i < Math.round(selectedProduct.rating) ? '#B08D57' : 'transparent', color: '#B08D57' }} />
                  ))}
                  <span style={{ fontSize: 12, color: '#9a8a85' }}>({selectedProduct.reviewCount} تقييم)</span>
                </div>

                {/* Price */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontSize: 28, fontWeight: 700, color: '#9A2D55' }}>{selectedProduct.price.toFixed(2)}</span>
                  <span style={{ fontSize: 14, color: '#9A2D55' }}>د.ب</span>
                  {selectedProduct.originalPrice && (
                    <span style={{ fontSize: 14, color: '#9a8a85', textDecoration: 'line-through' }}>{selectedProduct.originalPrice.toFixed(2)} د.ب</span>
                  )}
                </div>

                <p style={{ fontSize: 14, lineHeight: 1.8, color: '#6b5a5f', margin: 0 }}>{selectedProduct.description}</p>

                {/* Size */}
                {selectedProduct.sizes.length > 0 && (
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#241419', marginBottom: 10 }}>المقاس</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {selectedProduct.sizes.map(size => (
                        <button key={size} onClick={() => setChosenSize(size)}
                          style={{ padding: '8px 18px', border: `1px solid ${chosenSize === size ? '#9A2D55' : 'rgba(154,45,85,.25)'}`, borderRadius: 2, background: chosenSize === size ? '#9A2D55' : 'transparent', color: chosenSize === size ? '#fff' : '#241419', fontSize: 13, cursor: 'pointer', fontFamily: "'Cairo', sans-serif" }}>
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Color */}
                {selectedProduct.colors.length > 0 && (
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#241419', marginBottom: 10 }}>اللون: {chosenColor}</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {selectedProduct.colors.map(color => (
                        <button key={color} onClick={() => setChosenColor(color)}
                          style={{ padding: '8px 18px', border: `1px solid ${chosenColor === color ? '#9A2D55' : 'rgba(154,45,85,.25)'}`, borderRadius: 2, background: chosenColor === color ? '#F3EAE2' : 'transparent', color: '#241419', fontSize: 13, cursor: 'pointer', fontFamily: "'Cairo', sans-serif" }}>
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Qty + Add to cart */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid rgba(154,45,85,.3)', borderRadius: 2 }}>
                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))} style={{ width: 36, height: 42, border: 'none', background: 'none', fontSize: 16, color: '#9A2D55', cursor: 'pointer' }}>−</button>
                    <span style={{ width: 36, textAlign: 'center', fontSize: 14, fontWeight: 600 }}>{quantity}</span>
                    <button onClick={() => setQuantity(q => q + 1)} style={{ width: 36, height: 42, border: 'none', background: 'none', fontSize: 16, color: '#9A2D55', cursor: 'pointer' }}>+</button>
                  </div>
                  <button onClick={handleAddToCart} disabled={selectedProduct.stock === 0}
                    style={{ flex: 1, padding: '14px 20px', background: selectedProduct.stock === 0 ? '#9a8a85' : '#9A2D55', color: '#fff', border: 'none', borderRadius: 2, fontSize: 14, fontWeight: 600, cursor: selectedProduct.stock === 0 ? 'not-allowed' : 'pointer', fontFamily: "'Cairo', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <ShoppingBag style={{ width: 16, height: 16 }} />
                    {selectedProduct.stock === 0 ? 'نفدت الكمية' : 'أضيفي للسلة'}
                  </button>
                </div>

                {/* Size guide link */}
                <button onClick={() => setShowSizeGuide('g-1')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9A2D55', fontSize: 12, textDecoration: 'underline', textAlign: 'right', fontFamily: "'Cairo', sans-serif" }}>
                  📏 دليل المقاسات
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Reviews Modal ─────────────────────────────────────── */}
      <AnimatePresence>
        {showReviewsPopup && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(36,20,25,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 20 }}
            onClick={() => setShowReviewsPopup(false)}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ background: '#FBF7F2', width: '100%', maxWidth: 480, padding: 28, maxHeight: '80vh', overflowY: 'auto' }}
              onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid rgba(154,45,85,.14)' }}>
                <div style={{ fontFamily: "'Amiri', serif", fontSize: 22, color: '#241419' }}>آراء زبائن ألماسة</div>
                <button onClick={() => setShowReviewsPopup(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9a8a85' }}>
                  <X style={{ width: 18, height: 18 }} />
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {reviews.map(rev => (
                  <div key={rev.id} style={{ background: '#F3EAE2', padding: '14px 16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <strong style={{ fontSize: 14, color: '#241419' }}>{rev.customerName}</strong>
                      <div style={{ display: 'flex', gap: 2 }}>
                        {Array.from({ length: rev.rating }).map((_, i) => <Star key={i} style={{ width: 12, height: 12, fill: '#B08D57', color: '#B08D57' }} />)}
                      </div>
                    </div>
                    <p style={{ fontSize: 13, color: '#4a3d40', lineHeight: 1.7, margin: 0, fontStyle: 'italic' }}>"{rev.comment}"</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Size Guide Modal ──────────────────────────────────── */}
      <AnimatePresence>
        {showSizeGuide && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(36,20,25,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 20 }}
            onClick={() => setShowSizeGuide(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              style={{ background: '#FBF7F2', width: '100%', maxWidth: 520, padding: 28 }}
              onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 14, borderBottom: '1px solid rgba(154,45,85,.14)' }}>
                <span style={{ fontFamily: "'Amiri', serif", fontSize: 20, color: '#9A2D55' }}>{sizeGuides.find(g => g.id === showSizeGuide)?.name || 'دليل المقاسات'}</span>
                <button onClick={() => setShowSizeGuide(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9a8a85' }}>
                  <X style={{ width: 18, height: 18 }} />
                </button>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', fontSize: 12, textAlign: 'right', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#F3EAE2', color: '#9A2D55' }}>
                      {['المقاس', 'الصدر', 'الطول', 'الخصر', 'الكم'].map(h => (
                        <th key={h} style={{ padding: '10px 12px', border: '1px solid rgba(154,45,85,.14)', fontWeight: 700 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sizeGuides.find(g => g.id === showSizeGuide)?.sizes.map((row, idx) => (
                      <tr key={idx} style={{ background: idx % 2 === 0 ? '#FBF7F2' : '#F3EAE2' }}>
                        <td style={{ padding: '10px 12px', border: '1px solid rgba(154,45,85,.14)', fontWeight: 700, color: '#9A2D55' }}>{row.label}</td>
                        <td style={{ padding: '10px 12px', border: '1px solid rgba(154,45,85,.14)', color: '#4a3d40' }}>{row.chest}</td>
                        <td style={{ padding: '10px 12px', border: '1px solid rgba(154,45,85,.14)', color: '#4a3d40' }}>{row.length}</td>
                        <td style={{ padding: '10px 12px', border: '1px solid rgba(154,45,85,.14)', color: '#4a3d40' }}>{row.waist}</td>
                        <td style={{ padding: '10px 12px', border: '1px solid rgba(154,45,85,.14)', color: '#4a3d40' }}>{row.sleeve}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p style={{ fontSize: 11, color: '#9a8a85', marginTop: 14, lineHeight: 1.6 }}>* القياسات بالبوصة (Inches). للتفصيل بمقاسات خاصة راسليننا على واتساب.</p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
