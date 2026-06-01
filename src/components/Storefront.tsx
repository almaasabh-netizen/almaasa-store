import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, Search, Truck, Heart, ArrowRight, CheckCircle, 
  Clock, Check, BookOpen, X, Phone, MapPin, Tag, Plus, Minus, 
  Star, ExternalLink, ShieldCheck, CreditCard, ChevronRight, Share2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, Order, Coupon, SizeGuide, Review, StoreSettings, OrderItem, Category } from '../types';
import { getStoredData, saveStoredData, addOperationLog } from '../data';

interface StorefrontProps {
  onNavigateToAdmin: () => void;
  activeTab: 'shop' | 'tracking';
  setActiveTab: (tab: 'shop' | 'tracking') => void;
}

export default function Storefront({ onNavigateToAdmin, activeTab, setActiveTab }: StorefrontProps) {
  // Loaded from LocalStorage
  const [products, setProducts] = useState<Product[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [sizeGuides, setSizeGuides] = useState<SizeGuide[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // App state
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showSizeGuide, setShowSizeGuide] = useState<string | null>(null); // Guide ID if open
  const [showReviewsPopup, setShowReviewsPopup] = useState(false);
  
  // Selected options in modal
  const [chosenSize, setChosenSize] = useState('');
  const [chosenColor, setChosenColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  
  // Cart state
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [activeCoupon, setActiveCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState('');
  
  // Checkout state
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'details' | 'payment' | 'success'>('cart');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerCity, setCustomerCity] = useState('المنامة');
  const [customerCountry, setCustomerCountry] = useState('البحرين');
  const [customerNotes, setCustomerNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'benefit' | 'knet' | 'card' | 'applepay'>('benefit');

  // Dynamic Shipping Zones
  const [shippingZones, setShippingZones] = useState<any[]>([]);
  const [selectedShippingMethod, setSelectedShippingMethod] = useState<any>(null);
  
  // BenefitPay/KNet specific interactive variables
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
  
  // Tracking search state
  const [trackSearchQuery, setTrackSearchQuery] = useState('');
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);
  const [trackError, setTrackError] = useState('');

  // Loaded once on component render
  useEffect(() => {
    const data = getStoredData();
    setProducts(data.products);
    setCoupons(data.coupons);
    setSizeGuides(data.sizeGuides);
    setReviews(data.reviews.filter(r => r.approved));
    setSettings(data.settings);
    setCategories(data.categories);
    
    // Inactive placeholder search param detection
    const params = new URLSearchParams(window.location.search);
    const trackingCode = params.get('track');
    if (trackingCode) {
      setActiveTab('tracking');
      setTrackSearchQuery(trackingCode);
      const matched = data.orders.find((o: Order) => o.trackingCode.toLowerCase() === trackingCode.toLowerCase());
      if (matched) {
        setTrackedOrder(matched);
      }
    }

    const savedZones = localStorage.getItem('ama_shipping_zones');
    if (savedZones) {
      try {
        setShippingZones(JSON.parse(savedZones));
      } catch (e) {
        console.error("Error loading shipping zones", e);
      }
    } else {
      const defaultZones = [
        {
          id: "zone-1",
          name: "محلي - BH",
          countries: ["البحرين"],
          cities: ["المنامة", "الرفاع", "المحرق", "مدينة عيسى"],
          methods: [
            {
              id: "method-1-1",
              name: "استلام",
              provider: "LOCAL",
              priceType: "free",
              price: 0,
              description: "استلام من الفرع ونقاط البيع مجاناً"
            },
            {
              id: "method-1-2",
              name: "توصيل محلي",
              provider: "LOCAL",
              priceType: "fixed",
              price: 2.0,
              description: "سعر ثابت"
            },
            {
              id: "method-1-3",
              name: "شحن",
              provider: "SMSA",
              priceType: "calculated",
              price: 3.5,
              description: "محسوب حسب الوزن والبلد (SMSA)"
            }
          ]
        },
        {
          id: "zone-2",
          name: "GCC",
          countries: ["أبو عريش", "بقيق", "أبها", "الرياض", "دبي", "سلطنة عمان", "السعودية", "الكويت", "المنطقة الشرقية"],
          cities: ["ABHA", "ABQAIQ", "ABU ARISH", "more 310+"],
          methods: []
        }
      ];
      setShippingZones(defaultZones);
      localStorage.setItem('ama_shipping_zones', JSON.stringify(defaultZones));
    }
  }, [activeTab]);

  // Match zone and select default shipping method dynamically base on country
  const matchingZone = shippingZones.find(zone => 
    zone.countries.some((c: string) => c.includes(customerCountry) || customerCountry.includes(c))
  ) || shippingZones[0];

  const availableShippingMethods = matchingZone ? matchingZone.methods : [];

  useEffect(() => {
    if (availableShippingMethods && availableShippingMethods.length > 0) {
      // Find default or first method
      setSelectedShippingMethod(availableShippingMethods[0]);
    } else {
      setSelectedShippingMethod(null);
    }
  }, [customerCountry, shippingZones]);

  // Load from local product array
  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setChosenSize(product.sizes[0] || 'M');
    setChosenColor(product.colors[0] || 'وردي فاتح');
    setQuantity(1);
  };

  const handleAddToCart = () => {
    if (!selectedProduct) return;
    const newItem: OrderItem = {
      product: selectedProduct,
      quantity: quantity,
      selectedSize: chosenSize,
      selectedColor: chosenColor
    };

    // Check if duplicate exists with same options
    const existingIndex = cart.findIndex(
      item => item.product.id === selectedProduct.id && 
              item.selectedColor === chosenColor && 
              item.selectedSize === chosenSize
    );

    if (existingIndex > -1) {
      const updated = [...cart];
      updated[existingIndex].quantity += quantity;
      setCart(updated);
    } else {
      setCart([...cart, newItem]);
    }

    setIsCartOpen(true);
    setSelectedProduct(null); // Close detail modal
  };

  const updateCartQty = (index: number, newQty: number) => {
    if (newQty < 1) return;
    const updated = [...cart];
    updated[index].quantity = newQty;
    setCart(updated);
  };

  const removeFromCart = (index: number) => {
    const updated = cart.filter((_, i) => i !== index);
    setCart(updated);
  };

  const applyCoupon = () => {
    setCouponError('');
    if (!couponCode.trim()) return;
    const found = coupons.find(c => c.code.toUpperCase() === couponCode.trim().toUpperCase() && c.isActive);
    if (found) {
      setActiveCoupon(found);
    } else {
      setCouponError('الكوبون المدخل غير فعال أو غير صحيح.');
      setActiveCoupon(null);
    }
  };

  // Calculations
  const calculatedSubtotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  
  const calculatedDiscount = activeCoupon 
    ? (activeCoupon.type === 'percentage' 
      ? (calculatedSubtotal * activeCoupon.discount / 100) 
      : activeCoupon.discount)
    : 0;
    
  const shippingCharge = selectedShippingMethod 
    ? (selectedShippingMethod.priceType === 'free' ? 0 : parseFloat(selectedShippingMethod.price))
    : (settings 
        ? (calculatedSubtotal >= settings.freeShippingThreshold ? 0 : settings.shippingCost)
        : 2.5);

  const totalCost = Math.max(0, calculatedSubtotal - calculatedDiscount + shippingCharge);

  // Submit checkout process
  const triggerPayment = () => {
    setIsPaying(true);
    
    // Simulate electronic gateway latencies
    setTimeout(() => {
      setIsPaying(false);
      
      const trackingNum = `AL-${Math.floor(10000 + Math.random() * 90000)}-${customerCountry === 'البحرين' ? 'BH' : 'GCC'}`;
      const orderId = `ord-${Date.now().toString().substring(9)}`;
      
      const brandNewOrder: Order = {
        id: orderId,
        trackingCode: trackingNum,
        customer: {
          name: customerName,
          email: customerEmail || 'guest@almaasa.bh',
          phone: customerPhone,
          address: customerAddress,
          city: customerCity,
          country: customerCountry
        },
        items: cart,
        subtotal: calculatedSubtotal,
        discount: calculatedDiscount,
        shippingFee: shippingCharge,
        total: totalCost,
        paymentMethod: paymentMethod,
        paymentStatus: 'paid', // Instant automatic payment approved in mock
        shippingStatus: 'pending',
        date: new Date().toISOString(),
        notes: customerNotes,
        timeline: [
          {
            title: 'تم استلام الطلب',
            description: 'تم تسجيل الطلبيّة في نظام كاشير ألماسة الإلكتروني بنجاح وجاري المراجعة بمديرية المتجر.',
            date: new Date().toISOString().replace('T', ' ').substring(0, 16),
            status: 'pending'
          },
          {
            title: 'تأكيد السداد الإلكتروني',
            description: `تم ترخيص المعاملة المالية وقيد الحساب بنجاح بواسطة ${paymentMethod.toUpperCase()} بقيمة ${totalCost.toFixed(2)} د.ب.`,
            date: new Date().toISOString().replace('T', ' ').substring(0, 16),
            status: 'pending'
          }
        ]
      };

      // Add to db
      const { orders } = getStoredData();
      const updatedOrders = [brandNewOrder, ...orders];
      saveStoredData({ orders: updatedOrders });
      
      // Operations Log Entry
      addOperationLog(
        `طلب شراء جديد قيد التجهيز #${orderId}`,
        `قامت العميلة ${customerName} بشراء عدد ${cart.length} منتج بقيمة إجمالية ${totalCost.toFixed(2)} د.ب مسددة إلكترونياً بـ ${paymentMethod}.`,
        'بوابة الدفع التلقائي',
        'order',
        'success'
      );

      // Successfully process coupons usage
      if (activeCoupon) {
        const updatedCoupons = coupons.map(c => {
          if (c.code === activeCoupon.code) {
            return { ...c, usageCount: c.usageCount + 1 };
          }
          return c;
        });
        setCoupons(updatedCoupons);
        saveStoredData({ coupons: updatedCoupons });
      }

      // Auto decrease products stock
      const { products: dbProducts } = getStoredData();
      const mappedProds = dbProducts.map((p: Product) => {
        const itemInCart = cart.find(ci => ci.product.id === p.id);
        if (itemInCart) {
          return { ...p, stock: Math.max(0, p.stock - itemInCart.quantity) };
        }
        return p;
      });
      setProducts(mappedProds);
      saveStoredData({ products: mappedProds });

      setNewOrder(brandNewOrder);
      setCart([]);
      setCheckoutStep('success');
      setActiveCoupon(null);
      setCouponCode('');
    }, 2000);
  };

  const handleTrackSearch = () => {
    setTrackError('');
    setTrackedOrder(null);
    if (!trackSearchQuery.trim()) return;

    const { orders } = getStoredData();
    const query = trackSearchQuery.trim().toLowerCase();
    
    // Search by code or mobile phone match
    const matched = orders.find((o: Order) => 
      o.trackingCode.toLowerCase() === query || 
      o.customer.phone.replace(/[\s+]/g, '').includes(query.replace(/[\s+]/g, ''))
    );

    if (matched) {
      setTrackedOrder(matched);
    } else {
      setTrackError('عذراً، لم نجد أي طلب مسجل برقم التتبع أو الهاتف المدخل. يرجى التحقق وإعادة المحاولة.');
    }
  };

  // Filtered views
  const filteredProducts = products.filter(product => {
    const isCategoryMatch = selectedCategory === 'all' || product.category === selectedCategory;
    const isSearchMatch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return isCategoryMatch && isSearchMatch;
  });

  return (
    <div className="bg-[#FAF6F6] min-h-screen text-slate-800 font-sans" dir="rtl" id="almaasa-storefront">
      
      {/* 1. Header Banner / Announcement */}
      <div className="bg-[#E4A0A0] text-white py-1.5 px-4 text-center text-xs font-semibold tracking-wide" id="global-announcement">
        ✨ مخاوير العيد وصلت! توصيل دولي سريع لكافة دول الخليج والعالم | شحن مجاني للطلبات فوق 50 د.ب ✨
      </div>

      {/* 2. Top Navigation Bar */}
      <nav className="sticky top-0 bg-white/90 backdrop-blur-md z-40 border-b border-rose-100 shadow-xs" id="main-nav">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="text-xl font-extrabold text-[#9A2D55] tracking-tight flex items-center gap-1 cursor-pointer" onClick={() => setActiveTab('shop')}>
              💎 ألمــاســة Boutique
            </span>
            <div className="hidden md:flex items-center gap-4 text-sm font-medium">
              <button 
                onClick={() => setActiveTab('shop')} 
                className={`py-1 px-3 rounded-full transition-all ${activeTab === 'shop' ? 'bg-[#9A2D55] text-white' : 'text-slate-600 hover:text-[#9A2D55]'}`}
                id="tab-shop-btn"
              >
                تسوّق المخاوير
              </button>
              <button 
                onClick={() => setActiveTab('tracking')} 
                className={`py-1 px-3 rounded-full transition-all ${activeTab === 'tracking' ? 'bg-[#9A2D55] text-white' : 'text-slate-600 hover:text-[#9A2D55]'}`}
                id="tab-track-btn"
              >
                تتبع طلبي وشحنكِ ✈️
              </button>
              <button 
                onClick={() => setShowReviewsPopup(true)} 
                className="text-slate-600 hover:text-[#9A2D55] text-sm py-1 px-2"
                id="reviews-pop-trigger"
              >
                آراء الزبائن ⭐
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">

            {/* Cart Trigger Button */}
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 bg-rose-50 text-[#9A2D55] hover:bg-rose-100 rounded-full transition-all cursor-pointer"
              id="cart-trigger-btn"
            >
              <ShoppingBag className="w-5 h-5" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-bounce">
                  {cart.reduce((s, i) => s + i.quantity, 0)}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Main Core Body */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        
        {/* SHOP TAB VIEW */}
        {activeTab === 'shop' && (
          <div>
            {/* 3. Instagram Branding Profile Section (Renders elements in Image 1 exactly) */}
            <div className="bg-white rounded-3xl border border-rose-50 p-6 md:p-8 shadow-xs mb-8" id="store-brand-profile">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-10">
                
                {/* Premium Instagram Profile Circle Avatar */}
                <div className="relative">
                  <div className="w-28 h-28 md:w-32 md:h-32 rounded-full p-1 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 flex items-center justify-center shadow-md">
                    <div className="w-full h-full rounded-full bg-white p-1 flex items-center justify-center overflow-hidden">
                      {/* Generates logo visual with initials to exactly echo ALMAASA style */}
                      <div className="w-full h-full rounded-full bg-rose-50 flex flex-col items-center justify-center text-[#9A2D55] border border-rose-100">
                        <span className="font-serif text-2xl font-bold tracking-tight">ألمـاسة</span>
                        <span className="text-[10px] uppercase font-mono tracking-widest text-[#E4A0A0]" style={{ letterSpacing: '0.2em' }}>ALMAASA</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Profile Meta Stats & Bio details */}
                <div className="flex-1 text-center md:text-right">
                  <div className="flex flex-col md:flex-row items-center gap-3 mb-3">
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight" id="profile-handle">almaasa.bh</h1>
                    <span className="text-rose-500 text-sm font-semibold border border-rose-100 rounded-full px-2.5 py-0.5 bg-rose-50 flex items-center gap-1">
                      مخاوير ألماسة 💎
                    </span>
                  </div>

                  <div className="flex items-center justify-center md:justify-start gap-6 my-4 border-y border-rose-50 py-3 md:border-y-0 md:py-0 text-sm">
                    <div><strong className="text-slate-900 block font-bold text-lg">1,796</strong> <span className="text-slate-400 text-xs">منشور</span></div>
                    <div><strong className="text-slate-900 block font-bold text-lg">35.3K</strong> <span className="text-slate-400 text-xs">متابع</span></div>
                    <div><strong className="text-slate-900 block font-bold text-lg">1</strong> <span className="text-slate-400 text-xs">يتابعه</span></div>
                  </div>

                  <div className="space-y-1 mb-5 text-sm leading-relaxed" id="profile-bio text">
                    <p className="text-slate-500 font-bold">Brand</p>
                    <p className="font-extrabold text-[#9A2D55]">BH</p>
                    <p className="text-slate-600 font-semibold">💎 مخاوير ألماسة</p>
                    <p className="text-slate-600 flex items-center justify-center md:justify-start gap-1">
                      <span>✈️🇧🇭 توصيل لجميع دول العالم</span>
                    </p>
                    <a 
                      href="https://wa.me/97337037697" 
                      target="_blank" 
                      referrerPolicy="no-referrer" 
                      className="inline-flex items-center gap-1.5 text-blue-500 hover:underline font-semibold dir-ltr text-xs bg-blue-50 py-1 px-2.5 rounded-lg border border-blue-100"
                    >
                      <Phone className="w-3 h-3 text-emerald-500" /> WhatsApp: +973 37037697
                    </a>
                  </div>

                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                    <a 
                      href="https://wa.me/97337037697" 
                      target="_blank"
                      referrerPolicy="no-referrer"
                      className="bg-[#9A2D55] text-white hover:bg-[#802446] px-8 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
                    >
                      تواصل واتس للطلب الخاص
                    </a>
                    <button 
                      onClick={() => setShowReviewsPopup(true)}
                      className="bg-white text-[#9A2D55] border border-[#9A2D55] hover:bg-rose-50 px-6 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer"
                    >
                      آراء زبائننا السعداء (متدفق)
                    </button>
                  </div>
                </div>
              </div>

              {/* 4. Circular Highlights (القصص البارزة) as visual category filters exactly matching user request */}
              <div className="mt-8 pt-6 border-t border-rose-50" id="stories-highlights">
                <p className="text-xs font-bold text-slate-400 mb-4 tracking-wider uppercase text-center md:text-right">أقسام المتجر والقصص البارزة 💎</p>
                <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-none justify-start md:justify-start px-2">
                  
                  {/* Circle 1 - All */}
                  <button 
                    onClick={() => setSelectedCategory('all')}
                    className="flex flex-col items-center gap-2 shrink-0 group cursor-pointer focus:outline-none"
                  >
                    <div className={`w-16 h-16 rounded-full p-0.5 border-2 transition-all ${selectedCategory === 'all' ? 'border-[#9A2D55]' : 'border-rose-100 group-hover:border-[#9A2D55]'}`}>
                      <div className="w-full h-full rounded-full bg-linear-to-br from-rose-100 to-[#FAF6F6] flex items-center justify-center text-[#9A2D55]">
                        <BookOpen className="w-6 h-6" />
                      </div>
                    </div>
                    <span className={`text-[11px] font-bold ${selectedCategory === 'all' ? 'text-[#9A2D55] font-extrabold' : 'text-slate-600'}`}>الكل</span>
                  </button>

                  {/* Highlights matching specific images tags */}
                  {categories.filter(c => c.id !== 'all').map((cat) => (
                    <button 
                      key={cat.id} 
                      onClick={() => setSelectedCategory(cat.id)}
                      className="flex flex-col items-center gap-2 shrink-0 group cursor-pointer focus:outline-none"
                    >
                      <div className={`w-16 h-16 rounded-full p-0.5 border-2 transition-all ${selectedCategory === cat.id ? 'border-[#9A2D55]' : 'border-rose-100 group-hover:border-[#9A2D55]'}`}>
                        <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden border border-rose-100 p-0.5">
                          {/* Use soft abstract colors or initials for highlight thumb */}
                          <div className="w-full h-full rounded-full bg-rose-50/50 flex items-center justify-center text-[#9A2D55] text-xs font-bold">
                            ⚜️
                          </div>
                        </div>
                      </div>
                      <span className={`text-[11px] font-bold ${selectedCategory === cat.id ? 'text-[#9A2D55] font-extrabold' : 'text-slate-600'}`}>
                        {cat.name}
                      </span>
                    </button>
                  ))}

                  {/* Custom Review Circle Trigger */}
                  <button 
                    onClick={() => setShowReviewsPopup(true)} 
                    className="flex flex-col items-center gap-2 shrink-0 group cursor-pointer"
                  >
                    <div className="w-16 h-16 rounded-full p-0.5 border-2 border-rose-100 group-hover:border-[#9A2D55]">
                      <div className="w-full h-full rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                        <Star className="w-6 h-6 fill-emerald-500 text-emerald-500 animate-spin" style={{ animationDuration: '6s' }} />
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-slate-600">رأي الزباااين</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 5. Search Bar & Summary details */}
            <div className="bg-white rounded-2xl border border-rose-100 p-4 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="relative w-full md:max-w-md">
                <input 
                  type="text" 
                  placeholder="ابحثي عن مخورك المفضل، قطن أو قماش شيفون..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#FAF6F6] text-slate-800 border border-rose-100 rounded-xl pr-10 pl-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#9A2D55] focus:bg-white"
                />
                <Search className="absolute right-3.5 top-3.5 w-4 h-4 text-rose-400" />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute left-3 top-3.5 text-rose-400 hover:text-slate-600">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="text-xs font-bold text-slate-500 text-center md:text-left flex items-center gap-2">
                <span>القسم المختار:</span>
                <span className="text-[#9A2D55] bg-rose-50 px-2.5 py-1 rounded-md border border-rose-100">
                  {categories.find(c => c.id === selectedCategory)?.name || 'الكل'}
                </span>
                <span>|</span>
                <span>يعرض {filteredProducts.length} قطعة مخور وتوابعه</span>
              </div>
            </div>

            {/* 6. Product Grid (Bespoke Luxury Cards layout) */}
            {filteredProducts.length === 0 ? (
              <div className="bg-white border rounded-2xl p-12 text-center text-slate-500">
                <ShoppingBag className="w-12 h-12 text-rose-200 mx-auto mb-3" />
                <p className="text-lg font-bold">عذراً، لا توجد مخاوير مطابقة لبحثك الحالي.</p>
                <button onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }} className="mt-3 text-[#9A2D55] underline text-sm font-semibold">
                  عرض جميع المخاوير المتوفرة
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8" id="products-catalog-grid">
                {filteredProducts.map((product) => (
                  <div 
                    key={product.id}
                    onClick={() => handleProductClick(product)}
                    className="bg-white rounded-3xl border border-rose-50 overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 group cursor-pointer flex flex-col h-full hover:-translate-y-1"
                  >
                    {/* Visual Media Section */}
                    <div className="relative aspect-square w-full bg-slate-100 overflow-hidden">
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                      {/* Floating badgings */}
                      {product.originalPrice && (
                        <span className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-xs">
                          خصم {Math.round(((product.originalPrice - product.price)/product.originalPrice)*100)}%
                        </span>
                      )}
                      
                      {product.hasSheilah && (
                        <span className="absolute top-3 left-3 bg-teal-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-xs">
                          مخور مع شيلة 🧕
                        </span>
                      )}

                      {/* Low Stock Watch */}
                      {product.stock <= 5 && product.stock > 0 && (
                        <span className="absolute bottom-3 right-3 bg-amber-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                          تبقى {product.stock} قطع فقط ⏰
                        </span>
                      )}

                      {product.stock === 0 && (
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center text-white text-lg font-extrabold tracking-wide">
                          نفدت الكمية 🚫
                        </div>
                      )}
                    </div>

                    {/* Meta info */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] bg-rose-50 text-[#9A2D55] font-bold px-2 py-0.5 rounded-full uppercase">
                            {categories.find(c => c.id === product.category)?.name || 'مخور'}
                          </span>
                          <div className="flex items-center gap-0.5 text-amber-500 text-xs font-bold">
                            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                            <span>{product.rating}</span>
                            <span className="text-slate-400">({product.reviewCount})</span>
                          </div>
                        </div>

                        <h3 className="text-slate-800 font-bold text-base group-hover:text-[#9A2D55] transition-colors line-clamp-1 mb-2">
                          {product.name}
                        </h3>

                        <p className="text-slate-400 text-xs mb-4 line-clamp-2 leading-relaxed">
                          {product.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-rose-50">
                        <div className="flex items-baseline gap-1.5 font-sans">
                          <span className="text-lg font-bold text-[#9A2D55]">{product.price.toFixed(2)} د.ب</span>
                          {product.originalPrice && (
                            <span className="text-xs text-slate-300 line-through">{product.originalPrice.toFixed(2)} د.ب</span>
                          )}
                        </div>

                        <span className="text-xs text-[#9A2D55] font-bold group-hover:underline flex items-center gap-1">
                          تحديد الخيارات ⚜️
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ORDER TRACKING TAB VIEW */}
        {activeTab === 'tracking' && (
          <div className="max-w-2xl mx-auto" id="order-tracking-panel">
            <div className="bg-white rounded-3xl border border-rose-50 p-6 md:p-8 shadow-sm">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-rose-100 text-[#9A2D55] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Truck className="w-8 h-8 animate-bounce" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">تتبع شحنتك الماسية ✈️</h2>
                <p className="text-slate-500 text-sm">
                  أدخلي رقم التتبع الخاص بكِ (مثال: <span className="font-mono bg-rose-50 px-1 py-0.5 rounded text-[#9A2D55]">AL-92813-BH</span>) أو رقم الهاتف المستخدم عند إتمام الطلب لمعاينة خط سير الشحنة لحظة بلحظة.
                </p>
              </div>

              {/* Input section */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-rose-100 flex gap-2">
                <input 
                  type="text" 
                  placeholder="رقم التتبع أو رقم الهاتف (973xxxxxxxx)..."
                  value={trackSearchQuery}
                  onChange={(e) => setTrackSearchQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleTrackSearch(); }}
                  className="flex-1 bg-white border border-rose-100 text-slate-800 font-medium rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#9A2D55]"
                />
                <button 
                  onClick={handleTrackSearch}
                  className="bg-[#9A2D55] hover:bg-[#802446] text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-xs transition-all cursor-pointer"
                >
                  تتبع الآن
                </button>
              </div>

              {trackError && (
                <div className="mt-4 p-3 bg-red-50 text-red-600 border border-red-100 text-xs rounded-xl flex items-center gap-2">
                  <span>⚠️</span>
                  <p className="font-semibold">{trackError}</p>
                </div>
              )}

              {/* Tracking Results */}
              <AnimatePresence mode="wait">
                {trackedOrder ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-8 border-t border-rose-50 pt-6"
                  >
                    {/* Header info */}
                    <div className="bg-rose-50/50 rounded-2xl p-4 border border-rose-100/50 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="text-center sm:text-right">
                        <span className="text-[10px] text-slate-400 block font-bold">رقم التتبع الشحنة</span>
                        <span className="font-mono font-bold text-[#9A2D55] text-lg">{trackedOrder.trackingCode}</span>
                      </div>
                      <div className="text-center sm:text-left">
                        <span className="text-[10px] text-slate-400 block font-bold">حالة الشحن الحالية</span>
                        <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full mt-1 ${
                          trackedOrder.shippingStatus === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                          trackedOrder.shippingStatus === 'shipped' ? 'bg-blue-100 text-blue-800' :
                          trackedOrder.shippingStatus === 'processing' ? 'bg-amber-100 text-amber-800' :
                          'bg-slate-100 text-slate-800'
                        }`}>
                          {trackedOrder.shippingStatus === 'delivered' ? 'تم التسليم بنجاح ✓' :
                           trackedOrder.shippingStatus === 'shipped' ? 'قيد الشحن الدولي ✈️' :
                           trackedOrder.shippingStatus === 'processing' ? 'جاري تجهيز المخور ⚜️' :
                           'طلب معلّق'}
                        </span>
                      </div>
                    </div>

                    {/* Order metadata summary */}
                    <div className="mb-6 bg-slate-50 rounded-2xl p-4 text-xs font-medium space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-400">اسم المستلمة:</span>
                        <strong className="text-slate-800">{trackedOrder.customer.name}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">العنوان:</span>
                        <strong className="text-slate-800">{trackedOrder.customer.address}, {trackedOrder.customer.city}, {trackedOrder.customer.country}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">المنتجات:</span>
                        <strong className="text-slate-800">
                          {trackedOrder.items.map(item => `${item.product.name} (مقاس ${item.selectedSize})`).join('، ')}
                        </strong>
                      </div>
                    </div>

                    {/* Vertical tracking timeline chart */}
                    <div className="relative pl-4 space-y-6 before:absolute before:top-2 before:bottom-2 before:right-3.5 before:w-0.5 before:bg-rose-100">
                      
                      {trackedOrder.timeline.map((event, index) => (
                        <div key={index} className="relative flex items-start gap-4 pr-10">
                          {/* Dot item */}
                          <div className={`absolute right-1  w-5 h-5 rounded-full border-4 bg-white flex items-center justify-center ${
                            // Highlight final or passed status
                            index === trackedOrder.timeline.length - 1 ? 'border-[#9A2D55] scale-110 shadow-xs' : 'border-rose-200'
                          }`}>
                            {index === trackedOrder.timeline.length - 1 && (
                              <div className="w-2 h-2 bg-[#9A2D55] rounded-full" />
                            )}
                          </div>

                          <div className="flex-1 bg-slate-50 hover:bg-white rounded-2xl px-5 py-4 border border-rose-50 shadow-2xs transition-all">
                            <span className="text-[10px] text-slate-400 font-mono block mb-1">{event.date}</span>
                            <h4 className="font-bold text-sm text-slate-800 mb-1">{event.title}</h4>
                            <p className="text-xs text-slate-500 leading-relaxed font-semibold">{event.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-8 text-center bg-rose-50 border border-dashed border-rose-200 rounded-2xl p-4 text-xs font-bold text-slate-500">
                      هل لديك اعتراض أو استفسار؟ اتصلي بنا عبر رقم المتجر الموحد: <a href="https://wa.me/97337037697" className="text-emerald-600 underline">+973 37037697</a>
                    </div>
                  </motion.div>
                ) : (
                  <div className="mt-8 text-center text-slate-400 py-6 border border-dashed border-rose-100 rounded-2xl">
                    <Clock className="w-8 h-8 text-rose-200 mx-auto mb-2 animate-pulse" />
                    <p className="text-sm font-semibold">بانتظار إدخال رقم الطلب / الهاتف للتحرك...</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 mt-16 border-t border-rose-50/10">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 text-center md:text-right" id="footer-bento border">
            <div>
              <span className="text-xl font-bold text-white mb-4 block">متجر مخاوير ألماسة 💎</span>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                متجرك الأول الآمن للحصول على أرقى تصاميم المخاوير الكويتية، البحرينية، والإماراتية المخصصة للأفراح والأعياد. تفصيل ودقة تصنيع تتوارثها الأجيال.
              </p>
            </div>
            <div>
              <span className="text-sm font-bold text-white mb-4 block">روابط مفيدة</span>
              <ul className="text-xs space-y-2 font-semibold">
                <li><button onClick={() => { setActiveTab('shop'); window.scrollTo(0, 0); }} className="hover:text-[#E4A0A0]">تسوّق الكتالوج</button></li>
                <li><button onClick={() => { setActiveTab('tracking'); window.scrollTo(0, 0); }} className="hover:text-[#E4A0A0]">تتبع الطلبات والشحنات</button></li>
                <li><button onClick={() => setShowReviewsPopup(true)} className="hover:text-[#E4A0A0]">سجل آراء وتقييمات العملاء</button></li>
              </ul>
            </div>
            <div>
              <span className="text-sm font-bold text-white mb-4 block">قنوات دفع خليجية آمنة</span>
              <p className="text-xs text-slate-500 leading-relaxed mb-3">
                ندعم الدفع الإلكتروني المباشر عبر بنفت بي (البحرين)، كي نت (الكويت)، وكافة البطاقات الائتمانية مع تشفير كامل للبيانات 🔐.
              </p>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                <span className="bg-[#FAF6F6] text-blue-900 border border-rose-100 text-[10px] font-extrabold px-2 py-1 rounded">BenefitPay</span>
                <span className="bg-[#FAF6F6] text-cyan-800 border border-rose-100 text-[10px] font-extrabold px-2 py-1 rounded">KNet</span>
                <span className="bg-[#FAF6F6] text-slate-900 border border-rose-100 text-[10px] font-extrabold px-2 py-1 rounded">Credit Card</span>
                <span className="bg-[#FAF6F6] text-slate-900 border border-rose-100 text-[10px] font-extrabold px-2 py-1 rounded">Apple Pay</span>
              </div>
            </div>
          </div>

         <div className="border-t border-slate-800 pt-6 text-center text-[10px] text-slate-500 font-bold">
            <p>© 2026 مخاوير ألماسة (almaasa.bh). جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>


      {/* MODAL 1: Product detail dialog (Sizes, custom properties, colors, adding, price) */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4" id="prod-detail-modal">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-rose-50 flex flex-col md:flex-row"
            >
              
              {/* Product Media Layout */}
              <div className="md:w-1/2 relative aspect-square md:aspect-auto md:h-inherit bg-slate-50 min-h-[300px]">
                <img 
                  src={selectedProduct.image} 
                  alt={selectedProduct.name} 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover" 
                />
                
                {/* Close Button */}
                <button 
                  onClick={() => setSelectedProduct(null)} 
                  className="absolute top-4 right-4 bg-white/80 hover:bg-white text-slate-700 p-2 rounded-full shadow-md cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Product Configurations Block */}
              <div className="p-6 md:p-8 flex-1 flex flex-col justify-between">
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#9A2D55] bg-rose-50 px-2 py-0.5 rounded-full">
                      {categories.find(c => c.id === selectedProduct.category)?.name || 'مخور'}
                    </span>
                    <button 
                      onClick={() => {
                        const guide = selectedProduct.category === 'kids' ? 'g-2' : 'g-1';
                        setShowSizeGuide(guide);
                      }}
                      className="text-xs text-[#9A2D55] underline hover:text-[#802446] font-bold"
                      id="guide-trigger"
                    >
                      📏 عرض دليل مقاسات المخاور المعتمدة
                    </button>
                  </div>

                  <h2 className="text-xl font-bold text-slate-800 mb-2 leading-tight">{selectedProduct.name}</h2>
                  
                  <div className="flex items-baseline gap-2 my-3 font-sans">
                    <span className="text-2xl font-extrabold text-[#9A2D55]">{selectedProduct.price.toFixed(2)} د.ب</span>
                    {selectedProduct.originalPrice && (
                      <span className="text-sm text-slate-300 line-through">{selectedProduct.originalPrice.toFixed(2)} د.ب</span>
                    )}
                  </div>

                  <p className="text-slate-500 text-xs leading-relaxed mb-6 font-semibold">{selectedProduct.description}</p>

                  {/* 1. SELECT SIZE */}
                  <div className="mb-4">
                    <span className="text-xs font-bold text-slate-400 block mb-2">اختر المقاس (أنش / Inches):</span>
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.sizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => setChosenSize(size)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            chosenSize === size 
                              ? 'bg-[#9A2D55] text-white border border-[#9A2D55]' 
                              : 'bg-slate-50 hover:bg-rose-50 text-slate-700 border border-rose-50'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 2. SELECT COLOR */}
                  <div className="mb-6">
                    <span className="text-xs font-bold text-slate-400 block mb-2">اللون المفضّل للتطريز ومطاطة القماش:</span>
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.colors.map((color) => (
                        <button
                          key={color}
                          onClick={() => setChosenColor(color)}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            chosenColor === color 
                              ? 'bg-[#9A2D55]/10 text-[#9A2D55] border-2 border-[#9A2D55]' 
                              : 'bg-slate-50 hover:bg-rose-50 text-slate-700 border border-rose-50'
                          }`}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 3. PRODUCT PROPERTIES TABLE */}
                  <div className="bg-slate-50 rounded-2xl p-4 mb-6 border border-rose-50">
                    <span className="text-[11px] font-bold text-slate-400 block mb-2">تفاصيل القطعة واللمسات:</span>
                    <div className="grid grid-cols-2 gap-2 text-xs font-bold text-slate-600">
                      {selectedProduct.properties.map((prop, idx) => (
                        <div key={idx} className="flex flex-col bg-white p-2 rounded-lg border border-rose-50/50">
                          <span className="text-[9px] text-slate-400 font-semibold">{prop.label}:</span>
                          <span className="text-slate-800 line-clamp-1">{prop.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Adding controller */}
                <div className="pt-4 border-t border-rose-50 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 bg-slate-100 rounded-xl px-3 py-1.5 border border-rose-50">
                    <button 
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="p-1 text-slate-500 hover:text-slate-800 transition"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-6 text-center text-sm font-bold text-slate-800">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(q => q + 1)}
                      className="p-1 text-slate-500 hover:text-[#9A2D55] transition"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    disabled={selectedProduct.stock === 0}
                    className="flex-1 bg-[#9A2D55] hover:bg-[#802446] disabled:bg-slate-300 text-white font-bold py-3 px-6 rounded-xl text-center shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    <span>إضافة لسلة المشتريات الماسية</span>
                  </button>
                </div>

              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>


      {/* MODAL 2: Interactive Shopping Cart Drawer & Checkout Steps */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex justify-end" id="shopping-cart-drawer">
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-white w-full max-w-md h-full flex flex-col justify-between shadow-2xl border-r border-rose-100"
            >
              
              {/* Header */}
              <div className="p-4 border-b border-rose-50 flex items-center justify-between bg-rose-50/50">
                <div className="flex items-center gap-2 text-[#9A2D55]">
                  <ShoppingBag className="w-5 h-5" />
                  <span className="font-bold text-base">سلة المشتريات والطلب الإلكتروني</span>
                </div>
                <button onClick={() => setIsCartOpen(false)} className="p-1 bg-white hover:bg-slate-100 rounded-lg text-slate-500 border border-rose-100 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Multi-step Checkout Controller */}
              <div className="flex-1 overflow-y-auto p-4">
                
                {/* Process Stepper Visual */}
                <div className="flex items-center justify-around mb-6 text-[10px] font-bold border-b border-rose-50 pb-4 text-slate-400">
                  <span className={`${checkoutStep === 'cart' ? 'text-[#9A2D55] scale-105' : 'text-slate-400'}`}>1. السلة ({cart.length})</span>
                  <ChevronRight className="w-3 h-3 text-rose-300" />
                  <span className={`${checkoutStep === 'details' ? 'text-[#9A2D55] scale-105' : 'text-slate-400'}`}>2. بيانات الشحن</span>
                  <ChevronRight className="w-3 h-3 text-rose-300" />
                  <span className={`${checkoutStep === 'payment' ? 'text-[#9A2D55] scale-105' : 'text-slate-400'}`}>3. الدفع الإلكتروني</span>
                </div>

                {/* STEP A: VIEW CART ITEMS */}
                {checkoutStep === 'cart' && (
                  <div>
                    {cart.length === 0 ? (
                      <div className="text-center py-12 text-slate-400">
                        <ShoppingBag className="w-12 h-12 text-rose-100 mx-auto mb-3" />
                        <p className="text-sm font-bold">حقيبة تسوّقكِ فارغة تماماً.</p>
                        <button onClick={() => { setIsCartOpen(false); setActiveTab('shop'); }} className="mt-4 bg-[#9A2D55] text-white font-bold py-2 px-6 rounded-xl text-xs hover:bg-[#802446]">
                          تصفحي مخاوير العيد
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {cart.map((item, index) => (
                          <div key={index} className="flex gap-3 bg-slate-50 p-3 rounded-2xl border border-rose-50/50">
                            <div className="w-16 h-16 rounded-xl bg-slate-200 overflow-hidden shrink-0">
                              <img src={item.product.image} alt={item.product.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 flex flex-col justify-between">
                              <div>
                                <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{item.product.name}</h4>
                                <span className="text-[10px] text-slate-400 font-bold block mt-0.5">
                                  مقاس: {item.selectedSize} | لون: {item.selectedColor}
                                </span>
                              </div>
                              <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center gap-1.5 bg-white border border-rose-100 rounded-md py-0.5 px-2">
                                  <button onClick={() => updateCartQty(index, item.quantity - 1)} className="text-slate-400 hover:text-slate-800"><Minus className="w-3 h-3" /></button>
                                  <span className="text-xs font-bold text-slate-700 w-5 text-center">{item.quantity}</span>
                                  <button onClick={() => updateCartQty(index, item.quantity + 1)} className="text-slate-400 hover:text-[#9A2D55]"><Plus className="w-3 h-3" /></button>
                                </div>
                                <span className="text-xs font-bold text-[#9A2D55] font-sans">{(item.product.price * item.quantity).toFixed(2)} د.ب</span>
                              </div>
                            </div>
                            <button onClick={() => removeFromCart(index)} className="text-slate-300 hover:text-red-500 shrink-0 self-start p-1 cursor-pointer">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}

                        {/* Promo Coupon Form */}
                        <div className="bg-rose-50/30 border border-rose-100 rounded-2xl p-4 mt-6">
                          <label className="text-xs font-bold text-slate-500 block mb-2">هل لديكِ كوبون خصم ألماسة؟ 🎟️</label>
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              placeholder="ALMAASA10 أو EID2026..."
                              value={couponCode}
                              onChange={(e) => setCouponCode(e.target.value)}
                              className="flex-1 max-w-[170px] bg-white border border-rose-100 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#9A2D55] uppercase"
                            />
                            <button 
                              onClick={applyCoupon}
                              className="bg-[#9A2D55] hover:bg-[#802446] text-white text-xs font-bold rounded-xl px-4 py-1.5 shrink-0"
                            >
                              تفعيل الخصم
                            </button>
                          </div>
                          {activeCoupon && (
                            <p className="text-[10px] text-emerald-600 font-bold mt-2 flex items-center gap-1">
                              ✓ تم تطبيق كود {activeCoupon.code}: خصم {activeCoupon.type === 'percentage' ? `${activeCoupon.discount}%` : `${activeCoupon.discount.toFixed(2)} د.ب`} بنجاح!
                            </p>
                          )}
                          {couponError && (
                            <p className="text-[10px] text-red-500 font-bold mt-2">
                              {couponError}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}


                {/* STEP B: BUYER SHPPING ADDRESS DETAILS */}
                {checkoutStep === 'details' && (
                  <div className="space-y-4 font-semibold text-xs" id="buyer-details-form">
                    <h3 className="font-bold text-sm text-slate-700 mb-3 border-b border-rose-50 pb-2">بيانات مستلمة الشحنة 📦</h3>
                    
                    <div>
                      <label className="text-slate-500 block mb-1">اسم العميل الثلاثي للبوليسية *</label>
                      <input 
                        required
                        type="text" 
                        placeholder="فاطمة البوعينين"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full bg-slate-50 border border-rose-100 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-[#9A2D55]"
                      />
                    </div>

                    <div>
                      <label className="text-slate-500 block mb-1">رقم الهاتف عبر الواتساب للتنسيق والدفع *</label>
                      <div className="relative">
                        <input 
                          required
                          type="tel" 
                          placeholder="97337037697"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          className="w-full bg-slate-50 border border-rose-100 rounded-xl px-4 py-2.5 text-sm text-left dir-neutral focus:outline-none focus:ring-1 focus:ring-[#9A2D55]"
                        />
                        <span className="absolute left-3.5 top-3.1 text-slate-400 text-[10px]">دولي</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-slate-500 block mb-1">البريد الإلكتروني للإشعارات والرمز الرقمي</label>
                      <input 
                        type="email" 
                        placeholder="aisha@example.com"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        className="w-full bg-slate-50 border border-rose-100 rounded-xl px-4 py-2.5 text-sm text-left dir-neutral focus:outline-none focus:ring-1 focus:ring-[#9A2D55]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-slate-500 block mb-1">الدولة الخليجية *</label>
                        <select 
                          value={customerCountry}
                          onChange={(e) => setCustomerCountry(e.target.value)}
                          className="w-full bg-slate-50 border border-rose-100 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#9A2D55]"
                        >
                          <option value="البحرين">البحرين 🇧🇭</option>
                          <option value="السعودية">السعودية 🇸🇦</option>
                          <option value="الكويت">الكويت 🇰🇼</option>
                          <option value="الإمارات">الإمارات 🇦🇪</option>
                          <option value="قطر">قطر 🇶🇦</option>
                          <option value="عمان">عمان 🇴🇲</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-slate-500 block mb-1">المدينة الحضرية *</label>
                        <input 
                          required
                          type="text" 
                          placeholder="الرفاع / الجسرة / المنامة"
                          value={customerCity}
                          onChange={(e) => setCustomerCity(e.target.value)}
                          className="w-full bg-slate-50 border border-rose-100 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#9A2D55]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-slate-500 block mb-1">عنوان التوصيل بالتفصيل (رقم المنزل والشارع والمجمع) *</label>
                      <textarea 
                        required
                        placeholder="طريق 1221، فيلا 93، مجمع البديع"
                        value={customerAddress}
                        onChange={(e) => setCustomerAddress(e.target.value)}
                        rows={2}
                        className="w-full bg-slate-50 border border-rose-100 rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#9A2D55]"
                      />
                    </div>

                    <div>
                      <label className="text-slate-500 block mb-1">ملاحظات إضافية للمخيط والتغليف (اختياري)</label>
                      <textarea 
                        placeholder="تطريز أكمام واسعة، مع بطانة داخلية إضافية..."
                        value={customerNotes}
                        onChange={(e) => setCustomerNotes(e.target.value)}
                        rows={2}
                        className="w-full bg-slate-50 border border-rose-100 rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#9A2D55]"
                      />
                    </div>

                    {/* Dynamic Shipping Method Selector selection */}
                    <div className="pt-2" id="dynamic-shipping-methods-container">
                      <label className="text-slate-500 block mb-2 font-bold text-xs">خيارات وبوابات التوصيل المتاحة لبلدكِ *</label>
                      {availableShippingMethods.length === 0 ? (
                        <div className="bg-slate-50 border border-amber-150 text-amber-800 p-4 rounded-2xl text-[11px] font-semibold leading-normal">
                          ⚠️ لا تتوفر طرق توصيل معرفة لبلدكِ حالياً. سيقوم فريق الدعم بالتنسيق المباشر معكِ لتحديد سعر الشحن الملائم لطلبكِ.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-2">
                          {availableShippingMethods.map((method: any) => (
                            <label 
                              key={method.id}
                              className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                                selectedShippingMethod?.id === method.id 
                                  ? 'bg-rose-50/50 border-[#9A2D55] text-[#9A2D55] ring-1 ring-[#9A2D55]/10' 
                                  : 'bg-white border-rose-100 text-slate-700 hover:bg-slate-50/10'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <input 
                                  type="radio"
                                  name="shipping_method_radio"
                                  checked={selectedShippingMethod?.id === method.id}
                                  onChange={() => setSelectedShippingMethod(method)}
                                  className="w-4 h-4 text-[#9A2D55] focus:ring-[#9A2D55] accent-[#9A2D55]"
                                />
                                <div className="text-right">
                                  <span className="font-extrabold text-xs block text-slate-800">
                                    {method.name} 
                                    <span className="mr-1.5 bg-rose-50 text-[#9A2D55] px-1.5 py-0.2 rounded text-[8px] font-mono leading-none font-black inline-block">
                                      {method.provider}
                                    </span>
                                  </span>
                                  {method.description && (
                                    <span className="text-[10px] text-slate-400 block mt-0.5 font-semibold">
                                      {method.description}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <span className="text-xs font-black font-mono">
                                {method.priceType === 'free' ? 'مـجـانـاً' : `${parseFloat(method.price).toFixed(3)} د.ب`}
                              </span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}


                {/* STEP C: SIMULATED MIDDLE-EASTERN PAYMENT LOGIC WITH SPECIFIC APPS */}
                {checkoutStep === 'payment' && (
                  <div className="space-y-4 font-semibold text-xs" id="secure-payment-ports">
                    <h3 className="font-bold text-sm text-slate-700 mb-2 flex items-center gap-1.5">
                      <ShieldCheck className="w-5 h-5 text-emerald-500" />
                      <span>قنوات التشفير السريعة والدفع الموحد</span>
                    </h3>

                    <p className="text-slate-400 text-[10px] leading-relaxed mb-4">
                      يرجى اختيار التطبيق أو القناة الملائمة لكِ للدفع المباشر، جاري تسجيل طلبيتك بأرقام الخادم لضمان أمان أموالك.
                    </p>

                    {/* SELECT METHOD TOGGLES */}
                    <div className="grid grid-cols-2 gap-2" id="payment-method-selector-grid">
                      {/* BenefitPay - Bahrain */}
                      <button 
                        onClick={() => { setPaymentMethod('benefit'); setBenefitStep('input'); }}
                        className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                          paymentMethod === 'benefit' 
                            ? 'bg-rose-50/70 border-[#9A2D55] text-[#9A2D55]' 
                            : 'bg-white border-rose-100 text-slate-600 hover:bg-rose-50/20'
                        }`}
                      >
                        <span className="text-[10.5px] font-extrabold">بـنـفـت بـي (BenefitPay) 🇧🇭</span>
                        <span className="text-[8px] text-slate-400">تحويل سريع / رقم الهاتف</span>
                      </button>

                      {/* KNet - Kuwait */}
                      <button 
                        onClick={() => setPaymentMethod('knet')}
                        className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                          paymentMethod === 'knet' 
                            ? 'bg-rose-50/70 border-[#9A2D55] text-[#9A2D55]' 
                            : 'bg-white border-rose-100 text-slate-600 hover:bg-rose-50/20'
                        }`}
                      >
                        <span className="text-[10.5px] font-extrabold">كي نــت (KNet) 🇰🇼</span>
                        <span className="text-[8px] text-slate-400">شبكة الاتصال والخصم للدولة</span>
                      </button>

                      {/* Unified GCC Visa/Mastercard */}
                      <button 
                        onClick={() => setPaymentMethod('card')}
                        className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                          paymentMethod === 'card' 
                            ? 'bg-rose-50/70 border-[#9A2D55] text-[#9A2D55]' 
                            : 'bg-white border-rose-100 text-slate-600 hover:bg-rose-50/20'
                        }`}
                      >
                        <CreditCard className="w-5 h-5 text-slate-700" />
                        <span className="text-[10.5px] font-extrabold">بطاقة بنكية ومنافذ مدى</span>
                        <span className="text-[8px] text-slate-400">فيزا وسداد ماستركارد</span>
                      </button>

                      {/* Apple Pay mock */}
                      <button 
                        onClick={() => setPaymentMethod('applepay')}
                        className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                          paymentMethod === 'applepay' 
                            ? 'bg-rose-50/70 border-[#9A2D55] text-[#9A2D55]' 
                            : 'bg-white border-rose-100 text-slate-600 hover:bg-rose-50/20'
                        }`}
                      >
                        <span className="text-base font-bold"> Pay</span>
                        <span className="text-[10.5px] font-extrabold">دفع سريع بلمسة واحدة</span>
                        <span className="text-[8px] text-slate-400">تطبيق محفظة آي أو إس</span>
                      </button>
                    </div>

                    {/* GATEWAY SUB-INTERACTION FOR DEMONSTRATIVE EFFECT */}
                    <div className="bg-[#FAF6F6] rounded-2xl p-4 border border-rose-100 mt-4 text-xs">
                      
                      {/* BenefitPay specific prompt */}
                      {paymentMethod === 'benefit' && (
                        <div className="space-y-3">
                          <p className="font-extrabold text-[#9A2D55]">بوابة بنفت بي المعتمدة (BHD Portal):</p>
                          <p className="text-slate-500 leading-relaxed text-[10px]">
                            أدخلي رقم الهاتف المفعل لدى تطبيق Benefit لخصم آمن وتلقائي بقيمة <strong className="text-slate-800">{totalCost.toFixed(2)} د.ب</strong>:
                          </p>
                          <div className="space-y-2">
                            <input 
                              type="tel" 
                              placeholder="37037697" 
                              value={benefitPhone} 
                              onChange={(e) => setBenefitPhone(e.target.value)}
                              className="w-full bg-white border border-rose-100 rounded-xl px-3 py-2 text-sm text-center font-bold"
                            />
                            <p className="text-[9px] text-[#9A2D55] text-center font-bold">
                              سيتم فتح طلب السداد بالبصمة داخل جهازك بعد النقر على الدفع
                            </p>
                          </div>
                        </div>
                      )}

                      {/* KNet custom Blue/Yellow layout prompt */}
                      {paymentMethod === 'knet' && (
                        <div className="space-y-3">
                          <p className="font-extrabold text-blue-800">شبكة الكويت الوطنية لخدمات الدفع KNET:</p>
                          <div className="space-y-2">
                            <div className="grid grid-cols-3 gap-1">
                              <select className="col-span-1 bg-white border border-rose-100 rounded-lg p-1 text-[10px] font-bold">
                                <option>NBK (الوطني)</option>
                                <option>KFH (بيتك)</option>
                                <option>Gulf Bank (الخليج)</option>
                                <option>Boubyan (بوبيان)</option>
                              </select>
                              <input 
                                type="text" 
                                placeholder="الرقم التعريفي للكارت" 
                                value={knetCardNum}
                                onChange={(e) => setKnetCardNum(e.target.value)}
                                className="col-span-2 bg-white border border-rose-100 rounded-lg p-1 text-center font-semibold text-xs"
                              />
                            </div>
                            <input 
                              type="password" 
                              placeholder="الرقم السري للبطاقة (KNet PIN)" 
                              value={knetPin}
                              onChange={(e) => setKnetPin(e.target.value)}
                              maxLength={4}
                              className="w-full bg-white border border-rose-100 rounded-lg p-1 text-center font-semibold text-xs"
                            />
                          </div>
                        </div>
                      )}

                      {/* Credit Card mockup layout */}
                      {paymentMethod === 'card' && (
                        <div className="space-y-2.5">
                          <div>
                            <label className="text-slate-500 text-[10px] block mb-0.5">الاسم على البطاقة</label>
                            <input 
                              type="text" 
                              placeholder="Fatima Al-Binali" 
                              value={cardName}
                              onChange={(e) => setCardName(e.target.value)}
                              className="w-full bg-white border border-rose-100 rounded-lg p-1 text-xs font-semibold"
                            />
                          </div>
                          <div>
                            <label className="text-slate-500 text-[10px] block mb-0.5">رقم البطاقة الائتمانية</label>
                            <input 
                              type="text" 
                              placeholder="4000 1234 5678 9010" 
                              value={cardNumber}
                              onChange={(e) => setCardNumber(e.target.value)}
                              className="w-full bg-white border border-rose-100 rounded-lg p-1 text-xs font-mono text-center"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-slate-500 text-[10px] block mb-0.5">تاريخ الانتهاء</label>
                              <input 
                                type="text" 
                                placeholder="MM/YY" 
                                value={cardExpiry}
                                onChange={(e) => setCardExpiry(e.target.value)}
                                className="w-full bg-white border border-rose-100 rounded-lg p-1 text-xs text-center"
                              />
                            </div>
                            <div>
                              <label className="text-slate-500 text-[10px] block mb-0.5">الرقم السري CVV</label>
                              <input 
                                type="password" 
                                placeholder="123" 
                                value={cardCvv}
                                onChange={(e) => setCardCvv(e.target.value)}
                                maxLength={3}
                                className="w-full bg-white border border-rose-100 rounded-lg p-1 text-xs text-center"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Apple Pay Specific visual mockup */}
                      {paymentMethod === 'applepay' && (
                        <div className="text-center py-4 space-y-3">
                          <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-2 font-bold text-lg shadow-sm"></div>
                          <p className="text-[10px] text-slate-500 leading-normal font-bold">
                            جاري الاتصال بـ Touch ID / Face ID الخاص بكِ لتسديد قيمة المخاور الفوري..
                          </p>
                          <div className="w-24 h-1.5 bg-rose-100 rounded-full mx-auto overflow-hidden">
                            <div className="h-full bg-[#9A2D55] rounded-full animate-pulse" style={{ width: '60%' }} />
                          </div>
                        </div>
                      )}

                    </div>
                  </div>
                )}


                {/* STEP D: ORDER SUCCESS CELEBRATION SHEET */}
                {checkoutStep === 'success' && newOrder && (
                  <div className="text-center py-8 space-y-4" id="order-success-card">
                    <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto border border-emerald-100 animate-pulse">
                      <CheckCircle className="w-10 h-10" />
                    </div>
                    
                    <h3 className="font-extrabold text-xl text-slate-800 leading-tight">مبروك! تم تفعيل طلبكِ وتفصيل المخور ✨</h3>
                    <p className="text-slate-500 text-xs">
                      تم استلام الدفع الإلكتروني بنجاح وجاري إدخال البوليسية لخطوط الخياطة الفورية! ستحصلين على إشعارات دورية لمراحل العمل والتوصيل.
                    </p>

                    <div className="bg-[#FAF6F6] rounded-2xl p-4 border border-rose-100 text-right space-y-2 text-xs">
                      <p className="text-center font-bold text-slate-700 bg-white border border-rose-50 py-1.5 rounded-lg">تفاصيل تتبع الطلبية</p>
                      <div className="flex justify-between">
                        <span className="text-slate-400">كود التتبع للعميل:</span>
                        <strong className="text-[#9A2D55] font-mono select-all font-extrabold text-sm">{newOrder.trackingCode}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">مجموع المبالغ المسددة:</span>
                        <strong className="text-slate-800">{newOrder.total.toFixed(2)} د.ب</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">وجهة الشحن الدولي:</span>
                        <strong className="text-slate-800">{newOrder.customer.city}، {newOrder.customer.country}</strong>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <button 
                        onClick={() => {
                          setTrackSearchQuery(newOrder.trackingCode);
                          setTrackedOrder(newOrder);
                          setIsCartOpen(false);
                          setActiveTab('tracking');
                          setCheckoutStep('cart');
                        }}
                        className="w-full bg-[#9A2D55] hover:bg-[#802446] text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs"
                      >
                        الانتقال إلى خريطة تتبع طلبي المباشر ✈️
                      </button>
                      <button 
                        onClick={() => {
                          setIsCartOpen(false);
                          setCheckoutStep('cart');
                          setNewOrder(null);
                        }}
                        className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl text-xs font-bold"
                      >
                        الرجوع لتصفّح المخاوير الأخرى
                      </button>
                    </div>
                  </div>
                )}

              </div>

              {/* Dynamic Bottom Controls Bar */}
              {checkoutStep !== 'success' && cart.length > 0 && (
                <div className="p-4 border-t border-rose-50 bg-[#FAF6F6]">
                  {/* Totals Summary */}
                  <div className="space-y-1.5 text-xs mb-4">
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-semibold">المجموع الفرعي:</span>
                      <strong className="text-slate-700 font-sans">{calculatedSubtotal.toFixed(2)} د.ب</strong>
                    </div>
                    {calculatedDiscount > 0 && (
                      <div className="flex justify-between text-emerald-600 font-bold">
                        <span>قيمة التخفيض بالكوبون:</span>
                        <strong className="font-sans">-{calculatedDiscount.toFixed(2)} د.ب</strong>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-semibold">شحن جمركي وتوصيل ممتاز:</span>
                      <strong className="text-slate-755 font-bold font-sans">
                        {shippingCharge === 0 ? 'شحن مجاااني ✓' : `${shippingCharge.toFixed(2)} د.ب`}
                      </strong>
                    </div>
                    <div className="border-t border-rose-100 pt-2 flex justify-between text-sm">
                      <span className="font-extrabold text-[#9A2D55]">إجمالي قيمة الفاتورة:</span>
                      <strong className="font-extrabold text-[#9A2D55] font-sans text-lg">{totalCost.toFixed(2)} د.ب</strong>
                    </div>
                  </div>

                  {/* Progressive Actions switcher */}
                  {checkoutStep === 'cart' && (
                    <button 
                      onClick={() => setCheckoutStep('details')}
                      className="w-full bg-[#9A2D55] hover:bg-[#802446] text-white font-bold py-3 px-4 rounded-xl text-center shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>تعبئة بيانات الشحن والتوصيل</span>
                      <ArrowRight className="w-4 h-4 turn-on-rtl-flip" />
                    </button>
                  )}

                  {checkoutStep === 'details' && (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setCheckoutStep('cart')}
                        className="bg-slate-200 hover:bg-slate-350 text-slate-700 font-bold py-3 px-4 rounded-xl text-center transition cursor-pointer"
                      >
                        رجوع
                      </button>
                      <button 
                        onClick={() => {
                          if (!customerName || !customerPhone || !customerAddress) {
                            alert('الرجاء تعبئة الحقول الأساسية لضمان صحة التوصيل وتجهيز البوليسية.');
                            return;
                          }
                          setCheckoutStep('payment');
                        }}
                        className="flex-1 bg-[#9A2D55] hover:bg-[#802446] text-white font-bold py-3 px-4 rounded-xl text-center shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>الانتقال لخطوة السداد الآمن</span>
                        <ArrowRight className="w-4 h-4 turn-on-rtl-flip" />
                      </button>
                    </div>
                  )}

                  {checkoutStep === 'payment' && (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setCheckoutStep('details')}
                        className="bg-slate-200 hover:bg-slate-350 text-slate-700 font-bold py-3 px-4 rounded-xl text-center transition cursor-pointer"
                      >
                        رجوع
                      </button>
                      <button 
                        onClick={triggerPayment}
                        disabled={isPaying}
                        className="flex-1 bg-[#9A2D55] hover:bg-[#802446] text-white font-bold py-3 px-4 rounded-xl text-center shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer disabled:bg-slate-300"
                        id="submit-payment-btn"
                      >
                        {isPaying ? (
                          <span>جاري ترخيص الدوافع والربط... 🔐</span>
                        ) : (
                          <>
                            <span>إقرار الدفع وتأكيد الطلب 🛍️</span>
                            <ArrowRight className="w-4 h-4 turn-on-rtl-flip" />
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>


      {/* MODAL 3: Approved Reviews (رأي الزباااين Popup) */}
      <AnimatePresence>
        {showReviewsPopup && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4" id="reviews-testimonials-dialog">
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-lg p-6 border border-rose-50 shadow-xl max-h-[80vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6 border-b border-rose-50 pb-3 bg-rose-50/20 -mx-6 px-6 -mt-6 pt-4 rounded-t-3xl">
                <span className="font-bold text-[#9A2D55] text-base">رأي الزباين في مخاوير ألماسة ⭐</span>
                <button onClick={() => setShowReviewsPopup(false)} className="p-1 bg-white hover:bg-slate-150 rounded-lg text-slate-500 border cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                {reviews.map((rev) => (
                  <div key={rev.id} className="bg-[#FAF6F6] rounded-2xl p-4 border border-rose-50">
                    <div className="flex justify-between items-start mb-2">
                      <strong className="text-slate-800 text-sm">{rev.customerName}</strong>
                      <div className="flex gap-0.5 text-amber-500">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        ))}
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold block mb-1">السلعة: {rev.productName}</span>
                    <p className="text-slate-600 text-xs leading-relaxed font-semibold">{rev.comment}</p>
                    <span className="text-[9px] text-slate-400 font-mono block mt-2 text-left">{rev.date}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 text-center">
                <a 
                  href="https://wa.me/97337037697" 
                  target="_blank"
                  referrerPolicy="no-referrer"
                  className="inline-block bg-[#9A2D55] text-white hover:bg-[#802446] font-bold text-xs py-2.5 px-6 rounded-xl shadow transition"
                >
                  صممي قطعة خاصة بكِ وشاركي رأيكِ معنا 🎙️
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


      {/* MODAL 4: Interactive Size Guide Popover Screen */}
      <AnimatePresence>
        {showSizeGuide && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4" id="size-guide-modal">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-xl p-6 border border-rose-50 shadow-xl"
            >
              <div className="flex justify-between items-center mb-4 border-b border-rose-50 pb-3 bg-rose-50/20 -mx-6 px-6 -mt-6 pt-4 rounded-t-3xl">
                <span className="font-bold text-[#9A2D55] text-sm">
                  {sizeGuides.find(g => g.id === showSizeGuide)?.name || 'أدلة مقاسات المخاوير المعتمدة'}
                </span>
                <button onClick={() => setShowSizeGuide(null)} className="p-1 bg-white hover:bg-slate-150 rounded-lg text-slate-500 border cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-right text-slate-650 font-bold border-collapse">
                  <thead>
                    <tr className="bg-rose-50 text-[#9A2D55]">
                      <th className="p-2 border border-rose-100">المقاس القياسي</th>
                      <th className="p-2 border border-rose-100">محيط الصدر</th>
                      <th className="p-2 border border-rose-100">كامل الطول</th>
                      <th className="p-2 border border-rose-100">محيط الخصر</th>
                      <th className="p-2 border border-rose-100">طول الكم</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sizeGuides.find(g => g.id === showSizeGuide)?.sizes.map((row, idx) => (
                      <tr key={idx} className="hover:bg-rose-50/20 odd:bg-slate-50/50">
                        <td className="p-2 border border-rose-100 text-slate-900 font-extrabold">{row.label}</td>
                        <td className="p-2 border border-rose-100">{row.chest}</td>
                        <td className="p-2 border border-rose-100">{row.length}</td>
                        <td className="p-2 border border-rose-100">{row.waist}</td>
                        <td className="p-2 border border-rose-100">{row.sleeve}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="text-[10px] text-slate-400 mt-4 leading-relaxed font-semibold">
                * ملاحظة هامة: قياساتنا الموثوقة تؤخذ بالبوصة (Inches) المعتمدة للخياط الخليجي. تناسب الأقمشة الخفيفة والمخملية والستان. في حال رغبتك بتفصيل قياسات خاصة بالملي الرجاء تزويد فريقنا بها عبر الواتساب.
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
