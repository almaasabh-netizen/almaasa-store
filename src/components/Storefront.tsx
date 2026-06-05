import React, { useState, useEffect, useRef } from 'react';
import {
  ShoppingBag, Search, Truck, Heart, ArrowRight, CheckCircle,
  Clock, Check, BookOpen, X, Phone, MapPin, Tag, Plus, Minus,
  Star, ExternalLink, ShieldCheck, CreditCard, ChevronRight,
  Share2, Home, Grid3X3, User, Menu, ChevronDown, ChevronLeft,
  Instagram, Sparkles, Package, Gift, Zap, Globe2, BadgeCheck,
  Eye, ZoomIn
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, Order, Coupon, SizeGuide, Review, StoreSettings, OrderItem, Category } from '../types';
import { getStoredData, saveStoredData, addOperationLog } from '../data';

interface StorefrontProps {
  onNavigateToAdmin: () => void;
  activeTab: 'shop' | 'tracking';
  setActiveTab: (tab: 'shop' | 'tracking') => void;
}

// ─── TOAST NOTIFICATION ───────────────────────────────────────────
interface Toast { id: number; msg: string; type: 'success' | 'info' | 'error'; }

export default function Storefront({ onNavigateToAdmin, activeTab, setActiveTab }: StorefrontProps) {
  /* ── DATA STATE ───────────────────────────────────────────────── */
  const [products, setProducts] = useState<Product[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [sizeGuides, setSizeGuides] = useState<SizeGuide[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  /* ── UI STATE ─────────────────────────────────────────────────── */
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showSizeGuide, setShowSizeGuide] = useState<string | null>(null);
  const [showReviewsPopup, setShowReviewsPopup] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [showWishlist, setShowWishlist] = useState(false);
  const [showReturnPolicy, setShowReturnPolicy] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);

  /* ── PRODUCT OPTIONS ─────────────────────────────────────────── */
  const [chosenSize, setChosenSize] = useState('');
  const [chosenColor, setChosenColor] = useState('');
  const [quantity, setQuantity] = useState(1);

  /* ── CART STATE ──────────────────────────────────────────────── */
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [activeCoupon, setActiveCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState('');

  /* ── CHECKOUT ────────────────────────────────────────────────── */
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
  const [benefitStep, setBenefitStep] = useState<'input' | 'processing' | 'approved'>('input');
  const [knetCardNum, setKnetCardNum] = useState('');
  const [knetPin, setKnetPin] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [isPaying, setIsPaying] = useState(false);
  const [newOrder, setNewOrder] = useState<Order | null>(null);

  /* ── TRACKING ────────────────────────────────────────────────── */
  const [trackSearchQuery, setTrackSearchQuery] = useState('');
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);
  const [trackError, setTrackError] = useState('');

  /* ── EFFECTS ─────────────────────────────────────────────────── */
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
      catch (e) { console.error(e); }
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

    // wishlist
    const saved = localStorage.getItem('ama_wishlist');
    if (saved) { try { setWishlist(JSON.parse(saved)); } catch (e) {} }
  }, [activeTab]);

  // scroll detection
  useEffect(() => {
    const fn = () => setIsScrolled(window.scrollY > 60);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  // shipping method sync
  const matchingZone = shippingZones.find(z =>
    z.countries.some((c: string) => c.includes(customerCountry) || customerCountry.includes(c))
  ) || shippingZones[0];
  const availableShippingMethods = matchingZone ? matchingZone.methods : [];

  useEffect(() => {
    if (availableShippingMethods?.length > 0) setSelectedShippingMethod(availableShippingMethods[0]);
    else setSelectedShippingMethod(null);
  }, [customerCountry, shippingZones]);

  /* ── TOAST HELPER ────────────────────────────────────────────── */
  const addToast = (msg: string, type: Toast['type'] = 'success') => {
    const id = ++toastId.current;
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3200);
  };

  /* ── WISHLIST ────────────────────────────────────────────────── */
  const toggleWishlist = (productId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setWishlist(prev => {
      const next = prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId];
      localStorage.setItem('ama_wishlist', JSON.stringify(next));
      addToast(prev.includes(productId) ? 'تمت الإزالة من المفضلة' : 'أُضيف إلى المفضلة ❤️', 'info');
      return next;
    });
  };

  /* ── PRODUCT HANDLERS ───────────────────────────────────────── */
  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setChosenSize(product.sizes[0] || 'M');
    setChosenColor(product.colors[0] || 'وردي فاتح');
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
    setIsCartOpen(true);
    setSelectedProduct(null);
    addToast(`تمت إضافة "${selectedProduct.name}" للسلة 🛍️`);
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
    if (found) { setActiveCoupon(found); addToast(`✓ كوبون ${found.code} مفعّل!`); }
    else { setCouponError('الكوبون غير فعال أو غير صحيح.'); setActiveCoupon(null); }
  };

  /* ── CALCULATIONS ────────────────────────────────────────────── */
  const calculatedSubtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const calculatedDiscount = activeCoupon
    ? activeCoupon.type === 'percentage' ? calculatedSubtotal * activeCoupon.discount / 100 : activeCoupon.discount
    : 0;
  const shippingCharge = selectedShippingMethod
    ? selectedShippingMethod.priceType === 'free' ? 0 : parseFloat(selectedShippingMethod.price)
    : settings ? (calculatedSubtotal >= settings.freeShippingThreshold ? 0 : settings.shippingCost) : 2.5;
  const totalCost = Math.max(0, calculatedSubtotal - calculatedDiscount + shippingCharge);

  /* ── PAYMENT ─────────────────────────────────────────────────── */
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

  /* ── TRACKING ────────────────────────────────────────────────── */
  const handleTrackSearch = () => {
    setTrackError(''); setTrackedOrder(null);
    if (!trackSearchQuery.trim()) return;
    const { orders } = getStoredData();
    const q = trackSearchQuery.trim().toLowerCase();
    const matched = orders.find((o: Order) =>
      o.trackingCode.toLowerCase() === q || o.customer.phone.replace(/[\s+]/g, '').includes(q.replace(/[\s+]/g, ''))
    );
    matched ? setTrackedOrder(matched) : setTrackError('لم نجد طلبًا بهذا الرقم أو الهاتف. يرجى التحقق والمحاولة مجدداً.');
  };

  /* ── FILTER ──────────────────────────────────────────────────── */
  const filteredProducts = products.filter(p => {
    if (p.isDraft) return false; // لا تعرض المسودات للعملاء
    const cat = selectedCategory === 'all' || p.category === selectedCategory;
    const q = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return cat && q;
  });

  /* ══════════════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════════════ */
  return (
    <div className="bg-[#FDF8F5] min-h-screen text-[#2C1810] font-sans has-bottom-nav" dir="rtl" id="almaasa-storefront">

      {/* ── TOASTS ──────────────────────────────────────────────── */}
      <div className="fixed top-4 left-4 z-[100] space-y-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div key={t.id}
              initial={{ x: -80, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -80, opacity: 0 }}
              className={`toast-enter px-4 py-3 rounded-2xl shadow-xl text-white text-xs font-bold max-w-xs pointer-events-auto ${
                t.type === 'success' ? 'bg-[#9A2D55]' : t.type === 'info' ? 'bg-[#C4956A]' : 'bg-red-500'
              }`}
            >{t.msg}</motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ── 1. ANNOUNCEMENT BAR ──────────────────────────────────── */}
      <div style={{ background: 'linear-gradient(90deg, #9A2D55 0%, #6B1E3A 50%, #9A2D55 100%)' }} className="text-white py-2 px-4 overflow-hidden">
        <div className="flex items-center justify-center gap-6 text-[11px] font-bold tracking-wide whitespace-nowrap">
          <span className="flex items-center gap-1.5">✨ مخاوير العيد وصلت! تسوّقي الآن</span>
          <span className="text-[#E8D5C4] text-[8px]">◆</span>
          <span className="flex items-center gap-1.5">🌍 توصيل دولي سريع لجميع دول الخليج والعالم</span>
          <span className="text-[#E8D5C4] text-[8px]">◆</span>
          <span className="flex items-center gap-1.5">🎁 شحن مجاني للطلبات فوق 50 د.ب</span>
          <span className="text-[#E8D5C4] text-[8px] hidden md:inline">◆</span>
          <button onClick={onNavigateToAdmin} className="opacity-20 hover:opacity-60 text-[10px] transition-opacity hidden md:inline">إدارة المتجر</button>
        </div>
      </div>

      {/* ── 2. HEADER ────────────────────────────────────────────── */}
      <header className={`sticky top-0 z-40 transition-all duration-300 ${isScrolled ? 'bg-white/98 backdrop-blur-lg shadow-lg border-b border-[#F2E4DC]' : 'bg-white/95 backdrop-blur-sm border-b border-[#F2E4DC]'}`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-[4.5rem]">

            {/* Desktop: Logo first + Nav (RTL = right side) */}
            <div className="hidden md:flex items-center gap-1">
              <button onClick={() => { setActiveTab('shop'); setSelectedCategory('all'); }} className="flex items-center ml-2">
                <img src="/logo.jpg" alt="ألماسة" className="h-11 w-auto object-contain" />
              </button>
              <div className="w-px h-6 bg-[#F2E4DC] mx-2" />
              <nav className="flex items-center gap-3">
                {/* الكل */}
                <button onClick={() => { setActiveTab('shop'); setSelectedCategory('all'); document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' }); }}
                  className="flex flex-col items-center gap-1 group">
                  <div className={`w-10 h-10 rounded-full p-0.5 transition-all ${selectedCategory === 'all' && activeTab === 'shop' ? 'bg-gradient-to-tr from-[#9A2D55] to-[#C4956A]' : 'bg-[#F2E4DC] group-hover:bg-gradient-to-tr group-hover:from-[#9A2D55] group-hover:to-[#C4956A]'}`}>
                    <div className={`w-full h-full rounded-full flex items-center justify-center text-[10px] font-black ${selectedCategory === 'all' && activeTab === 'shop' ? 'bg-[#FDF8F5] text-[#9A2D55]' : 'bg-white text-[#8B7B78]'}`}>الكل</div>
                  </div>
                </button>
                {/* Categories */}
                {categories.filter(c => c.id !== 'all').slice(0, 5).map(cat => (
                  <button key={cat.id} onClick={() => { setActiveTab('shop'); setSelectedCategory(cat.id); document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' }); }}
                    className="flex flex-col items-center gap-1 group">
                    <div className={`w-10 h-10 rounded-full p-0.5 transition-all ${selectedCategory === cat.id && activeTab === 'shop' ? 'bg-gradient-to-tr from-[#9A2D55] to-[#C4956A]' : 'bg-[#F2E4DC] group-hover:bg-gradient-to-tr group-hover:from-[#9A2D55] group-hover:to-[#C4956A]'}`}>
                      <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-sm">⚜️</div>
                    </div>
                    <span className={`text-[9px] font-bold text-center leading-tight max-w-[44px] line-clamp-1 ${selectedCategory === cat.id && activeTab === 'shop' ? 'text-[#9A2D55]' : 'text-[#8B7B78]'}`}>{cat.name}</span>
                  </button>
                ))}
                {/* تتبع طلبي */}
                <button onClick={() => setActiveTab('tracking')} className="flex flex-col items-center gap-1 group">
                  <div className={`w-10 h-10 rounded-full p-0.5 transition-all ${activeTab === 'tracking' ? 'bg-gradient-to-tr from-[#9A2D55] to-[#C4956A]' : 'bg-[#F2E4DC] group-hover:bg-gradient-to-tr group-hover:from-[#9A2D55] group-hover:to-[#C4956A]'}`}>
                    <div className={`w-full h-full rounded-full flex items-center justify-center ${activeTab === 'tracking' ? 'bg-[#FDF8F5]' : 'bg-white'}`}>
                      <Truck className={`w-4 h-4 ${activeTab === 'tracking' ? 'text-[#9A2D55]' : 'text-[#8B7B78]'}`} />
                    </div>
                  </div>
                  <span className={`text-[9px] font-bold ${activeTab === 'tracking' ? 'text-[#9A2D55]' : 'text-[#8B7B78]'}`}>تتبع</span>
                </button>
              </nav>
            </div>

            {/* Mobile: logo + hamburger */}
            <div className="flex md:hidden items-center gap-2">
              <button onClick={() => { setActiveTab('shop'); setSelectedCategory('all'); }}>
                <img src="/logo.jpg" alt="ألماسة" className="h-10 w-auto object-contain" />
              </button>
              <button className="p-2 text-[#9A2D55] hover:bg-[#F8EDE8] rounded-xl transition-colors" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                <Menu className="w-5 h-5" />
              </button>
            </div>

            {/* Actions - left */}
            <div className="flex items-center gap-0.5 md:gap-1">
              <button className="p-2 text-[#5C3830] hover:text-[#9A2D55] hover:bg-[#F8EDE8] rounded-xl transition-all hidden md:flex" onClick={() => setSearchQuery('')}>
                <Search className="w-4.5 h-4.5" />
              </button>
              <button className="p-2 text-[#5C3830] hover:text-[#9A2D55] hover:bg-[#F8EDE8] rounded-xl transition-all hidden md:flex relative" onClick={() => setShowReviewsPopup(true)}>
                <Star className="w-4.5 h-4.5" />
              </button>
              <button className="p-2 text-[#5C3830] hover:text-[#9A2D55] hover:bg-[#F8EDE8] rounded-xl transition-all relative" onClick={() => setIsCartOpen(true)}>
                <ShoppingBag className="w-5 h-5" />
                {cart.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-[#9A2D55] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                    {cart.reduce((s, i) => s + i.quantity, 0)}
                  </span>
                )}
              </button>
              <button className="p-2 text-[#5C3830] hover:text-[#9A2D55] hover:bg-[#F8EDE8] rounded-xl transition-all relative" onClick={() => setShowWishlist(true)}>
                <Heart className={`w-5 h-5 ${wishlist.length > 0 ? 'fill-[#9A2D55] text-[#9A2D55]' : ''}`} />
                {wishlist.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-[#C4956A] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                    {wishlist.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Nav Dropdown */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                className="md:hidden border-t border-[#F2E4DC] overflow-hidden bg-white">
                <div className="py-4 space-y-2 px-2">
                  {[
                    { label: 'الرئيسية', action: () => { setActiveTab('shop'); setSelectedCategory('all'); setMobileMenuOpen(false); } },
                    ...categories.filter(c => c.id !== 'all').map(cat => ({
                      label: cat.name,
                      action: () => { setActiveTab('shop'); setSelectedCategory(cat.id); setMobileMenuOpen(false); }
                    })),
                    { label: 'تتبع الطلب ✈️', action: () => { setActiveTab('tracking'); setMobileMenuOpen(false); } },
                    { label: 'آراء الزبائن ⭐', action: () => { setShowReviewsPopup(true); setMobileMenuOpen(false); } },
                  ].map((item, i) => (
                    <button key={i} onClick={item.action} className="w-full text-right py-2.5 px-4 rounded-xl text-sm font-semibold text-[#5C3830] hover:bg-[#F8EDE8] hover:text-[#9A2D55] transition-colors">
                      {item.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* ── MAIN CONTENT ─────────────────────────────────────────── */}
      {activeTab === 'shop' && (
        <main>

          {/* ── 3. HERO SECTION ─────────────────────────────────── */}
          <section className="relative overflow-hidden" dir="rtl"
            style={{ background: 'linear-gradient(160deg,#3B0D20 0%,#6B1E3A 45%,#9A2D55 100%)' }}>

            {/* Subtle pattern overlay */}
            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage: 'radial-gradient(circle at 20% 80%,#C4956A 0%,transparent 50%), radial-gradient(circle at 80% 20%,#F2E4DC 0%,transparent 50%)' }} />

            <div className="relative z-10 max-w-6xl mx-auto px-5 md:px-10 py-12 md:py-16">

              {/* ── WELCOME badge ── */}
              <div className="flex justify-center mb-6">
                <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/90 text-[11px] font-bold px-4 py-2 rounded-full backdrop-blur-sm">
                  <Sparkles className="w-3 h-3 text-[#C4956A]" />
                  أهلاً وسهلاً في بوتيك ألماسة ✦
                </div>
              </div>

              {/* ── MAIN TEXT centered ── */}
              <div className="text-center mb-8">
                <h1 className="text-4xl md:text-[3.4rem] lg:text-6xl font-black text-white leading-[1.15] mb-4" style={{ fontFamily: "'Cairo', serif" }}>
                  ذوقك الرفيع
                  <br />
                  <span style={{ color: '#E8C4A0' }}>يستحق الأفضل</span>
                </h1>
                <p className="text-white/70 text-sm md:text-base leading-relaxed max-w-lg mx-auto font-medium">
                  اكتشفي أرقى تشكيلات المخاوير والجلابيات الفاخرة — مصمّمة بعناية لتُبهر في كل مناسبة
                </p>
              </div>

              {/* ── CTA BUTTONS centered ── */}
              <div className="flex flex-wrap gap-3 justify-center mb-10">
                <button onClick={() => document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="flex items-center gap-2 font-bold text-sm px-8 py-3.5 rounded-full transition-all hover:scale-105 active:scale-95"
                  style={{ background: 'linear-gradient(135deg,#C4956A,#A07040)', color: 'white', boxShadow: '0 8px 28px rgba(196,149,106,0.45)' }}>
                  تسوّقي الآن
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={() => document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="flex items-center gap-2 text-white font-semibold text-sm px-8 py-3.5 rounded-full border border-white/30 hover:bg-white/10 backdrop-blur-sm transition-all">
                  عرض التشكيلة
                </button>
              </div>

              {/* ── PRODUCT IMAGES strip ── */}
              {products.filter(p=>!p.isDraft).length > 0 && (
                <div className="flex gap-3 justify-center items-end overflow-hidden">
                  {products.filter(p=>!p.isDraft).slice(0,4).map((p, i) => (
                    <button key={p.id} onClick={() => setSelectedProduct(p)}
                      className={`relative rounded-2xl overflow-hidden flex-shrink-0 transition-all hover:scale-105 cursor-pointer shadow-2xl ${
                        i === 1 || i === 2 ? 'w-[22vw] max-w-[130px] h-[28vw] max-h-[168px]' : 'w-[18vw] max-w-[108px] h-[23vw] max-h-[138px] opacity-80'
                      }`}
                      style={{ border: '2px solid rgba(255,255,255,0.25)' }}>
                      <img src={p.image} alt={p.name} referrerPolicy="no-referrer"
                        className="w-full h-full object-cover object-top" />
                      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top,rgba(30,10,5,0.6) 0%,transparent 55%)' }} />
                      <p className="absolute bottom-1.5 right-2 left-2 text-white text-[9px] font-bold truncate text-right">{p.price.toFixed(2)} د.ب</p>
                    </button>
                  ))}
                </div>
              )}

              {/* ── STATS strip ── */}
              <div className="flex justify-center gap-8 mt-8 pt-6 border-t border-white/10">
                {[
                  { num: '500+', label: 'عميلة راضية' },
                  { num: '4.9 ⭐', label: 'تقييم متوسط' },
                  { num: '🚚', label: 'توصيل للخليج والعالم' },
                ].map(({ num, label }) => (
                  <div key={label} className="text-center">
                    <p className="text-white font-black text-lg leading-none">{num}</p>
                    <p className="text-white/50 text-[10px] font-medium mt-0.5">{label}</p>
                  </div>
                ))}
              </div>

            </div>
          </section>

          {/* ── 4. TRUST BADGES ─────────────────────────────────── */}
          <div className="border-b border-[#F2E4DC] bg-white">
            <div className="max-w-7xl mx-auto px-4 py-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                {[
                  { icon: Globe2, label: 'شحن لجميع الدول', sub: 'دول الخليج والعالم' },
                  { icon: BadgeCheck, label: 'جودة فاخرة', sub: 'أقمشة مختارة بعناية' },
                  { icon: ShieldCheck, label: 'دفع آمن 100%', sub: 'مشفر ومحمي' },
                  { icon: Gift, label: 'تغليف هدايا', sub: 'مجاني مع كل طلب' },
                ].map(({ icon: Icon, label, sub }) => (
                  <div key={label} className="flex items-center gap-2.5 justify-center md:justify-start">
                    <div className="w-8 h-8 bg-[#F8EDE8] rounded-xl flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-[#9A2D55]" />
                    </div>
                    <div className="text-right hidden sm:block">
                      <p className="text-xs font-bold text-[#2C1810]">{label}</p>
                      <p className="text-[10px] text-[#8B7B78]">{sub}</p>
                    </div>
                    <span className="sm:hidden text-xs font-bold text-[#2C1810]">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>


          {/* ── 5. SEARCH + FILTER BAR ──────────────────────────── */}
          <div className="max-w-7xl mx-auto px-4 pb-6">
            <div className="bg-white rounded-2xl border border-[#F2E4DC] shadow-sm p-3 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute right-3.5 top-3 w-4 h-4 text-[#C4956A]" />
                <input type="text" placeholder="ابحثي عن مخورك المفضل..."
                  value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-[#FDF8F5] border border-[#F2E4DC] text-[#2C1810] rounded-xl pr-10 pl-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-[#9A2D55] focus:bg-white transition-all"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute left-3 top-3 text-[#8B7B78] hover:text-[#9A2D55]">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              {/* Category filter tabs */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                <button onClick={() => setSelectedCategory('all')}
                  className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${selectedCategory === 'all' ? 'bg-[#9A2D55] text-white' : 'bg-[#F8EDE8] text-[#8B7B78] hover:text-[#9A2D55]'}`}>
                  الكل ({products.length})
                </button>
                {categories.filter(c => c.id !== 'all').map(cat => (
                  <button key={cat.id} onClick={() => setSelectedCategory(cat.id)}
                    className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${selectedCategory === cat.id ? 'bg-[#9A2D55] text-white' : 'bg-[#F8EDE8] text-[#8B7B78] hover:text-[#9A2D55]'}`}>
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── 6. PRODUCTS SECTION ─────────────────────────────── */}
          <section id="products-section" className="max-w-7xl mx-auto px-4 pb-16">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-[#C4956A] text-xs font-bold tracking-widest uppercase mb-1">كولكشن 2026</p>
                <h2 className="text-2xl font-black text-[#2C1810]">
                  {selectedCategory === 'all' ? 'الأكثر مبيعاً' : categories.find(c => c.id === selectedCategory)?.name}
                </h2>
              </div>
              <span className="text-xs text-[#8B7B78] font-medium bg-[#F8EDE8] px-3 py-1.5 rounded-xl">
                {filteredProducts.length} منتج
              </span>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="bg-white border border-[#F2E4DC] rounded-3xl p-16 text-center">
                <ShoppingBag className="w-12 h-12 text-[#F2E4DC] mx-auto mb-4" />
                <p className="text-lg font-bold text-[#2C1810] mb-2">لا توجد منتجات مطابقة</p>
                <p className="text-[#8B7B78] text-sm mb-5">جربي البحث بكلمات مختلفة أو تصفحي جميع الأقسام</p>
                <button onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
                  className="bg-[#9A2D55] text-white font-bold px-6 py-2.5 rounded-full text-sm hover:bg-[#802446] transition-all">
                  عرض جميع المخاوير
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-5">
                {filteredProducts.map((product, idx) => (
                  <div key={product.id} className="bg-white rounded-2xl border border-[#F2E4DC] overflow-hidden luxury-card group cursor-pointer flex flex-col shadow-sm hover:shadow-xl hover:shadow-[#9A2D55]/10 hover:border-[#E8D5C4] transition-all"
                    style={{ animationDelay: `${idx * 0.05}s` }}>

                    {/* Image */}
                    <div className="relative overflow-hidden bg-[#F8EDE8]" style={{ aspectRatio: '3/4' }}>
                      <img src={product.image} alt={product.name} referrerPolicy="no-referrer"
                        loading="lazy"
                        onClick={() => handleProductClick(product)}
                        className="w-full h-full object-cover product-img"
                      />

                      {/* Badges top-right */}
                      <div className="absolute top-2.5 right-2.5 flex flex-col gap-1">
                        {product.originalPrice && (
                          <span className="bg-[#9A2D55] text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-sm">
                            -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                          </span>
                        )}
                        {product.hasSheilah && (
                          <span className="bg-[#2C1810]/80 text-[#E8D5C4] text-[8px] font-bold px-2 py-0.5 rounded-full">+ شيلة</span>
                        )}
                        {idx < 3 && !product.originalPrice && (
                          <span className="bg-[#C4956A] text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-sm">جديد</span>
                        )}
                      </div>

                      {/* Wishlist */}
                      <button
                        onClick={e => toggleWishlist(product.id, e)}
                        className={`absolute top-2.5 left-2.5 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all hover:scale-110 ${
                          wishlist.includes(product.id) ? 'bg-[#9A2D55]' : 'bg-white/90 hover:bg-white'
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 transition-all ${wishlist.includes(product.id) ? 'fill-white text-white' : 'text-[#8B7B78]'}`} />
                      </button>

                      {/* Out of stock overlay */}
                      {product.stock === 0 && (
                        <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] flex items-center justify-center">
                          <span className="text-[#9A2D55] font-black text-sm bg-white border border-[#F2E4DC] px-4 py-2 rounded-full shadow-sm">نفدت الكمية</span>
                        </div>
                      )}

                      {/* Low stock */}
                      {product.stock > 0 && product.stock <= 5 && (
                        <div className="absolute bottom-3 right-2.5">
                          <span className="bg-amber-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                            {product.stock} فقط!
                          </span>
                        </div>
                      )}

                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#2C1810]/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                        <button
                          onClick={() => handleProductClick(product)}
                          className="w-full bg-white text-[#9A2D55] font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          عرض التفاصيل
                        </button>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-3 flex-1 flex flex-col justify-between" onClick={() => handleProductClick(product)}>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-0.5">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span className="text-[10px] font-bold text-[#5C3830]">{product.rating}</span>
                            <span className="text-[9px] text-[#8B7B78]">({product.reviewCount})</span>
                          </div>
                          <span className="text-[9px] bg-[#F8EDE8] text-[#9A2D55] font-bold px-1.5 py-0.5 rounded-full">
                            {categories.find(c => c.id === product.category)?.name || 'مخور'}
                          </span>
                        </div>
                        <h3 className="font-bold text-[#2C1810] text-xs md:text-sm leading-snug line-clamp-2 group-hover:text-[#9A2D55] transition-colors">
                          {product.name}
                        </h3>
                      </div>

                      <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-[#F8EDE8]">
                        <div className="leading-tight">
                          <span className="text-[#9A2D55] font-black text-base">{product.price.toFixed(2)}</span>
                          <span className="text-[#9A2D55] text-[10px] font-semibold mr-0.5">د.ب</span>
                          {product.originalPrice && (
                            <div className="text-[#8B7B78] text-[10px] line-through">{product.originalPrice.toFixed(2)} د.ب</div>
                          )}
                        </div>
                        <button
                          onClick={e => { e.stopPropagation(); handleProductClick(product); setIsCartOpen(true); }}
                          className="w-8 h-8 bg-[#9A2D55] hover:bg-[#802446] text-white rounded-full flex items-center justify-center shadow-sm transition-all hover:scale-110 disabled:bg-[#F2E4DC]"
                          disabled={product.stock === 0}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ── 7. REVIEWS SECTION ──────────────────────────────── */}
          <section className="py-16 px-4 bg-[#2C1810]">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-10 gap-4">
                <div>
                  <p className="text-[#C4956A] text-xs font-bold tracking-widest uppercase mb-2">آراء العملاء</p>
                  <h2 className="text-2xl md:text-3xl font-black text-white">ماذا تقول زبائننا؟</h2>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex">
                    {[5,5,5,5,4].map((r,i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                  </div>
                  <span className="text-white/70 text-sm font-medium">4.9 من 5 — بناءً على {reviews.length || 120}+ تقييم</span>
                </div>
              </div>

              {reviews.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {reviews.slice(0, 3).map(rev => (
                    <div key={rev.id} className="bg-white/6 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all group">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-white/20'}`} />
                          ))}
                        </div>
                        <span className="text-[10px] text-white/30 font-mono">{rev.date?.substring(0,10) || '2026'}</span>
                      </div>
                      <p className="text-[#E8D5C4] text-sm leading-relaxed font-medium mb-5 italic line-clamp-2">"{rev.comment}"</p>
                      <div className="flex items-center gap-3 border-t border-white/5 pt-4">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#9A2D55] to-[#C4956A] flex items-center justify-center text-white font-black text-sm shrink-0">
                          {rev.customerName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-white font-bold text-sm">{rev.customerName}</p>
                          <p className="text-[#8B7B78] text-[10px] line-clamp-1">{rev.productName}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Placeholder reviews when none exist */
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { name: 'فاطمة ع.', comment: 'مخور رائع جداً، الخامة فاخرة والتطريز دقيق جداً. وصل بالوقت المحدد وكان في تغليف جميل.', rating: 5 },
                    { name: 'نورة م.', comment: 'اشتريت طقم الأم والبنت وكان خيالي! الجودة ممتازة والتطريز يدوي احترافي. راضية 100%.', rating: 5 },
                    { name: 'منى ك.', comment: 'تجربة تسوق رائعة من البداية للنهاية. الموقع سهل والتوصيل سريع والمنتج تجاوز توقعاتي.', rating: 5 },
                  ].map((rev, i) => (
                    <div key={i} className="bg-white/6 border border-white/10 rounded-2xl p-5">
                      <div className="flex gap-0.5 mb-4">
                        {Array.from({length:5}).map((_,j) => <Star key={j} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}
                      </div>
                      <p className="text-[#E8D5C4] text-sm leading-relaxed font-medium mb-5 italic">"{rev.comment}"</p>
                      <div className="flex items-center gap-3 border-t border-white/5 pt-4">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#9A2D55] to-[#C4956A] flex items-center justify-center text-white font-black text-sm shrink-0">
                          {rev.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-white font-bold text-sm">{rev.name}</p>
                          <p className="text-[#8B7B78] text-[10px]">عميلة موثوقة ✓</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="text-center mt-8">
                <button onClick={() => setShowReviewsPopup(true)}
                  className="border border-[#C4956A]/40 text-[#C4956A] hover:bg-[#C4956A]/10 font-bold px-8 py-3 rounded-full text-sm transition-all">
                  عرض جميع التقييمات ({reviews.length || 120}+)
                </button>
              </div>
            </div>
          </section>

          {/* ── 8. FEATURES BAR ─────────────────────────────────── */}
          <section className="py-10 px-4 bg-white border-y border-[#F2E4DC]">
            <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-5">
              {[
                { icon: Globe2,     title: 'شحن دولي سريع',    desc: 'لجميع دول الخليج والعالم',   color: 'bg-blue-50 text-blue-600' },
                { icon: BadgeCheck, title: 'جودة مضمونة',      desc: 'أقمشة فاخرة مختارة بعناية', color: 'bg-emerald-50 text-emerald-600' },
                { icon: ShieldCheck,title: 'دفع آمن 100%',     desc: 'BenefitPay, KNet, Visa',    color: 'bg-amber-50 text-amber-600' },
                { icon: Gift,       title: 'تغليف هدايا',      desc: 'مجاني مع كل طلب',           color: 'bg-[#F8EDE8] text-[#9A2D55]' },
              ].map(({ icon: Icon, title, desc, color }) => (
                <div key={title} className="flex items-center gap-3 p-4 rounded-2xl bg-[#FDF8F5] border border-[#F2E4DC] hover:border-[#9A2D55]/20 transition-all">
                  <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center shrink-0`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-black text-[#2C1810] text-sm">{title}</p>
                    <p className="text-[#8B7B78] text-[11px] mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── 9. INSTAGRAM FEED ───────────────────────────────── */}
          <section className="py-14 px-4 bg-white">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 text-[#9A2D55] text-xs font-bold mb-2">
                  <Instagram className="w-4 h-4" />
                  <span>تابعينا على إنستقرام</span>
                </div>
                <h2 className="text-2xl font-black text-[#2C1810]">@almaasa.bh</h2>
                <p className="text-[#8B7B78] text-sm mt-1">أحدث تصاميمنا وكولكشناتنا الجديدة</p>
              </div>
              <behold-widget feed-id="HbcZC4oN0hh4xfAHUvTm"></behold-widget>
              <script
                dangerouslySetInnerHTML={{
                  __html: `(() => { const d=document,s=d.createElement("script");s.type="module";s.src="https://w.behold.so/widget.js";d.head.append(s); })();`
                }}
              />
            </div>
          </section>

          {/* ── 10. WHATSAPP JOIN SECTION ───────────────────────── */}
          <section className="py-14 px-4 bg-[#FDF8F5]">
            <div className="max-w-4xl mx-auto">
              {/* Main CTA card */}
              <div className="relative rounded-3xl overflow-hidden p-8 md:p-12 text-center"
                style={{ background: 'linear-gradient(135deg, #FDF0F5 0%, #F8E8EE 50%, #F5E0E8 100%)' }}>
                {/* Decorative blobs */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-[#9A2D55]/8 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-56 h-56 bg-[#C4956A]/10 rounded-full blur-3xl" />
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 bg-white border border-[#F2E4DC] shadow-sm text-[#9A2D55] text-xs font-bold px-4 py-2 rounded-full mb-5">
                    <Gift className="w-3.5 h-3.5" />
                    انضمي لعائلة ألماسة
                  </div>
                  <h2 className="text-2xl md:text-4xl font-black text-[#2C1810] mb-3 leading-tight">
                    اطلعي على جديدنا أولاً
                  </h2>
                  <p className="text-[#8B7B78] text-sm mb-8 max-w-md mx-auto">خصومات حصرية وتصاميم جديدة قبل الإعلان الرسمي — نرد خلال دقائق 24/7</p>
                  <div className="flex flex-wrap gap-3 justify-center">
                    <a href="https://wa.me/97337037697" target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-2 bg-[#9A2D55] hover:bg-[#802446] text-white font-black px-8 py-4 rounded-full shadow-xl shadow-[#9A2D55]/25 transition-all hover:-translate-y-1 text-sm">
                      <Phone className="w-4 h-4" />
                      تواصلي على واتساب
                    </a>
                    <a href="https://instagram.com/almaasa.bh" target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-2 bg-white border border-[#F2E4DC] text-[#9A2D55] hover:border-[#9A2D55] font-bold px-8 py-4 rounded-full transition-all hover:-translate-y-1 text-sm shadow-sm">
                      <Instagram className="w-4 h-4" />
                      تابعينا على إنستقرام
                    </a>
                  </div>
                  <p className="text-[11px] text-[#8B7B78] mt-4 font-mono">+973 37037697</p>
                </div>
              </div>

              {/* 3 perks */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
                {[
                  { icon: Gift, title: 'خصومات حصرية', desc: 'عروض خاصة للأعضاء على المخاوير والأقمشة', color: 'bg-rose-50 text-rose-500' },
                  { icon: Sparkles, title: 'الجديد أولاً', desc: 'تصاميم جديدة قبل الإعلان الرسمي', color: 'bg-amber-50 text-amber-500' },
                  { icon: BadgeCheck, title: 'مزايا العضوية', desc: 'نقاط مكافآت وهدايا مع كل طلب', color: 'bg-emerald-50 text-emerald-500' },
                ].map(({ icon: Icon, title, desc, color }) => (
                  <div key={title} className="bg-white rounded-2xl p-5 border border-[#F2E4DC] flex gap-4 items-start shadow-sm hover:shadow-md transition-shadow">
                    <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center shrink-0`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-black text-[#2C1810] text-sm">{title}</p>
                      <p className="text-[#8B7B78] text-xs mt-0.5 leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── FAQ SECTION ─────────────────────────────────────── */}
          {(() => {
            const faqs = [
              { q: 'كيف يمكنني تتبع طلبي؟', a: 'بعد إتمام الطلب ستصلك رسالة برقم التتبع. يمكنك أيضاً تتبع طلبك من قسم "تتبع طلبي" في الموقع.' },
              { q: 'ما هي مناطق الشحن المتاحة؟', a: 'نشحن لجميع دول الخليج العربي (البحرين، السعودية، الكويت، الإمارات، قطر، عُمان) وكثير من دول العالم.' },
              { q: 'كم يستغرق الشحن؟', a: 'داخل البحرين: 1-2 يوم عمل. دول الخليج: 3-5 أيام. الدول الأخرى: 7-14 يوم عمل.' },
              { q: 'هل يمكنني إرجاع المنتج؟', a: 'نعم، نقبل الإرجاع خلال 7 أيام من تاريخ الاستلام شريطة أن يكون المنتج بحالته الأصلية غير مستخدم.' },
              { q: 'ما هي طرق الدفع المتاحة؟', a: 'نقبل Benefit Pay, كي نت, البطاقات الائتمانية (Visa/Mastercard), Apple Pay, والدفع عند الاستلام.' },
              { q: 'هل يمكن الطلب بمقاسات خاصة؟', a: 'نعم! تواصلي معنا على واتساب للطلبات المخصصة والتفصيل على المقاس.' },
            ];
            const [openFaq, setOpenFaq] = React.useState<number | null>(null);
            return (
              <section className="py-14 px-4 bg-white" dir="rtl">
                <div className="max-w-3xl mx-auto">
                  <div className="text-center mb-10">
                    <p className="text-[#C4956A] text-xs font-bold tracking-widest uppercase mb-2">الأسئلة الشائعة</p>
                    <h2 className="text-2xl md:text-3xl font-black text-[#2C1810]">كل ما تريدين معرفته</h2>
                  </div>
                  <div className="space-y-3">
                    {faqs.map((faq, i) => (
                      <div key={i} className="border border-[#F2E4DC] rounded-2xl overflow-hidden">
                        <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                          className="w-full flex items-center justify-between px-5 py-4 text-right font-bold text-sm text-[#2C1810] hover:bg-[#FDF8F5] transition-colors">
                          <span>{faq.q}</span>
                          <span className={`text-[#9A2D55] text-lg font-black transition-transform ${openFaq === i ? 'rotate-45' : ''}`}>+</span>
                        </button>
                        {openFaq === i && (
                          <div className="px-5 pb-4 text-sm text-[#8B7B78] leading-relaxed border-t border-[#F8EDE8] pt-3 bg-[#FDF8F5]">
                            {faq.a}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="text-center mt-8">
                    <p className="text-[#8B7B78] text-sm mb-3">لم تجدي إجابتك؟</p>
                    <a href="https://wa.me/97337037697" target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-2 bg-[#9A2D55] text-white font-bold px-6 py-2.5 rounded-full text-sm hover:bg-[#802446] transition-all">
                      تواصلي معنا على واتساب
                    </a>
                  </div>
                </div>
              </section>
            );
          })()}

          {/* ── 10. FINAL CTA ──────────────────────────────────── */}
          <section className="py-16 px-4 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #2C1810 0%, #4A1228 40%, #9A2D55 100%)' }}>
            {/* Decorative diamonds */}
            <div className="absolute inset-0 opacity-5">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="absolute border border-white rotate-45"
                  style={{ width: `${40 + i*20}px`, height: `${40 + i*20}px`, top: `${Math.random()*80}%`, left: `${Math.random()*100}%` }} />
              ))}
            </div>
            <div className="relative max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-[#E8D5C4] text-xs font-bold px-4 py-2 rounded-full mb-6">
                <Sparkles className="w-3.5 h-3.5" />
                طلبات خاصة ومخصصة
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight">
                أناقتك تبدأ من هنا
                <br />
                <span className="text-[#E8D5C4] text-2xl md:text-3xl font-bold">نصنع لكِ تفاصيل لا تُنسى</span>
              </h2>
              <p className="text-white/60 text-sm mb-10 max-w-lg mx-auto leading-relaxed">
                للطلبات الخاصة والتفصيل المخصص والاستفسارات — فريقنا جاهز للخدمة 24/7
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <a href="https://wa.me/97337037697" target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-2.5 bg-white text-[#9A2D55] font-black px-10 py-4 rounded-full shadow-2xl hover:shadow-white/20 transition-all hover:-translate-y-1.5 text-sm">
                  <Phone className="w-4 h-4" />
                  تواصلي على واتساب الآن
                </a>
                <button
                  onClick={() => document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="inline-flex items-center gap-2 border-2 border-white/30 text-white font-bold px-8 py-4 rounded-full hover:bg-white/10 transition-all text-sm">
                  تصفحي التشكيلة
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          </section>

        </main>
      )}

      {/* ── ORDER TRACKING TAB ──────────────────────────────────── */}
      {activeTab === 'tracking' && (
        <main className="min-h-[60vh] bg-[#FDF8F5] px-4 py-10">
          <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#9A2D55] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#9A2D55]/20">
              <Truck className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-black text-[#2C1810] mb-2">تتبع شحنتك</h2>
            <p className="text-[#8B7B78] text-sm">أدخلي رقم التتبع أو رقم الهاتف لمتابعة شحنتكِ</p>
          </div>
          <div className="bg-white rounded-3xl border border-[#F2E4DC] p-6 md:p-8 shadow-sm">
            <div>

            <div className="bg-[#FDF8F5] p-4 rounded-2xl border border-[#F2E4DC] flex gap-2 mb-4">
              <input type="text" placeholder="رقم التتبع (AL-XXXXX-BH) أو الهاتف..."
                value={trackSearchQuery} onChange={e => setTrackSearchQuery(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleTrackSearch(); }}
                className="flex-1 bg-white border border-[#F2E4DC] text-[#2C1810] font-medium rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#9A2D55]"
              />
              <button onClick={handleTrackSearch}
                className="bg-[#9A2D55] hover:bg-[#802446] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all cursor-pointer">
                تتبع
              </button>
            </div>

            {trackError && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-100 text-xs rounded-xl flex items-center gap-2">
                <span>⚠️</span><p className="font-semibold">{trackError}</p>
              </div>
            )}

            <AnimatePresence mode="wait">
              {trackedOrder ? (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="border-t border-[#F2E4DC] pt-6 mt-4">
                  {/* Status badge */}
                  <div className="flex items-center justify-between bg-[#FDF8F5] rounded-2xl p-4 border border-[#F2E4DC] mb-6">
                    <div>
                      <span className="text-[10px] text-[#8B7B78] font-bold block">رقم التتبع</span>
                      <span className="font-mono font-black text-[#9A2D55] text-lg">{trackedOrder.trackingCode}</span>
                    </div>
                    <span className={`text-xs font-bold px-4 py-2 rounded-full ${
                      trackedOrder.shippingStatus === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                      trackedOrder.shippingStatus === 'shipped' ? 'bg-blue-100 text-blue-800' :
                      trackedOrder.shippingStatus === 'processing' ? 'bg-amber-100 text-amber-800' :
                      'bg-[#F8EDE8] text-[#9A2D55]'
                    }`}>
                      {trackedOrder.shippingStatus === 'delivered' ? 'تم التسليم ✓' :
                       trackedOrder.shippingStatus === 'shipped' ? 'قيد الشحن ✈️' :
                       trackedOrder.shippingStatus === 'processing' ? 'جاري التجهيز ⚜️' : 'طلب معلّق'}
                    </span>
                  </div>

                  {/* Timeline */}
                  <div className="relative pr-6 space-y-6 before:absolute before:top-2 before:bottom-2 before:right-2 before:w-0.5 before:bg-[#F2E4DC]">
                    {trackedOrder.timeline.map((event, idx) => (
                      <div key={idx} className="relative flex items-start gap-4 pr-6">
                        <div className={`absolute right-[-5px] w-5 h-5 rounded-full border-4 bg-white flex items-center justify-center ${
                          idx === trackedOrder.timeline.length - 1 ? 'border-[#9A2D55]' : 'border-[#F2E4DC]'
                        }`}>
                          {idx === trackedOrder.timeline.length - 1 && <div className="w-2 h-2 bg-[#9A2D55] rounded-full" />}
                        </div>
                        <div className="flex-1 bg-[#FDF8F5] rounded-2xl px-4 py-3 border border-[#F2E4DC]">
                          <span className="text-[10px] text-[#8B7B78] font-mono">{event.date}</span>
                          <h4 className="font-bold text-sm text-[#2C1810] mt-0.5">{event.title}</h4>
                          <p className="text-xs text-[#8B7B78] leading-relaxed font-medium mt-0.5">{event.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 text-center bg-[#F8EDE8] border border-dashed border-[#F2E4DC] rounded-2xl p-4 text-xs font-semibold text-[#8B7B78]">
                    استفسار؟ تواصلي معنا على{' '}
                    <a href="https://wa.me/97337037697" className="text-emerald-600 underline">+973 37037697</a>
                  </div>
                </motion.div>
              ) : (
                <div className="mt-6 text-center text-[#8B7B78] py-8 border border-dashed border-[#F2E4DC] rounded-2xl">
                  <Clock className="w-8 h-8 text-[#F2E4DC] mx-auto mb-2" />
                  <p className="text-sm font-semibold">أدخلي رقم الطلب أو الهاتف للبدء</p>
                </div>
              )}
            </AnimatePresence>
            </div>{/* end inner div */}
          </div>{/* end bg-white card */}
          </div>{/* end max-w-2xl */}
        </main>
      )}

      {/* ── FOOTER ──────────────────────────────────────────────── */}
      <footer className="bg-[#1a0d08] text-[#8B7B78]">
        <div className="max-w-7xl mx-auto px-4 pt-14 pb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-10">

            {/* Brand */}
            <div className="sm:col-span-2 md:col-span-1">
              <div className="mb-4">
                <img src="/logo.jpg" alt="ألماسة" className="h-16 w-auto object-contain brightness-[1.1] contrast-[0.9] opacity-90" />
              </div>
              <p className="text-[13px] leading-relaxed text-[#8B7B78] font-medium">
                متجرك الأول للحصول على أرقى تصاميم المخاوير الخليجية بجودة استثنائية وتفاصيل تخطف الأنظار.
              </p>
              <div className="flex gap-2.5 mt-5">
                <a href="https://wa.me/97337037697" target="_blank" rel="noreferrer"
                  className="w-9 h-9 bg-white/5 hover:bg-emerald-600 border border-white/10 rounded-xl flex items-center justify-center hover:text-white transition-all">
                  <Phone className="w-4 h-4" />
                </a>
                <a href="https://instagram.com/almaasa_store" target="_blank" rel="noreferrer"
                  className="w-9 h-9 bg-white/5 hover:bg-gradient-to-tr hover:from-purple-600 hover:to-pink-600 border border-white/10 rounded-xl flex items-center justify-center hover:text-white transition-all">
                  <Instagram className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Shop links */}
            <div>
              <p className="text-white font-black text-sm mb-4">التسوق</p>
              <ul className="space-y-2.5">
                {[
                  { label: 'جميع المنتجات', action: () => { setActiveTab('shop'); setSelectedCategory('all'); } },
                  ...categories.filter(c=>c.id!=='all').slice(0,3).map(c => ({
                    label: c.name,
                    action: () => { setActiveTab('shop'); setSelectedCategory(c.id); }
                  })),
                  { label: 'العروض والتخفيضات', action: () => setActiveTab('shop') },
                ].map(item => (
                  <li key={item.label}>
                    <button onClick={item.action} className="text-[13px] hover:text-[#C4956A] transition-colors font-medium text-right">
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Help links */}
            <div>
              <p className="text-white font-black text-sm mb-4">المساعدة</p>
              <ul className="space-y-2.5">
                {[
                  { label: 'تتبع طلبي ✈️', action: () => setActiveTab('tracking') },
                  { label: 'آراء الزبائن ⭐', action: () => setShowReviewsPopup(true) },
                  { label: 'تواصلي معنا', action: () => window.open('https://wa.me/97337037697','_blank') },
                  { label: 'سياسة الإرجاع', action: () => setShowReturnPolicy(true) },
                ].map(item => (
                  <li key={item.label}>
                    <button onClick={item.action} className="text-[13px] hover:text-[#C4956A] transition-colors font-medium">
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Payment + contact */}
            <div>
              <p className="text-white font-black text-sm mb-4">وسائل الدفع</p>
              <div className="flex flex-wrap gap-2 mb-5">
                {['BenefitPay', 'KNet', 'Visa', 'Mastercard', 'Apple Pay'].map(p => (
                  <span key={p} className="bg-white/5 border border-white/10 text-[#8B7B78] text-[10px] font-bold px-2.5 py-1 rounded-lg">
                    {p}
                  </span>
                ))}
              </div>
              <div className="space-y-2 text-[12px]">
                <p className="flex items-center gap-1.5 text-[#8B7B78]">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  جميع المدفوعات مشفّرة وآمنة
                </p>
                <p className="flex items-center gap-1.5 text-[#8B7B78]">
                  <MapPin className="w-3.5 h-3.5 text-[#C4956A] shrink-0" />
                  المنامة، مملكة البحرين
                </p>
              </div>
            </div>

          </div>

          <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-[11px] text-[#8B7B78]/60 font-medium">
            <p>© 2026 مخاوير ألماسة — almaasa.bh — جميع الحقوق محفوظة</p>
            <div className="flex items-center gap-4">
              <button onClick={() => setShowAbout(true)} className="hover:text-[#8B7B78] transition-colors">من نحن</button>
              <button onClick={() => setShowPrivacy(true)} className="hover:text-[#8B7B78] transition-colors">سياسة الخصوصية</button>
              <button onClick={() => setShowTerms(true)} className="hover:text-[#8B7B78] transition-colors">الشروط والأحكام</button>
              <button onClick={onNavigateToAdmin} className="opacity-20 hover:opacity-60 transition-opacity">
                إدارة المتجر
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* ── MOBILE BOTTOM NAV ───────────────────────────────────── */}
      <div className="md:hidden fixed bottom-0 right-0 left-0 z-50 bg-white border-t border-[#F2E4DC] shadow-xl">
        <div className="flex items-center justify-around py-2 px-2">
          {[
            { icon: Home,        label: 'الرئيسية',   action: () => { setActiveTab('shop'); setSelectedCategory('all'); } },
            { icon: Grid3X3,     label: 'الأقسام',    action: () => document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' }) },
            { icon: ShoppingBag, label: 'السلة',      action: () => setIsCartOpen(true), badge: cart.reduce((s, i) => s + i.quantity, 0) },
            { icon: Heart,       label: 'المفضلة',   action: () => setShowWishlist(true), badge: wishlist.length },
            { icon: Truck,       label: 'تتبع طلبي', action: () => setActiveTab('tracking') },
          ].map(({ icon: Icon, label, action, badge }) => (
            <button key={label} onClick={action}
              className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all relative ${
                (label === 'الرئيسية' && activeTab === 'shop') || (label === 'تتبع طلبي' && activeTab === 'tracking')
                  ? 'text-[#9A2D55]' : 'text-[#8B7B78]'
              }`}>
              <Icon className="w-5 h-5" />
              <span className="text-[9px] font-semibold">{label}</span>
              {badge != null && badge > 0 && (
                <span className="absolute -top-0.5 right-1.5 bg-[#9A2D55] text-white text-[8px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center">
                  {badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════
          MODALS
      ════════════════════════════════════════════════════════ */}

      {/* ── MODAL: Product Detail ────────────────────────────── */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-[#F2E4DC] flex flex-col md:flex-row shadow-2xl">

              {/* Image */}
              <div className="md:w-1/2 relative bg-[#F8EDE8] min-h-[300px] md:rounded-r-3xl overflow-hidden">
                <img src={selectedProduct.image} alt={selectedProduct.name} referrerPolicy="no-referrer"
                  className="w-full h-full object-cover" />
                <button onClick={() => setSelectedProduct(null)}
                  className="absolute top-4 right-4 bg-white/90 hover:bg-white text-[#2C1810] p-2 rounded-full shadow-md cursor-pointer transition-all">
                  <X className="w-4 h-4" />
                </button>
                <button onClick={e => toggleWishlist(selectedProduct.id, e)}
                  className="absolute top-4 left-4 bg-white/90 hover:bg-white p-2 rounded-full shadow-md cursor-pointer transition-all">
                  <Heart className={`w-4 h-4 ${wishlist.includes(selectedProduct.id) ? 'fill-[#9A2D55] text-[#9A2D55]' : 'text-[#8B7B78]'}`} />
                </button>
              </div>

              {/* Details */}
              <div className="p-6 md:p-8 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-[#9A2D55] bg-[#F8EDE8] px-3 py-1 rounded-full">
                      {categories.find(c => c.id === selectedProduct.category)?.name || 'مخور'}
                    </span>
                    <button onClick={() => { const g = selectedProduct.category === 'kids' ? 'g-2' : 'g-1'; setShowSizeGuide(g); }}
                      className="text-xs text-[#9A2D55] underline font-bold hover:text-[#802446] transition-colors">
                      📏 دليل المقاسات
                    </button>
                  </div>

                  <h2 className="text-xl font-black text-[#2C1810] mb-3 leading-tight">{selectedProduct.name}</h2>

                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-3xl font-black text-[#9A2D55]">{selectedProduct.price.toFixed(2)}</span>
                    <span className="text-[#9A2D55] font-semibold">د.ب</span>
                    {selectedProduct.originalPrice && (
                      <span className="text-sm text-[#8B7B78] line-through">{selectedProduct.originalPrice.toFixed(2)} د.ب</span>
                    )}
                  </div>

                  <p className="text-[#8B7B78] text-sm leading-relaxed mb-5 font-medium">{selectedProduct.description}</p>

                  {/* Size selector */}
                  <div className="mb-4">
                    <span className="text-xs font-bold text-[#5C3830] block mb-2">المقاس:</span>
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.sizes.map(size => (
                        <button key={size} onClick={() => setChosenSize(size)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                            chosenSize === size
                              ? 'bg-[#9A2D55] text-white border-[#9A2D55] shadow-sm'
                              : 'bg-white hover:bg-[#F8EDE8] text-[#5C3830] border-[#F2E4DC]'
                          }`}>{size}</button>
                      ))}
                    </div>
                  </div>

                  {/* Color selector */}
                  <div className="mb-5">
                    <span className="text-xs font-bold text-[#5C3830] block mb-2">اللون:</span>
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.colors.map(color => (
                        <button key={color} onClick={() => setChosenColor(color)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                            chosenColor === color
                              ? 'bg-[#F8EDE8] text-[#9A2D55] border-[#9A2D55] border-2'
                              : 'bg-white hover:bg-[#F8EDE8] text-[#5C3830] border-[#F2E4DC]'
                          }`}>{color}</button>
                      ))}
                    </div>
                  </div>

                  {/* Properties */}
                  <div className="bg-[#FDF8F5] rounded-2xl p-4 border border-[#F2E4DC]">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {selectedProduct.properties.map((prop, idx) => (
                        <div key={idx} className="bg-white p-2.5 rounded-xl border border-[#F2E4DC]">
                          <span className="text-[#8B7B78] font-semibold block text-[10px]">{prop.label}</span>
                          <span className="text-[#2C1810] font-bold">{prop.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Add to cart */}
                <div className="pt-5 border-t border-[#F2E4DC] flex items-center gap-3 mt-4">
                  <div className="flex items-center gap-2 bg-[#FDF8F5] rounded-xl px-3 py-2 border border-[#F2E4DC]">
                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="text-[#8B7B78] hover:text-[#9A2D55] transition-colors">
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-6 text-center text-sm font-black text-[#2C1810]">{quantity}</span>
                    <button onClick={() => setQuantity(q => q + 1)} className="text-[#8B7B78] hover:text-[#9A2D55] transition-colors">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <button onClick={handleAddToCart} disabled={selectedProduct.stock === 0}
                    className="flex-1 bg-[#9A2D55] hover:bg-[#802446] disabled:bg-[#F2E4DC] disabled:text-[#8B7B78] text-white font-black py-3 px-6 rounded-xl shadow-md transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer">
                    <ShoppingBag className="w-4 h-4" />
                    {selectedProduct.stock === 0 ? 'نفدت الكمية' : 'أضيفي للسلة'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL: Cart Drawer ───────────────────────────────── */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end">
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl">

              {/* Header */}
              <div className="p-4 border-b border-[#F2E4DC] flex items-center justify-between bg-[#FDF8F5]">
                <div className="flex items-center gap-2 text-[#9A2D55]">
                  <ShoppingBag className="w-5 h-5" />
                  <span className="font-black text-base text-[#2C1810]">سلة المشتريات</span>
                  {cart.length > 0 && (
                    <span className="bg-[#9A2D55] text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                      {cart.reduce((s, i) => s + i.quantity, 0)}
                    </span>
                  )}
                </div>
                <button onClick={() => setIsCartOpen(false)} className="p-1.5 bg-white hover:bg-[#F8EDE8] rounded-lg text-[#8B7B78] border border-[#F2E4DC] cursor-pointer transition-all">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Stepper */}
              {checkoutStep !== 'success' && (
                <div className="flex items-center justify-around px-4 py-3 border-b border-[#F2E4DC] bg-white text-[10px] font-bold">
                  {[['cart', 'السلة'], ['details', 'بيانات الشحن'], ['payment', 'الدفع']].map(([step, label], i) => (
                    <React.Fragment key={step}>
                      <span className={checkoutStep === step ? 'text-[#9A2D55] font-black' : 'text-[#8B7B78]'}>
                        {i + 1}. {label}
                      </span>
                      {i < 2 && <ChevronRight className="w-3 h-3 text-[#F2E4DC]" />}
                    </React.Fragment>
                  ))}
                </div>
              )}

              <div className="flex-1 overflow-y-auto p-4">

                {/* CART STEP */}
                {checkoutStep === 'cart' && (
                  <div>
                    {cart.length === 0 ? (
                      <div className="text-center py-14">
                        <ShoppingBag className="w-12 h-12 text-[#F2E4DC] mx-auto mb-4" />
                        <p className="text-sm font-bold text-[#2C1810] mb-2">حقيبتكِ فارغة</p>
                        <button onClick={() => { setIsCartOpen(false); setActiveTab('shop'); }}
                          className="mt-3 bg-[#9A2D55] text-white font-bold py-2.5 px-6 rounded-xl text-xs hover:bg-[#802446] transition-all">
                          تصفحي المخاوير
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {cart.map((item, index) => (
                          <div key={index} className="flex gap-3 bg-[#FDF8F5] p-3 rounded-2xl border border-[#F2E4DC]">
                            <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-[#F8EDE8]">
                              <img src={item.product.image} alt={item.product.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-black text-[#2C1810] line-clamp-1">{item.product.name}</h4>
                              <span className="text-[10px] text-[#8B7B78] font-medium">{item.selectedSize} | {item.selectedColor}</span>
                              <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center gap-1 bg-white border border-[#F2E4DC] rounded-lg py-0.5 px-2">
                                  <button onClick={() => updateCartQty(index, item.quantity - 1)} className="text-[#8B7B78] hover:text-[#9A2D55]"><Minus className="w-3 h-3" /></button>
                                  <span className="text-xs font-black w-5 text-center text-[#2C1810]">{item.quantity}</span>
                                  <button onClick={() => updateCartQty(index, item.quantity + 1)} className="text-[#8B7B78] hover:text-[#9A2D55]"><Plus className="w-3 h-3" /></button>
                                </div>
                                <span className="text-xs font-black text-[#9A2D55]">{(item.product.price * item.quantity).toFixed(2)} د.ب</span>
                              </div>
                            </div>
                            <button onClick={() => removeFromCart(index)} className="text-[#F2E4DC] hover:text-red-400 shrink-0 p-1 cursor-pointer">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}

                        {/* Coupon */}
                        <div className="bg-[#F8EDE8] border border-[#F2E4DC] rounded-2xl p-4 mt-4">
                          <label className="text-xs font-bold text-[#5C3830] block mb-2">كوبون الخصم 🎟️</label>
                          <div className="flex gap-2">
                            <input type="text" placeholder="ALMAASA10..."
                              value={couponCode} onChange={e => setCouponCode(e.target.value)}
                              className="flex-1 bg-white border border-[#F2E4DC] rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#9A2D55] uppercase"
                            />
                            <button onClick={applyCoupon} className="bg-[#9A2D55] hover:bg-[#802446] text-white text-xs font-bold rounded-xl px-4 py-1.5 transition-all">
                              تفعيل
                            </button>
                          </div>
                          {activeCoupon && (
                            <p className="text-[10px] text-emerald-600 font-bold mt-1.5 flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              خصم {activeCoupon.type === 'percentage' ? `${activeCoupon.discount}%` : `${activeCoupon.discount.toFixed(2)} د.ب`} مطبّق
                            </p>
                          )}
                          {couponError && <p className="text-[10px] text-red-500 font-bold mt-1.5">{couponError}</p>}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* DETAILS STEP */}
                {checkoutStep === 'details' && (
                  <div className="space-y-3 font-medium text-xs">
                    <h3 className="font-black text-sm text-[#2C1810] border-b border-[#F2E4DC] pb-2 mb-3">بيانات الشحن</h3>
                    {[
                      { label: 'الاسم الكامل *', type: 'text', val: customerName, set: setCustomerName, ph: 'فاطمة البوعينين' },
                      { label: 'رقم الواتساب *', type: 'tel', val: customerPhone, set: setCustomerPhone, ph: '97337037697' },
                      { label: 'البريد الإلكتروني', type: 'email', val: customerEmail, set: setCustomerEmail, ph: 'aisha@example.com' },
                    ].map(f => (
                      <div key={f.label}>
                        <label className="text-[#8B7B78] block mb-1">{f.label}</label>
                        <input type={f.type} placeholder={f.ph} value={f.val} onChange={e => f.set(e.target.value)}
                          className="w-full bg-[#FDF8F5] border border-[#F2E4DC] rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-[#9A2D55] text-[#2C1810]"
                        />
                      </div>
                    ))}

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[#8B7B78] block mb-1">الدولة *</label>
                        <select value={customerCountry} onChange={e => setCustomerCountry(e.target.value)}
                          className="w-full bg-[#FDF8F5] border border-[#F2E4DC] rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#9A2D55] text-[#2C1810] font-medium">
                          {['البحرين 🇧🇭', 'السعودية 🇸🇦', 'الكويت 🇰🇼', 'الإمارات 🇦🇪', 'قطر 🇶🇦', 'عمان 🇴🇲'].map(c => (
                            <option key={c} value={c.split(' ')[0]}>{c}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[#8B7B78] block mb-1">المدينة *</label>
                        <input type="text" placeholder="المنامة" value={customerCity} onChange={e => setCustomerCity(e.target.value)}
                          className="w-full bg-[#FDF8F5] border border-[#F2E4DC] rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#9A2D55] text-[#2C1810] font-medium"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[#8B7B78] block mb-1">العنوان الكامل *</label>
                      <textarea rows={2} placeholder="طريق 1221، فيلا 93، مجمع البديع" value={customerAddress} onChange={e => setCustomerAddress(e.target.value)}
                        className="w-full bg-[#FDF8F5] border border-[#F2E4DC] rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#9A2D55] text-[#2C1810] font-medium resize-none"
                      />
                    </div>
                    <div>
                      <label className="text-[#8B7B78] block mb-1">ملاحظات للمخيط (اختياري)</label>
                      <textarea rows={2} placeholder="تطريز خاص، مقاس مخصص..." value={customerNotes} onChange={e => setCustomerNotes(e.target.value)}
                        className="w-full bg-[#FDF8F5] border border-[#F2E4DC] rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#9A2D55] text-[#2C1810] font-medium resize-none"
                      />
                    </div>

                    {/* Shipping methods */}
                    <div>
                      <label className="text-[#8B7B78] block mb-2 font-bold">طريقة التوصيل</label>
                      {availableShippingMethods.length === 0 ? (
                        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-xl text-[11px] font-medium">
                          ⚠️ سيقوم فريق الدعم بالتنسيق معكِ لتحديد سعر الشحن.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {availableShippingMethods.map((method: any) => (
                            <label key={method.id}
                              className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                                selectedShippingMethod?.id === method.id
                                  ? 'bg-[#F8EDE8] border-[#9A2D55] ring-1 ring-[#9A2D55]/20'
                                  : 'bg-white border-[#F2E4DC] hover:bg-[#FDF8F5]'
                              }`}>
                              <div className="flex items-center gap-2">
                                <input type="radio" name="shipping" checked={selectedShippingMethod?.id === method.id}
                                  onChange={() => setSelectedShippingMethod(method)} className="accent-[#9A2D55]" />
                                <div>
                                  <span className="font-bold text-xs text-[#2C1810] block">{method.name}</span>
                                  {method.description && <span className="text-[10px] text-[#8B7B78]">{method.description}</span>}
                                </div>
                              </div>
                              <span className="text-xs font-black text-[#9A2D55]">
                                {method.priceType === 'free' ? 'مجاني' : `${parseFloat(method.price).toFixed(3)} د.ب`}
                              </span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* PAYMENT STEP */}
                {checkoutStep === 'payment' && (
                  <div className="space-y-4 text-xs font-medium">
                    <h3 className="font-black text-sm text-[#2C1810] flex items-center gap-2 border-b border-[#F2E4DC] pb-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" /> الدفع الآمن
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'benefit', label: 'BenefitPay 🇧🇭', sub: 'البحرين' },
                        { id: 'knet', label: 'KNet 🇰🇼', sub: 'الكويت' },
                        { id: 'card', label: 'بطاقة بنكية', sub: 'Visa / Mastercard' },
                        { id: 'applepay', label: ' Pay', sub: 'تطبيق المحفظة' },
                      ].map(m => (
                        <button key={m.id} onClick={() => { setPaymentMethod(m.id as any); setBenefitStep('input'); }}
                          className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                            paymentMethod === m.id ? 'bg-[#F8EDE8] border-[#9A2D55] text-[#9A2D55]' : 'bg-white border-[#F2E4DC] text-[#5C3830] hover:bg-[#FDF8F5]'
                          }`}>
                          <span className="text-[11px] font-black block">{m.label}</span>
                          <span className="text-[9px] text-[#8B7B78]">{m.sub}</span>
                        </button>
                      ))}
                    </div>

                    <div className="bg-[#FDF8F5] rounded-2xl p-4 border border-[#F2E4DC]">
                      {paymentMethod === 'benefit' && (
                        <div className="space-y-3">
                          <p className="font-bold text-[#9A2D55]">BenefitPay — أدخلي رقم الهاتف:</p>
                          <input type="tel" placeholder="37037697" value={benefitPhone} onChange={e => setBenefitPhone(e.target.value)}
                            className="w-full bg-white border border-[#F2E4DC] rounded-xl px-3 py-2 text-sm text-center font-black text-[#2C1810]" />
                          <p className="text-[9px] text-[#9A2D55] text-center font-semibold">سيتم فتح طلب الدفع بالبصمة في جهازكِ</p>
                        </div>
                      )}
                      {paymentMethod === 'knet' && (
                        <div className="space-y-2">
                          <p className="font-bold text-blue-700">شبكة KNet الكويتية:</p>
                          <input type="text" placeholder="رقم البطاقة" value={knetCardNum} onChange={e => setKnetCardNum(e.target.value)}
                            className="w-full bg-white border border-[#F2E4DC] rounded-xl px-3 py-2 text-xs text-center font-medium text-[#2C1810]" />
                          <input type="password" placeholder="الرقم السري (PIN)" value={knetPin} onChange={e => setKnetPin(e.target.value)} maxLength={4}
                            className="w-full bg-white border border-[#F2E4DC] rounded-xl px-3 py-2 text-xs text-center font-medium text-[#2C1810]" />
                        </div>
                      )}
                      {paymentMethod === 'card' && (
                        <div className="space-y-2">
                          <input type="text" placeholder="الاسم على البطاقة" value={cardName} onChange={e => setCardName(e.target.value)}
                            className="w-full bg-white border border-[#F2E4DC] rounded-xl px-3 py-2 text-xs font-medium text-[#2C1810]" />
                          <input type="text" placeholder="رقم البطاقة" value={cardNumber} onChange={e => setCardNumber(e.target.value)}
                            className="w-full bg-white border border-[#F2E4DC] rounded-xl px-3 py-2 text-xs font-mono text-center text-[#2C1810]" />
                          <div className="grid grid-cols-2 gap-2">
                            <input type="text" placeholder="MM/YY" value={cardExpiry} onChange={e => setCardExpiry(e.target.value)}
                              className="bg-white border border-[#F2E4DC] rounded-xl px-3 py-2 text-xs text-center text-[#2C1810]" />
                            <input type="password" placeholder="CVV" value={cardCvv} onChange={e => setCardCvv(e.target.value)} maxLength={3}
                              className="bg-white border border-[#F2E4DC] rounded-xl px-3 py-2 text-xs text-center text-[#2C1810]" />
                          </div>
                        </div>
                      )}
                      {paymentMethod === 'applepay' && (
                        <div className="text-center py-4">
                          <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-lg shadow"></div>
                          <p className="text-[10px] text-[#8B7B78] font-medium">جاري الاتصال بـ Face ID / Touch ID...</p>
                          <div className="w-24 h-1.5 bg-[#F2E4DC] rounded-full mx-auto mt-3 overflow-hidden">
                            <div className="h-full bg-[#9A2D55] rounded-full animate-pulse" style={{ width: '65%' }} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* SUCCESS STEP */}
                {checkoutStep === 'success' && newOrder && (
                  <div className="text-center py-8 space-y-5">
                    <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-100">
                      <CheckCircle className="w-10 h-10 text-emerald-500" />
                    </div>
                    <div>
                      <h3 className="font-black text-xl text-[#2C1810]">مبروك! تم الطلب بنجاح ✨</h3>
                      <p className="text-[#8B7B78] text-xs mt-1">تم تسجيل طلبكِ وجاري التجهيز</p>
                    </div>
                    <div className="bg-[#FDF8F5] rounded-2xl p-4 border border-[#F2E4DC] text-right space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-[#8B7B78]">كود التتبع:</span>
                        <strong className="text-[#9A2D55] font-mono font-black">{newOrder.trackingCode}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#8B7B78]">الإجمالي:</span>
                        <strong className="text-[#2C1810]">{newOrder.total.toFixed(2)} د.ب</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#8B7B78]">الوجهة:</span>
                        <strong className="text-[#2C1810]">{newOrder.customer.city}، {newOrder.customer.country}</strong>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <button onClick={() => { setTrackSearchQuery(newOrder.trackingCode); setTrackedOrder(newOrder); setIsCartOpen(false); setActiveTab('tracking'); setCheckoutStep('cart'); }}
                        className="w-full bg-[#9A2D55] hover:bg-[#802446] text-white py-3 rounded-xl text-xs font-black transition-all">
                        تتبع شحنتي ✈️
                      </button>
                      <button onClick={() => { setIsCartOpen(false); setCheckoutStep('cart'); setNewOrder(null); }}
                        className="w-full bg-[#F8EDE8] hover:bg-[#F2E4DC] text-[#5C3830] py-3 rounded-xl text-xs font-bold transition-all">
                        متابعة التسوق
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Cart Footer */}
              {checkoutStep !== 'success' && cart.length > 0 && (
                <div className="p-4 border-t border-[#F2E4DC] bg-[#FDF8F5]">
                  <div className="space-y-1.5 text-xs mb-4">
                    <div className="flex justify-between text-[#8B7B78]">
                      <span>المجموع الفرعي</span>
                      <span className="font-semibold text-[#2C1810]">{calculatedSubtotal.toFixed(2)} د.ب</span>
                    </div>
                    {calculatedDiscount > 0 && (
                      <div className="flex justify-between text-emerald-600 font-semibold">
                        <span>الخصم</span><span>-{calculatedDiscount.toFixed(2)} د.ب</span>
                      </div>
                    )}
                    <div className="flex justify-between text-[#8B7B78]">
                      <span>الشحن</span>
                      <span className="font-semibold text-[#2C1810]">{shippingCharge === 0 ? 'مجاني ✓' : `${shippingCharge.toFixed(2)} د.ب`}</span>
                    </div>
                    <div className="border-t border-[#F2E4DC] pt-2 flex justify-between">
                      <span className="font-black text-[#9A2D55]">الإجمالي</span>
                      <span className="font-black text-[#9A2D55] text-lg">{totalCost.toFixed(2)} د.ب</span>
                    </div>
                  </div>

                  {checkoutStep === 'cart' && (
                    <button onClick={() => setCheckoutStep('details')}
                      className="w-full bg-[#9A2D55] hover:bg-[#802446] text-white font-black py-3.5 px-4 rounded-xl shadow-md transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer">
                      بيانات الشحن <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                  {checkoutStep === 'details' && (
                    <div className="flex gap-2">
                      <button onClick={() => setCheckoutStep('cart')} className="bg-[#F8EDE8] hover:bg-[#F2E4DC] text-[#5C3830] font-bold py-3 px-4 rounded-xl transition-all">رجوع</button>
                      <button onClick={() => { if (!customerName || !customerPhone || !customerAddress) { addToast('يرجى تعبئة الحقول الأساسية', 'error'); return; } setCheckoutStep('payment'); }}
                        className="flex-1 bg-[#9A2D55] hover:bg-[#802446] text-white font-black py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer">
                        إلى الدفع <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  {checkoutStep === 'payment' && (
                    <div className="flex gap-2">
                      <button onClick={() => setCheckoutStep('details')} className="bg-[#F8EDE8] hover:bg-[#F2E4DC] text-[#5C3830] font-bold py-3 px-4 rounded-xl transition-all">رجوع</button>
                      <button onClick={triggerPayment} disabled={isPaying}
                        className="flex-1 bg-[#9A2D55] hover:bg-[#802446] disabled:bg-[#F2E4DC] disabled:text-[#8B7B78] text-white font-black py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer">
                        {isPaying ? <span className="flex items-center gap-2"><Zap className="w-4 h-4 animate-pulse" />جاري الدفع...</span> : <><span>تأكيد الطلب والدفع</span><ArrowRight className="w-4 h-4" /></>}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL: Reviews ──────────────────────────────────── */}
      <AnimatePresence>
        {showReviewsPopup && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-lg p-6 border border-[#F2E4DC] shadow-2xl max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6 pb-3 border-b border-[#F2E4DC]">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                  <span className="font-black text-[#2C1810]">آراء زبائن ألماسة</span>
                </div>
                <button onClick={() => setShowReviewsPopup(false)} className="p-1.5 bg-[#FDF8F5] hover:bg-[#F8EDE8] rounded-lg text-[#8B7B78] border border-[#F2E4DC] cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-4">
                {reviews.map(rev => (
                  <div key={rev.id} className="bg-[#FDF8F5] rounded-2xl p-4 border border-[#F2E4DC]">
                    <div className="flex justify-between mb-2">
                      <strong className="text-[#2C1810] text-sm">{rev.customerName}</strong>
                      <div className="flex gap-0.5">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </div>
                    <span className="text-[10px] text-[#8B7B78] font-medium block mb-2">{rev.productName}</span>
                    <p className="text-[#5C3830] text-xs leading-relaxed font-medium italic">"{rev.comment}"</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 text-center">
                <a href="https://wa.me/97337037697" target="_blank" rel="noreferrer"
                  className="inline-block bg-[#9A2D55] text-white font-bold text-xs py-3 px-6 rounded-xl shadow-md hover:bg-[#802446] transition-all">
                  شاركينا رأيك على واتساب 🎙️
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL: Size Guide ────────────────────────────────── */}
      <AnimatePresence>
        {showSizeGuide && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-xl p-6 border border-[#F2E4DC] shadow-2xl">
              <div className="flex justify-between items-center mb-4 pb-3 border-b border-[#F2E4DC]">
                <span className="font-black text-[#9A2D55]">{sizeGuides.find(g => g.id === showSizeGuide)?.name || 'دليل المقاسات'}</span>
                <button onClick={() => setShowSizeGuide(null)} className="p-1.5 bg-[#FDF8F5] hover:bg-[#F8EDE8] rounded-lg text-[#8B7B78] border border-[#F2E4DC] cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-right border-collapse">
                  <thead>
                    <tr className="bg-[#F8EDE8] text-[#9A2D55]">
                      {['المقاس', 'الصدر', 'الطول', 'الخصر', 'الكم'].map(h => (
                        <th key={h} className="p-2.5 border border-[#F2E4DC] font-black">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sizeGuides.find(g => g.id === showSizeGuide)?.sizes.map((row, idx) => (
                      <tr key={idx} className="odd:bg-[#FDF8F5] hover:bg-[#F8EDE8] transition-colors">
                        <td className="p-2.5 border border-[#F2E4DC] font-black text-[#9A2D55]">{row.label}</td>
                        <td className="p-2.5 border border-[#F2E4DC] font-medium text-[#5C3830]">{row.chest}</td>
                        <td className="p-2.5 border border-[#F2E4DC] font-medium text-[#5C3830]">{row.length}</td>
                        <td className="p-2.5 border border-[#F2E4DC] font-medium text-[#5C3830]">{row.waist}</td>
                        <td className="p-2.5 border border-[#F2E4DC] font-medium text-[#5C3830]">{row.sleeve}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-[10px] text-[#8B7B78] mt-4 leading-relaxed font-medium">
                * القياسات بالبوصة (Inches). للتفصيل بمقاسات خاصة راسليننا على واتساب.
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL: About ────────────────────────────────────── */}
      <AnimatePresence>
        {showAbout && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" dir="rtl">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-lg p-6 border border-[#F2E4DC] shadow-2xl max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-5 pb-3 border-b border-[#F2E4DC]">
                <h3 className="font-black text-[#2C1810] text-lg">من نحن</h3>
                <button onClick={() => setShowAbout(false)} className="p-1.5 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5 text-slate-500" /></button>
              </div>
              <div className="space-y-4 text-[13px] text-[#5C3830] leading-relaxed font-medium">
                <div className="flex justify-center mb-4"><img src="/logo.jpg" alt="ألماسة" className="h-16 w-auto object-contain" /></div>
                <p><strong className="text-[#9A2D55]">بوتيك ألماسة</strong> — وجهتك الأولى لأرقى تصاميم المخاوير والجلابيات الخليجية الفاخرة في مملكة البحرين.</p>
                <p>نؤمن بأن كل امرأة تستحق أن تبدو استثنائية في كل مناسبة. لذلك نختار بعناية فائقة أجود الأقمشة وأرقى التطريزات لنقدم لك تشكيلة لا مثيل لها من المخاوير التقليدية المعاصرة.</p>
                <div className="bg-[#FDF8F5] rounded-2xl p-4 border border-[#F2E4DC]">
                  <p className="font-black text-[#9A2D55] mb-2">قيمنا</p>
                  <ul className="space-y-1.5 list-disc list-inside">
                    <li>الجودة الاستثنائية في كل قطعة</li>
                    <li>التصاميم الحصرية المصنوعة بحب</li>
                    <li>خدمة عملاء متميزة ومتاحة دائماً</li>
                    <li>توصيل سريع وآمن لجميع أنحاء العالم</li>
                  </ul>
                </div>
                <div className="text-center pt-2">
                  <a href="https://wa.me/97337037697" target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-2 bg-[#9A2D55] text-white font-bold px-5 py-2.5 rounded-xl text-sm">
                    تواصلي معنا
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL: Privacy Policy ────────────────────────────── */}
      <AnimatePresence>
        {showPrivacy && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" dir="rtl">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-lg p-6 border border-[#F2E4DC] shadow-2xl max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-5 pb-3 border-b border-[#F2E4DC]">
                <h3 className="font-black text-[#2C1810] text-lg">سياسة الخصوصية</h3>
                <button onClick={() => setShowPrivacy(false)} className="p-1.5 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5 text-slate-500" /></button>
              </div>
              <div className="space-y-4 text-[13px] text-[#5C3830] leading-relaxed font-medium">
                {[
                  { title: 'جمع المعلومات', body: 'نجمع المعلومات التي تزودينا بها عند إتمام طلبك مثل الاسم والعنوان ورقم الهاتف والبريد الإلكتروني.' },
                  { title: 'استخدام المعلومات', body: 'تُستخدم بياناتك حصراً لمعالجة طلباتك، التواصل معك بشأن طلبك، وتحسين تجربتك في المتجر.' },
                  { title: 'حماية البيانات', body: 'جميع المعلومات الشخصية محفوظة بأمان ولا تُشارك مع أطراف ثالثة إلا عند الضرورة لإتمام التوصيل.' },
                  { title: 'ملفات الكوكيز', body: 'نستخدم ملفات الكوكيز لتحسين تجربة التصفح وتذكر تفضيلاتك. يمكنك تعطيلها من إعدادات المتصفح.' },
                  { title: 'التواصل', body: 'لأي استفسار عن سياسة الخصوصية، تواصلي معنا على واتساب أو البريد الإلكتروني.' },
                ].map(s => (
                  <div key={s.title} className="bg-[#FDF8F5] rounded-2xl p-4 border border-[#F2E4DC]">
                    <p className="font-black text-[#9A2D55] mb-1">{s.title}</p>
                    <p>{s.body}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL: Terms ────────────────────────────────────── */}
      <AnimatePresence>
        {showTerms && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" dir="rtl">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-lg p-6 border border-[#F2E4DC] shadow-2xl max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-5 pb-3 border-b border-[#F2E4DC]">
                <h3 className="font-black text-[#2C1810] text-lg">الشروط والأحكام</h3>
                <button onClick={() => setShowTerms(false)} className="p-1.5 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5 text-slate-500" /></button>
              </div>
              <div className="space-y-4 text-[13px] text-[#5C3830] leading-relaxed font-medium">
                {[
                  { title: 'قبول الشروط', body: 'باستخدامك هذا الموقع فأنتِ توافقين على الشروط والأحكام الواردة هنا.' },
                  { title: 'الطلبات والدفع', body: 'يُعتبر الطلب مؤكداً بعد إتمام عملية الدفع. نحتفظ بحق رفض أي طلب في حالات استثنائية مع إعادة المبلغ كاملاً.' },
                  { title: 'الأسعار', body: 'الأسعار بالدينار البحريني وتشمل ضريبة القيمة المضافة حيثما ينطبق. قد تتغير الأسعار دون إشعار مسبق.' },
                  { title: 'الشحن والتوصيل', body: 'مواعيد التوصيل تقريبية وقد تتأثر بظروف خارجة عن إرادتنا. نحن غير مسؤولين عن تأخيرات شركات الشحن.' },
                  { title: 'الملكية الفكرية', body: 'جميع المحتويات (صور، نصوص، تصاميم) ملك حصري لبوتيك ألماسة ومحمية بقوانين حقوق النشر.' },
                ].map(s => (
                  <div key={s.title} className="bg-[#FDF8F5] rounded-2xl p-4 border border-[#F2E4DC]">
                    <p className="font-black text-[#9A2D55] mb-1">{s.title}</p>
                    <p>{s.body}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL: Return Policy ────────────────────────────── */}
      <AnimatePresence>
        {showReturnPolicy && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" dir="rtl">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-lg p-6 border border-[#F2E4DC] shadow-2xl max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-5 pb-3 border-b border-[#F2E4DC]">
                <h3 className="font-black text-[#2C1810] text-lg">سياسة الإرجاع والاستبدال</h3>
                <button onClick={() => setShowReturnPolicy(false)} className="p-1.5 hover:bg-slate-100 rounded-lg">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              <div className="space-y-4 text-[13px] text-[#5C3830] leading-relaxed font-medium">
                <div className="bg-[#FDF8F5] rounded-2xl p-4 border border-[#F2E4DC]">
                  <p className="font-black text-[#9A2D55] mb-2">✅ شروط الإرجاع</p>
                  <ul className="space-y-1.5 list-disc list-inside">
                    <li>يُقبل الإرجاع خلال <strong>7 أيام</strong> من تاريخ الاستلام</li>
                    <li>يجب أن يكون المنتج بحالته الأصلية غير مُستخدَم</li>
                    <li>يجب الاحتفاظ بالوسم الأصلي والتغليف</li>
                    <li>لا يُقبل إرجاع المنتجات المُقصَّة أو المُعدَّلة</li>
                  </ul>
                </div>
                <div className="bg-[#FDF8F5] rounded-2xl p-4 border border-[#F2E4DC]">
                  <p className="font-black text-[#9A2D55] mb-2">🔄 الاستبدال</p>
                  <ul className="space-y-1.5 list-disc list-inside">
                    <li>الاستبدال مجاني في حال وجود عيب مصنعي</li>
                    <li>في حال الرغبة في الاستبدال بمقاس مختلف تتحمل العميلة رسوم الشحن</li>
                  </ul>
                </div>
                <div className="bg-[#FDF8F5] rounded-2xl p-4 border border-[#F2E4DC]">
                  <p className="font-black text-[#9A2D55] mb-2">💬 للتواصل</p>
                  <p>للإرجاع أو الاستبدال تواصلي معنا على واتساب:</p>
                  <button onClick={() => window.open('https://wa.me/97337037697','_blank')}
                    className="mt-2 bg-green-500 text-white font-bold text-xs px-4 py-2 rounded-xl">
                    واتساب: 97337037697+
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── DRAWER: Wishlist ────────────────────────────────── */}
      <AnimatePresence>
        {showWishlist && (
          <div className="fixed inset-0 z-50 flex" dir="rtl">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowWishlist(false)} />
            <motion.div initial={{ x: -320 }} animate={{ x: 0 }} exit={{ x: -320 }} transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="relative mr-auto w-full max-w-sm bg-white h-full flex flex-col shadow-2xl">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#F2E4DC]">
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 fill-[#9A2D55] text-[#9A2D55]" />
                  <h2 className="font-black text-[#2C1810] text-base">المفضلة</h2>
                  <span className="bg-[#F8EDE8] text-[#9A2D55] text-[10px] font-black px-2 py-0.5 rounded-full">{wishlist.length}</span>
                </div>
                <button onClick={() => setShowWishlist(false)} className="p-1.5 hover:bg-slate-100 rounded-lg">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {wishlist.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                    <Heart className="w-14 h-14 text-[#F2E4DC]" />
                    <p className="text-[#8B7B78] font-semibold text-sm">قائمة المفضلة فارغة</p>
                    <p className="text-[#8B7B78] text-xs">اضغطي على قلب المنتج لإضافته للمفضلة</p>
                    <button onClick={() => setShowWishlist(false)} className="bg-[#9A2D55] text-white font-bold text-sm px-6 py-2.5 rounded-xl">
                      تصفحي المنتجات
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {products.filter(p => wishlist.includes(p.id)).map(p => (
                      <div key={p.id} className="flex gap-3 bg-[#FDF8F5] rounded-2xl p-3 border border-[#F2E4DC]">
                        <img src={p.image} alt={p.name} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-[#2C1810] truncate">{p.name}</p>
                          <p className="text-[#9A2D55] font-black text-sm mt-0.5">{p.price} د.ب</p>
                          <button onClick={() => {
                            setSelectedProduct(p);
                            setShowWishlist(false);
                          }} className="mt-1.5 text-[10px] font-bold text-[#9A2D55] hover:underline">
                            عرض المنتج ←
                          </button>
                        </div>
                        <button onClick={() => {
                          const next = wishlist.filter(id => id !== p.id);
                          setWishlist(next);
                          localStorage.setItem('ama_wishlist', JSON.stringify(next));
                        }} className="p-1 text-slate-400 hover:text-rose-500 shrink-0">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
