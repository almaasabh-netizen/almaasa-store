import React, { useState, useEffect } from 'react';
import { 
  BarChart3, ShoppingBag, Users, Truck, Sparkles, FolderKanban, 
  Settings, CreditCard, Layers, Sliders, ClipboardList, Star, 
  Trash2, Plus, CheckCircle, Clock, Undo2, LogIn, Lock, 
  Tag, Compass, HelpCircle, Wallet, FileText, LayoutGrid, 
  RefreshCw, Check, AlertTriangle, Eye, Printer, Percent, BadgeAlert,
  Globe
} from 'lucide-react';
import { Product, Order, OperationLog, Category, Coupon, SizeGuide, Review, StoreSettings } from '../types';
import { getStoredData, saveStoredData, addOperationLog } from '../data';

interface AdminPanelProps {
  onBackToStore: () => void;
}

export default function AdminPanel({ onBackToStore }: AdminPanelProps) {
  // Authorization State
 const [isAdminAuth, setIsAdminAuth] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Core backend state
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [logs, setLogs] = useState<OperationLog[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [sizeGuides, setSizeGuides] = useState<SizeGuide[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  // Selected Sidebar Path (matches the images provided)
  // Options: 'dashboard', 'orders', 'sales_log', 'customers', 'shipping_bills', 'categories', 'products', 'inventory', 'options', 'attributes', 'bulk_actions', 'reviews', 'abandoned_carts', 'size_guides', 'pages', 'themes', 'coupons', 'banners', 'addons', 'settings_general'
  const [activeMenu, setActiveMenu] = useState<string>('dashboard');

  // Filter options for logging and queue searches
  const [logTypeFilter, setLogTypeFilter] = useState<string>('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');

  // Focused Order Detail overlay
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showShippingLabel, setShowShippingLabel] = useState<Order | null>(null);

  // Form states for Add Product
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [pName, setPName] = useState('');
  const [pDesc, setPDesc] = useState('');
  const [pPrice, setPPrice] = useState(30);
  const [pOrigPrice, setPOrigPrice] = useState('');
  const [pCategory, setPCategory] = useState('available');
  const [pStock, setPStock] = useState(10);
  const [pSizes, setPSizes] = useState('S, M, L, XL');
  const [pColors, setPColors] = useState('وردي, بيج, سكني');
  const [pHasSheilah, setPHasSheilah] = useState(true);
  const [pImage, setPImage] = useState('https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600&auto=format&fit=crop');

  // AI Description states
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [aiError, setAiError] = useState('');

  // Payment Gateway states
  const [paymentGateways, setPaymentGateways] = useState({
    tap: {
      enabled: false,
      secretKey: 'YOUR_TAP_SECRET_KEY',
      publicKey: 'YOUR_TAP_PUBLIC_KEY',
      webhookUrl: 'https://api.almaasa-boutique.com/v1/webhook/tap',
      currencies: ['QAR', 'KWD', 'AED', 'SAR', 'OMR', 'BHD'],
      status: 'upgrade_required'
    },
    cod: {
      enabled: true,
      extraFee: 1.5,
      description: 'الدفع نقداً أو بالبطاقة عند معاينة واستلام طرد المنسوجات والمخاوير في منزلكِ بشكل مباشر.',
      status: 'active'
    },
    bankTransfer: {
      enabled: false,
      bankName: 'بنك السلام البحريني الإسلامي',
      accountName: 'مؤسسة بوتيك ألماسة لبيع الألبسة',
      iban: 'BH12ASAL0000000100234567',
      description: 'يرجى تحويل قيمة الفاتورة لحسابنا بالدينار البحريني وإرسال لقطة شاشة للتحويل عبر الواتساب الفوري لتأكيد شحن طرود مخاوير العيد.',
      status: 'upgrade_required'
    },
    vpay: {
      enabled: false,
      merchantId: 'M_VPAY_BH_9281',
      apiKey: 'YOUR_VPAY_API_KEY',
      webhookUrl: 'https://api.almaasa-boutique.com/v1/webhook/vpay',
      currencies: ['BHD'],
      status: 'upgrade_required'
    }
  });

  const [openGatewayConfig, setOpenGatewayConfig] = useState<string | null>(null);
  const [copiedTextId, setCopiedTextId] = useState<string | null>(null);

  // Shipping Zones states
  const [shippingZones, setShippingZones] = useState<any[]>([
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
      countries: ["أبو عريش", "بقيق", "أبها", "الرياض", "دبي", "سلطنة عمان"],
      cities: ["ABHA", "ABQAIQ", "ABU ARISH", "more 310+"],
      methods: []
    }
  ]);

  // Modal or editor states for shipping zones
  const [openZoneModal, setOpenZoneModal] = useState<boolean>(false);
  const [editingZoneId, setEditingZoneId] = useState<string | null>(null);
  const [zoneName, setZoneName] = useState<string>('');
  const [zoneCountries, setZoneCountries] = useState<string>('');
  const [zoneCities, setZoneCities] = useState<string>('');

  // Shipping Method Modal/Editor states
  const [openMethodModal, setOpenMethodModal] = useState<boolean>(false);
  const [editingMethodId, setEditingMethodId] = useState<string | null>(null);
  const [targetZoneId, setTargetZoneId] = useState<string>('');
  const [methodName, setMethodName] = useState<string>('');
  const [methodProvider, setMethodProvider] = useState<string>('LOCAL');
  const [methodPriceType, setMethodPriceType] = useState<string>('fixed');
  const [methodPrice, setMethodPrice] = useState<number>(2.0);
  const [methodDescription, setMethodDescription] = useState<string>('');

  // Load backend content on mount
  useEffect(() => {
    // Check if previously authorized
    const isAuth = sessionStorage.getItem('ama_admin_authenticated') === 'true';
    if (isAuth) {
      setIsAdminAuth(true);
    }
    loadData();
  }, []);

  const loadData = () => {
    const data = getStoredData();
    setProducts(data.products);
    setOrders(data.orders);
    setLogs(data.logs);
    setCategories(data.categories);
    setCoupons(data.coupons);
    setSettings(data.settings);
    setSizeGuides(data.sizeGuides);
    setReviews(data.reviews);

    const savedGateways = localStorage.getItem('ama_payment_gateways');
    if (savedGateways) {
      try {
        setPaymentGateways(JSON.parse(savedGateways));
      } catch (e) {
        console.error("Error loading payment gateways", e);
      }
    }

    const savedZones = localStorage.getItem('ama_shipping_zones');
    if (savedZones) {
      try {
        setShippingZones(JSON.parse(savedZones));
      } catch (e) {
        console.error("Error loading shipping zones", e);
      }
    }
  };

  const saveShippingZones = (zonesList: any[]) => {
    setShippingZones(zonesList);
    localStorage.setItem('ama_shipping_zones', JSON.stringify(zonesList));
    addOperationLog(
      'تحديث خطة شحن المناطق',
      'تم تعديل وحفظ إعدادات قنوات ومناطق الشحن الجغرافي للمتجر بنجاح.',
      'الأدمين',
      'system',
      'success'
    );
  };

  const handleOpenAddZone = () => {
    setEditingZoneId(null);
    setZoneName('');
    setZoneCountries('');
    setZoneCities('');
    setOpenZoneModal(true);
  };

  const handleOpenEditZone = (zone: any) => {
    setEditingZoneId(zone.id);
    setZoneName(zone.name);
    setZoneCountries(zone.countries.join(', '));
    setZoneCities(zone.cities.join(', '));
    setOpenZoneModal(true);
  };

  const handleSaveZone = () => {
    if (!zoneName.trim()) {
      alert('الرجاء كتابة اسم المنطقة الجغرافية (مثال: محلي - BH)');
      return;
    }

    const countryArr = zoneCountries.split(',').map(s => s.trim()).filter(s => s.length > 0);
    const cityArr = zoneCities.split(',').map(s => s.trim()).filter(s => s.length > 0);

    if (editingZoneId) {
      const updated = shippingZones.map(z => {
        if (z.id === editingZoneId) {
          return {
            ...z,
            name: zoneName,
            countries: countryArr,
            cities: cityArr
          };
        }
        return z;
      });
      saveShippingZones(updated);
    } else {
      const newZone = {
        id: `zone-${Math.floor(1000 + Math.random() * 9000)}`,
        name: zoneName,
        countries: countryArr,
        cities: cityArr,
        methods: []
      };
      saveShippingZones([...shippingZones, newZone]);
    }
    setOpenZoneModal(false);
  };

  const handleDeleteZone = (zoneId: string) => {
    if (confirm('هل أنتِ متأكدة من رغبتكِ في حذف هذه المنطقة الجغرافية بالكامل وكافة طرق الشحن التابعة لها؟')) {
      const filtered = shippingZones.filter(z => z.id !== zoneId);
      saveShippingZones(filtered);
    }
  };

  const handleOpenAddMethod = (zoneId: string) => {
    setTargetZoneId(zoneId);
    setEditingMethodId(null);
    setMethodName('توصيل سريع');
    setMethodProvider('LOCAL');
    setMethodPriceType('fixed');
    setMethodPrice(2.0);
    setMethodDescription('سعر ثابت مميز لطلبات العيد السعيد');
    setOpenMethodModal(true);
  };

  const handleOpenEditMethod = (zoneId: string, m: any) => {
    setTargetZoneId(zoneId);
    setEditingMethodId(m.id);
    setMethodName(m.name);
    setMethodProvider(m.provider);
    setMethodPriceType(m.priceType);
    setMethodPrice(m.price);
    setMethodDescription(m.description);
    setOpenMethodModal(true);
  };

  const handleSaveMethod = () => {
    if (!methodName.trim()) {
      alert('الرجاء كتابة اسم طريقة الشحن');
      return;
    }

    const updatedZones = shippingZones.map(z => {
      if (z.id === targetZoneId) {
        let methodsList = [...z.methods];
        if (editingMethodId) {
          methodsList = methodsList.map(method => {
            if (method.id === editingMethodId) {
              return {
                ...method,
                name: methodName,
                provider: methodProvider,
                priceType: methodPriceType,
                price: methodPriceType === 'free' ? 0 : methodPrice,
                description: methodDescription
              };
            }
            return method;
          });
        } else {
          methodsList.push({
            id: `method-${Math.floor(1000 + Math.random() * 9000)}`,
            name: methodName,
            provider: methodProvider,
            priceType: methodPriceType,
            price: methodPriceType === 'free' ? 0 : methodPrice,
            description: methodDescription
          });
        }
        return {
          ...z,
          methods: methodsList
        };
      }
      return z;
    });

    saveShippingZones(updatedZones);
    setOpenMethodModal(false);
  };

  const handleDeleteMethod = (zoneId: string, methodId: string) => {
    if (confirm('هل أنتِ متأكدة من رغبتكِ في حذف خيار وطريقة التوصيل المحددة؟')) {
      const updatedZones = shippingZones.map(z => {
        if (z.id === zoneId) {
          return {
            ...z,
            methods: z.methods.filter((m: any) => m.id !== methodId)
          };
        }
        return z;
      });
      saveShippingZones(updatedZones);
    }
  };

  const handleUpdateGateway = (gatewayKey: string, updatedFields: any) => {
    const updated = {
      ...paymentGateways,
      [gatewayKey]: {
        ...(paymentGateways as any)[gatewayKey],
        ...updatedFields
      }
    };
    setPaymentGateways(updated);
    localStorage.setItem('ama_payment_gateways', JSON.stringify(updated));
    
    // Log operation
    addOperationLog(
      `تحديث بوابة ${gatewayKey.toUpperCase()}`,
      `تم تغيير إعدادات السداد وتعديل قيم الربط وقنوات التفعيل لبوابة ${gatewayKey.toUpperCase()}.`,
      'المشرف',
      'payment',
      'success'
    );
  };

const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsLoggingIn(true);

    try {
      const response = await fetch('/api/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput, password: passwordInput })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsAdminAuth(true);
        sessionStorage.setItem('ama_admin_authenticated', 'true');
        addOperationLog(
          'تسجيل دخول ناجح للأدمين',
          `تم تسجيل الدخول إلى لوحة التحكم الإدارية بنجاح (${emailInput}).`,
          'المشرف',
          'system',
          'success'
        );
        loadData();
      } else {
        setAuthError(data.error || 'البريد الإلكتروني أو كلمة المرور غير صحيحة.');
      }
    } catch (err) {
      setAuthError('تعذر الاتصال بالخادم. تحقق من الاتصال بالإنترنت.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    setIsAdminAuth(false);
    sessionStorage.removeItem('ama_admin_authenticated');
  };

  // Modify Order state
  const handleUpdateOrderStatus = (orderId: string, status: Order['shippingStatus']) => {
    const stepLabels = {
      pending: 'قيد انتظار المراجعة',
      processing: 'جاري التجهيز والقص بالمخيط ⚜️',
      shipped: 'تم تسليم الشحنة لشركة النقل الدولي ✈️',
      delivered: 'تم تسليم الطرد الماسي للزبونة بنجاح ✓'
    };

    const nextTimelineEvent = {
      title: status === 'processing' ? 'بدء تفصيل وفصل القماش' : status === 'shipped' ? 'تم الشحن وشحن بوليصة الاتصال' : 'تم استلام الشحنة وتثبيت البوليسية',
      description: stepLabels[status],
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: status
    };

    const updated = orders.map(order => {
      if (order.id === orderId) {
        // Prevent writing duplicates
        const updatedTimeline = [...order.timeline, nextTimelineEvent];
        return {
          ...order,
          shippingStatus: status,
          timeline: updatedTimeline
        };
      }
      return order;
    });

    setOrders(updated);
    saveStoredData({ orders: updated });
    
    // Log
    addOperationLog(
      `تحديث حالة الشحن للطلب #${orderId}`,
      `تم تعديل الحالة إلى [${stepLabels[status]}] في نظام كاشير ألماسة.`,
      'مدير العمليات',
      'order',
      'info'
    );
    
    // Auto sync modal if open
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, shippingStatus: status, timeline: [...selectedOrder.timeline, nextTimelineEvent] });
    }
    loadData();
  };

  const handleUpdatePaymentStatus = (orderId: string, status: Order['paymentStatus']) => {
    const updated = orders.map(order => {
      if (order.id === orderId) {
        return { ...order, paymentStatus: status };
      }
      return order;
    });

    setOrders(updated);
    saveStoredData({ orders: updated });

    // Log
    addOperationLog(
      `تحديث حالة الدفع للطلب #${orderId}`,
      `تم تعديل حالة السداد إلى [${status === 'paid' ? 'تم السداد كلياً' : 'فشل الدفع / معلق'}]`,
      'مدير العمليات',
      'payment',
      'success'
    );
    loadData();
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        alert('حجم الصورة كبير جداً، يرجى اختيار صورة أقل من 8 ميجابايت.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result && typeof event.target.result === 'string') {
          setPImage(event.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateAIDesc = async () => {
    if (!pName.trim()) {
      setAiError('يرجى كتابة اسم الموديل أولاً لتوليد وصف دقيق له.');
      return;
    }
    setAiError('');
    setIsGeneratingDesc(true);
    try {
      const selectedCatObj = categories.find(c => c.id === pCategory);
      const res = await fetch("/api/generate-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: pName,
          categoryName: selectedCatObj ? selectedCatObj.name : '',
          imageBase64: pImage.startsWith('data:') ? pImage : undefined
        })
      });
      const data = await res.json();
      if (res.ok && data.description) {
        setPDesc(data.description);
      } else {
        setAiError(data.error || 'حدث خطأ غير متوقع أثناء توليد الوصف.');
      }
    } catch (err) {
      console.error(err);
      setAiError('فشل الاتصال بالخادم الذكي لتوليد الوصف.');
    } finally {
      setIsGeneratingDesc(false);
    }
  };

  // Create Product Submit handler
  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName || !pPrice) return;

    const newProd: Product = {
      id: `prod-${Date.now()}`,
      name: pName,
      description: pDesc,
      category: pCategory,
      price: Number(pPrice),
      originalPrice: pOrigPrice ? Number(pOrigPrice) : undefined,
      image: pImage,
      stock: Number(pStock),
      rating: 5.0,
      reviewCount: 0,
      sizes: pSizes.split(',').map(s => s.trim()),
      colors: pColors.split(',').map(c => c.trim()),
      hasSheilah: pHasSheilah,
      properties: [
        { label: 'نوع القماش', value: 'حرير وقطن فاخر' },
        { label: 'الأكمام', value: 'مطرز وواسع' },
        { label: 'الملحقات', value: pHasSheilah ? 'شيلة مطابقة' : 'لا يوجد شيلة' }
      ]
    };

    const updated = [newProd, ...products];
    setProducts(updated);
    saveStoredData({ products: updated });

    // Log
    addOperationLog(
      `إضافة منتج مخور جديد`,
      `تم إدراج الموديل [${pName}] في تصنيفات المتجر وبكمية بدئية ${pStock} قطعة.`,
      'إدارة السلع الماسية',
      'product',
      'success'
    );

    // Clear Form
    setPName('');
    setPDesc('');
    setPPrice(30);
    setPOrigPrice('');
    setPStock(10);
    setShowAddProductModal(false);
    loadData();
  };

  // Delete product safely
  const handleDeleteProduct = (id: string, name: string) => {
    if (confirm(`هل أنت متأكد من رغبتك بحذف المنتج [${name}] نهائياً من العرض؟`)) {
      const updated = products.filter(p => p.id !== id);
      setProducts(updated);
      saveStoredData({ products: updated });

      addOperationLog(
        `حذف منتج ${name}`,
        `تم إلغاء عرض المنتج من السجلات.`,
        'إدارة السلع الماسية',
        'product',
        'warning'
      );
      loadData();
    }
  };

  // Approve / discard review queue
  const handleToggleReviewApproval = (revId: string, isApproved: boolean) => {
    const updated = reviews.map(r => {
      if (r.id === revId) {
        return { ...r, approved: !isApproved };
      }
      return r;
    });

    setReviews(updated);
    saveStoredData({ reviews: updated });

    addOperationLog(
      `مراجعة وتقييم عملاء`,
      `تم ${!isApproved ? 'الموافقة على' : 'حجب'} تعليق وتجربة العميلة في الواجهة بنجاح.`,
      'مشرف المحتوى',
      'system',
      'info'
    );
    loadData();
  };

  // Toggle Coupon Active rule
  const handleToggleCoupon = (code: string) => {
    const updated = coupons.map(c => {
      if (c.code === code) {
        return { ...c, isActive: !c.isActive };
      }
      return c;
    });
    setCoupons(updated);
    saveStoredData({ coupons: updated });
    loadData();
  };

  // Dashboard Stats Calculations
  const totalRevenue = orders.filter(o => o.paymentStatus === 'paid').reduce((sum, o) => sum + o.total, 0);
  const pendingOrdersCount = orders.filter(o => o.shippingStatus === 'pending' || o.shippingStatus === 'processing').length;
  const totalClientsCount = Array.from(new Set(orders.map(o => o.customer.phone))).length;
  const lowStockProductsCount = products.filter(p => p.stock <= 5).length;

  return (
    <div className="min-h-screen bg-[#FAF5F2] text-slate-800 flex flex-col font-sans" dir="rtl" id="almaasa-backend-panel">
      
      {/* SECURITY GUEST LOGIN GUARD */}
      {!isAdminAuth ? (
        <div className="flex-1 flex items-center justify-center p-4 min-h-[90vh]">
          <div className="bg-white rounded-3xl border border-rose-100 p-8 shadow-2xl max-w-md w-full text-center space-y-6">
            <div className="w-16 h-16 bg-rose-50 text-[#9A2D55] rounded-full flex items-center justify-center mx-auto border-2 border-rose-100">
              <Lock className="w-8 h-8 animate-pulse" />
            </div>
            
          <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">بوابة ألماسة الآمنة 🔒</h2>
              <p className="text-slate-500 text-xs font-semibold">
                يرجى إدخال البريد الإلكتروني وكلمة المرور للوصول إلى لوحة الإدارة.
              </p>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <input 
                type="email" 
                placeholder="البريد الإلكتروني"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full bg-[#FAF6F6] text-slate-800 border-2 border-rose-100 rounded-xl px-4 py-3 text-right font-bold text-sm focus:outline-none focus:ring-1 focus:ring-[#9A2D55] focus:bg-white"
                id="admin-email-field"
                required
                dir="ltr"
              />
              <input 
                type="password" 
                placeholder="كلمة المرور"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full bg-[#FAF6F6] text-slate-800 border-2 border-rose-100 rounded-xl px-4 py-3 text-right font-bold text-sm focus:outline-none focus:ring-1 focus:ring-[#9A2D55] focus:bg-white"
                id="admin-passcode-field"
                required
              />

              {authError && (
                <p className="text-xs text-red-500 font-bold bg-red-50 p-2.5 rounded-lg border border-red-200">
                  ⚠️ {authError}
                </p>
              )}

              <button 
                type="submit"
                disabled={isLoggingIn}
                className="w-full bg-[#9A2D55] hover:bg-[#802446] disabled:opacity-60 disabled:cursor-not-allowed text-white font-extrabold py-3 px-4 rounded-xl shadow-lg transition-all text-sm tracking-wide cursor-pointer"
                id="admin-auth-submit-btn"
              >
                {isLoggingIn ? 'جاري التحقق...' : 'تسجيل الدخول 🔐'}
              </button>
            </form>

            <button onClick={onBackToStore} className="text-xs text-[#9A2D55] hover:underline block mx-auto font-bold">
              الرجوع لواجهة عرض متجر المشترين
            </button>
          </div>
        </div>
      ) : (
        
        /* AUTHENTICATED PANEL LAYOUT WITH DYNAMIC ARABIC SIDEBAR */
        <div className="flex-1 flex flex-col md:flex-row">
          
          {/* A. SIDEBAR - Modern redesign */}
          <aside className="w-full md:w-60 bg-[#1A0D16] text-white flex flex-col shrink-0" id="admin-sidebar">

            {/* Brand Header */}
            <div className="px-5 py-5 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#9A2D55] to-[#5C1532] flex items-center justify-center shadow-lg shadow-[#9A2D55]/30 shrink-0">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-white font-black text-sm leading-tight">ألماسة</p>
                  <p className="text-white/40 text-[10px] font-medium">لوحة التحكم</p>
                </div>
              </div>
            </div>

            {/* Nav Sections */}
            <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">

              {/* Section: المبيعات */}
              <div>
                <p className="text-white/30 text-[9px] font-bold uppercase tracking-widest px-2 mb-2 select-none">المبيعات</p>
                <nav className="space-y-0.5">
                  {([
                    { id: 'dashboard',      icon: BarChart3,    label: 'نظرة عامة',        badge: null,                badgeColor: '' },
                    { id: 'orders',         icon: ShoppingBag,  label: 'طلبات الزبائن',    badge: pendingOrdersCount > 0 ? pendingOrdersCount : null, badgeColor: 'bg-rose-500' },
                    { id: 'sales_log',      icon: CreditCard,   label: 'المبيعات والمدخول', badge: null,                badgeColor: '' },
                    { id: 'customers',      icon: Users,        label: 'دليل العملاء',      badge: null,                badgeColor: '' },
                    { id: 'shipping_bills', icon: FileText,     label: 'بوليصات الشحن',    badge: null,                badgeColor: '' },
                  ] as const).map(({ id, icon: Icon, label, badge, badgeColor }) => (
                    <button
                      key={id}
                      onClick={() => setActiveMenu(id)}
                      className={`w-full flex items-center justify-between gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer group ${
                        activeMenu === id
                          ? 'bg-[#9A2D55] text-white shadow-md shadow-[#9A2D55]/25'
                          : 'text-white/50 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <Icon className={`w-3.5 h-3.5 shrink-0 ${activeMenu === id ? 'text-white' : 'text-white/40 group-hover:text-white/70'}`} />
                        {label}
                      </span>
                      {badge != null && (
                        <span className={`${badgeColor} text-white text-[9px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1`}>{badge}</span>
                      )}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="h-px bg-white/5 mx-2" />

              {/* Section: المتجر */}
              <div>
                <p className="text-white/30 text-[9px] font-bold uppercase tracking-widest px-2 mb-2 select-none">إدارة المتجر</p>
                <nav className="space-y-0.5">
                  {([
                    { id: 'categories',       icon: FolderKanban, label: 'التصنيفات',        badge: null, badgeColor: '' },
                    { id: 'products',         icon: Layers,       label: 'المنتجات',          badge: null, badgeColor: '' },
                    { id: 'inventory',        icon: ClipboardList,label: 'المخزون',           badge: lowStockProductsCount > 0 ? lowStockProductsCount : null, badgeColor: 'bg-amber-500' },
                    { id: 'options',          icon: Sliders,      label: 'خيارات المنتج',    badge: null, badgeColor: '' },
                    { id: 'reviews',          icon: Star,         label: 'تقييمات العملاء',  badge: null, badgeColor: '' },
                    { id: 'payment_gateways', icon: CreditCard,   label: 'بوابات الدفع',     badge: null, badgeColor: '' },
                    { id: 'shipping_zones',   icon: Truck,        label: 'مناطق الشحن',      badge: null, badgeColor: '' },
                  ] as const).map(({ id, icon: Icon, label, badge, badgeColor }) => (
                    <button
                      key={id}
                      onClick={() => setActiveMenu(id)}
                      className={`w-full flex items-center justify-between gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer group ${
                        activeMenu === id
                          ? 'bg-[#9A2D55] text-white shadow-md shadow-[#9A2D55]/25'
                          : 'text-white/50 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <Icon className={`w-3.5 h-3.5 shrink-0 ${activeMenu === id ? 'text-white' : 'text-white/40 group-hover:text-white/70'}`} />
                        {label}
                      </span>
                      {badge != null && (
                        <span className={`${badgeColor} text-white text-[9px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1`}>{badge}</span>
                      )}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="h-px bg-white/5 mx-2" />

              {/* Section: التسويق */}
              <div>
                <p className="text-white/30 text-[9px] font-bold uppercase tracking-widest px-2 mb-2 select-none">التسويق</p>
                <nav className="space-y-0.5">
                  {([
                    { id: 'coupons',     icon: Tag,     label: 'الكوبونات' },
                    { id: 'size_guides', icon: Compass, label: 'أدلة المقاسات' },
                  ] as const).map(({ id, icon: Icon, label }) => (
                    <button
                      key={id}
                      onClick={() => setActiveMenu(id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer group ${
                        activeMenu === id
                          ? 'bg-[#9A2D55] text-white shadow-md shadow-[#9A2D55]/25'
                          : 'text-white/50 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${activeMenu === id ? 'text-white' : 'text-white/40 group-hover:text-white/70'}`} />
                      {label}
                    </button>
                  ))}
                </nav>
              </div>

            </div>

            {/* Bottom Actions */}
            <div className="px-3 py-4 border-t border-white/5 space-y-1">
              <button
                onClick={onBackToStore}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-white/50 hover:text-white hover:bg-white/5 transition-all duration-150 cursor-pointer group"
              >
                <Globe className="w-3.5 h-3.5 text-white/30 group-hover:text-white/60 shrink-0" />
                العودة للمتجر
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400/60 hover:text-rose-300 hover:bg-rose-500/5 transition-all duration-150 cursor-pointer group"
              >
                <LogIn className="w-3.5 h-3.5 shrink-0 rotate-180" />
                تسجيل الخروج
              </button>
            </div>
          </aside>

          {/* B. MAIN INTERACTIVE VIEWER PANEL */}
          <main className="flex-1 overflow-y-auto p-4 md:p-8">
            
            {/* Top Bar Status bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4 mb-6 gap-2">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  {activeMenu === 'dashboard' ? 'لوحة القيادة الموحدة ونظرة عامة' : 
                   activeMenu === 'orders' ? 'إدارة طرود وطلبيات المخاوير المعتمدة' :
                   activeMenu === 'sales_log' ? 'البيانات المالية والأرباح المسجلة' :
                   activeMenu === 'customers' ? 'دليل عملاء المتجر الفاعلين' :
                   activeMenu === 'shipping_bills' ? 'تجهيز بوليصات التوصيل الجمركي' :
                   activeMenu === 'categories' ? 'إدارة وتفريع تصنيفات السلع' :
                   activeMenu === 'products' ? 'كتالوج ومخزون المنتجات' :
                   activeMenu === 'inventory' ? 'إعادة شحن وقص المنسوجات والمخزون' :
                   activeMenu === 'options' ? 'الخيارات المضافة واللمسات اليدوية' :
                   activeMenu === 'reviews' ? 'فريق فحص معنويات وتقييمات العملاء' :
                   activeMenu === 'coupons' ? 'أكواد وحملات تخفيض العيد' :
                   activeMenu === 'payment_gateways' ? 'إعدادات وبوابات الدفع المسجلة لـ "ألماسة"' :
                   activeMenu === 'shipping_zones' ? 'إدارة مناطق وبوابات شحن وتوصيل مخاوير ألماسة' :
                   'أدلة المقاسات والتصميم بالبوصة'}
                </h2>
                <p className="text-slate-400 text-xs font-semibold">بوابة ألماسة الآمنة | التحديث فوري ومربوط بقاعدة خوادم التخزين.</p>
              </div>

              <div className="text-xs bg-slate-100 border p-2 rounded-xl text-slate-600 font-mono text-center md:text-left self-start">
                ⏱️ توقيت العمليات: {new Date().toISOString().replace('T', ' ').substring(0, 16)} UTC
              </div>
            </div>

            {/* =========================================
                SECTION 1: OVERVIEW DASHBOARD VIEW
                ========================================= */}
            {activeMenu === 'dashboard' && (
              <div className="space-y-6" id="dashboard-statistics-dashboard">

                {/* A. Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'إجمالي المبيعات', value: `${totalRevenue.toFixed(2)} د.ب`, growth: '+12.1%', icon: Wallet, color: 'bg-emerald-50 text-emerald-600', border: 'border-emerald-100' },
                    { label: 'إجمالي الطلبات', value: `${orders.length} طلب`, growth: `+${pendingOrdersCount} جديد`, icon: ShoppingBag, color: 'bg-rose-50 text-[#9A2D55]', border: 'border-rose-100' },
                    { label: 'العملاء الجدد', value: `${totalClientsCount} عميل`, growth: '+8.3%', icon: Users, color: 'bg-blue-50 text-blue-600', border: 'border-blue-100' },
                    { label: 'المخزون المنخفض', value: `${lowStockProductsCount} منتج`, growth: lowStockProductsCount > 0 ? '⚠️ يحتاج تجديد' : '✓ مستوى جيد', icon: BadgeAlert, color: lowStockProductsCount > 0 ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600', border: lowStockProductsCount > 0 ? 'border-amber-100' : 'border-emerald-100' },
                  ].map(({ label, value, growth, icon: Icon, color, border }) => (
                    <div key={label} className={`bg-white border ${border} rounded-2xl p-4 shadow-sm`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center shrink-0`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] text-emerald-600 bg-emerald-50 font-bold px-2 py-0.5 rounded-full">{growth}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-bold mb-1">{label}</p>
                      <strong className="text-slate-800 font-black text-base">{value}</strong>
                    </div>
                  ))}
                </div>

                {/* B. Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                  {/* B1: Sales Line Chart */}
                  <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-black text-sm text-slate-800">المبيعات</h3>
                        <p className="text-[10px] text-slate-400 font-medium">آخر 30 يوم</p>
                      </div>
                      <span className="text-[10px] bg-emerald-50 text-emerald-600 font-bold px-3 py-1 rounded-full">↑ +12.1% من الشهر الماضي</span>
                    </div>
                    <div className="h-48 w-full relative">
                      <svg className="w-full h-full" viewBox="0 0 500 160" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#9A2D55" stopOpacity="0.15" />
                            <stop offset="100%" stopColor="#9A2D55" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        <line x1="0" y1="40" x2="500" y2="40" stroke="#f8f4f6" strokeWidth="1" />
                        <line x1="0" y1="80" x2="500" y2="80" stroke="#f8f4f6" strokeWidth="1" />
                        <line x1="0" y1="120" x2="500" y2="120" stroke="#f8f4f6" strokeWidth="1" />
                        <text x="0" y="38" fontSize="10" fill="#cbd5e1" fontFamily="sans-serif">20K</text>
                        <text x="0" y="78" fontSize="10" fill="#cbd5e1" fontFamily="sans-serif">15K</text>
                        <text x="0" y="118" fontSize="10" fill="#cbd5e1" fontFamily="sans-serif">10K</text>
                        <path d="M30,140 L80,130 L130,100 L180,115 L230,70 L280,90 L330,50 L380,65 L430,30 L480,15"
                          fill="none" stroke="#9A2D55" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M30,140 L80,130 L130,100 L180,115 L230,70 L280,90 L330,50 L380,65 L430,30 L480,15 L480,155 L30,155 Z"
                          fill="url(#salesGrad)" />
                        {[[230,70],[330,50],[480,15]].map(([cx,cy],i) => (
                          <circle key={i} cx={cx} cy={cy} r="4" fill="#9A2D55" stroke="white" strokeWidth="2" />
                        ))}
                      </svg>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 font-medium mt-1 px-1">
                      {['1 مايو','5 مايو','10 مايو','15 مايو','20 مايو','25 مايو','30 مايو'].map(d => <span key={d}>{d}</span>)}
                    </div>
                  </div>

                  {/* B2: Category Donut */}
                  <div className="bg-white rounded-2xl border border-slate-100 p-5">
                    <h3 className="font-black text-sm text-slate-800 mb-1">نسبة المبيعات حسب التصنيف</h3>
                    <p className="text-[10px] text-slate-400 mb-4">الفئات الأكثر مبيعاً</p>
                    <div className="flex justify-center mb-4">
                      <svg viewBox="0 0 120 120" className="w-28 h-28">
                        <circle cx="60" cy="60" r="45" fill="none" stroke="#f8ede8" strokeWidth="18" />
                        <circle cx="60" cy="60" r="45" fill="none" stroke="#9A2D55" strokeWidth="18"
                          strokeDasharray="127 155" strokeDashoffset="0" strokeLinecap="round" />
                        <circle cx="60" cy="60" r="45" fill="none" stroke="#C4956A" strokeWidth="18"
                          strokeDasharray="93 189" strokeDashoffset="-127" strokeLinecap="round" />
                        <circle cx="60" cy="60" r="45" fill="none" stroke="#e8d5c4" strokeWidth="18"
                          strokeDasharray="46 236" strokeDashoffset="-220" strokeLinecap="round" />
                        <text x="60" y="56" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#2C1810" fontFamily="sans-serif">
                          {orders.length}
                        </text>
                        <text x="60" y="68" textAnchor="middle" fontSize="8" fill="#9B8178" fontFamily="sans-serif">طلب</text>
                      </svg>
                    </div>
                    <div className="space-y-2">
                      {[
                        { label: 'مخاوير', pct: '45%', color: 'bg-[#9A2D55]' },
                        { label: 'أقمشة', pct: '30%', color: 'bg-[#C4956A]' },
                        { label: 'تصاميم', pct: '15%', color: 'bg-[#e8d5c4]' },
                        { label: 'أخرى', pct: '10%', color: 'bg-slate-200' },
                      ].map(({ label, pct, color }) => (
                        <div key={label} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <div className={`w-2.5 h-2.5 rounded-full ${color} shrink-0`} />
                            <span className="text-slate-600 font-medium">{label}</span>
                          </div>
                          <span className="font-bold text-slate-700">{pct}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* C. Bottom Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                  {/* C1: Recent Orders Table */}
                  <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 overflow-hidden">
                    <div className="flex items-center justify-between p-4 border-b border-slate-100">
                      <h3 className="font-black text-sm text-slate-800">آخر الطلبات</h3>
                      <button onClick={() => setActiveMenu('orders')} className="text-xs text-[#9A2D55] font-bold hover:underline">عرض الكل</button>
                    </div>
                    <table className="w-full text-xs text-right">
                      <thead>
                        <tr className="bg-slate-50 text-slate-400">
                          <th className="p-3 font-bold">#</th>
                          <th className="p-3 font-bold">العميل</th>
                          <th className="p-3 font-bold">التاريخ</th>
                          <th className="p-3 font-bold">المبلغ</th>
                          <th className="p-3 font-bold">الحالة</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {orders.slice(0, 5).map(ord => (
                          <tr key={ord.id} onClick={() => setSelectedOrder(ord)} className="hover:bg-[#FDF8F5] cursor-pointer transition-colors">
                            <td className="p-3 font-mono text-[#9A2D55] font-bold">#{ord.id.slice(-4)}</td>
                            <td className="p-3">
                              <p className="font-bold text-slate-800">{ord.customer.name}</p>
                              <p className="text-[10px] text-slate-400">{ord.date.substring(0,10)}</p>
                            </td>
                            <td className="p-3 text-slate-500 font-mono">{ord.date.substring(0,10)}</td>
                            <td className="p-3 font-black text-slate-800">{ord.total.toFixed(2)} د.ب</td>
                            <td className="p-3">
                              <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                                ord.shippingStatus === 'delivered' ? 'bg-emerald-100 text-emerald-700' :
                                ord.shippingStatus === 'shipped' ? 'bg-blue-100 text-blue-700' :
                                ord.shippingStatus === 'processing' ? 'bg-amber-100 text-amber-700' :
                                'bg-rose-100 text-[#9A2D55]'
                              }`}>
                                {ord.shippingStatus === 'delivered' ? 'مكتمل' :
                                 ord.shippingStatus === 'shipped' ? 'قيد الشحن' :
                                 ord.shippingStatus === 'processing' ? 'قيد التجهيز' : 'ملغي'}
                              </span>
                            </td>
                          </tr>
                        ))}
                        {orders.length === 0 && (
                          <tr><td colSpan={5} className="p-8 text-center text-slate-400 text-xs font-medium">لا توجد طلبات بعد</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* C2: Orders Overview + Top Products */}
                  <div className="space-y-4">

                    {/* Orders Overview Donut */}
                    <div className="bg-white rounded-2xl border border-slate-100 p-4">
                      <h3 className="font-black text-sm text-slate-800 mb-3">نظرة عامة على الطلبات</h3>
                      <div className="flex items-center gap-3">
                        <svg viewBox="0 0 80 80" className="w-20 h-20 shrink-0">
                          <circle cx="40" cy="40" r="30" fill="none" stroke="#f1f5f9" strokeWidth="12" />
                          {(() => {
                            const total = orders.length || 1;
                            const delivered = orders.filter(o => o.shippingStatus === 'delivered').length;
                            const processing = orders.filter(o => o.shippingStatus === 'processing').length;
                            const shipped = orders.filter(o => o.shippingStatus === 'shipped').length;
                            const circ = 2 * Math.PI * 30;
                            let offset = 0;
                            return [
                              { count: delivered, color: '#10b981' },
                              { count: processing, color: '#f59e0b' },
                              { count: shipped, color: '#3b82f6' },
                              { count: Math.max(0, total - delivered - processing - shipped), color: '#9A2D55' },
                            ].map(({ count, color }, i) => {
                              const dash = (count / total) * circ;
                              const el = <circle key={i} cx="40" cy="40" r="30" fill="none" stroke={color} strokeWidth="12"
                                strokeDasharray={`${dash} ${circ}`} strokeDashoffset={-offset}
                                transform="rotate(-90 40 40)" strokeLinecap="butt" />;
                              offset += dash;
                              return el;
                            });
                          })()}
                          <text x="40" y="36" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#2C1810" fontFamily="sans-serif">{orders.length}</text>
                          <text x="40" y="47" textAnchor="middle" fontSize="7" fill="#9B8178" fontFamily="sans-serif">إجمالي</text>
                        </svg>
                        <div className="space-y-1.5 text-[10px] flex-1">
                          {[
                            { label: 'مكتمل', count: orders.filter(o=>o.shippingStatus==='delivered').length, color: 'bg-emerald-500' },
                            { label: 'قيد التجهيز', count: orders.filter(o=>o.shippingStatus==='processing').length, color: 'bg-amber-400' },
                            { label: 'قيد الشحن', count: orders.filter(o=>o.shippingStatus==='shipped').length, color: 'bg-blue-500' },
                            { label: 'ملغي', count: orders.filter(o=>o.shippingStatus==='pending').length, color: 'bg-[#9A2D55]' },
                          ].map(({ label, count, color }) => (
                            <div key={label} className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <div className={`w-2 h-2 rounded-full ${color}`} />
                                <span className="text-slate-500 font-medium">{label}</span>
                              </div>
                              <span className="font-bold text-slate-700">{count}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Top Products */}
                    <div className="bg-white rounded-2xl border border-slate-100 p-4">
                      <h3 className="font-black text-sm text-slate-800 mb-3">أفضل المنتجات مبيعاً</h3>
                      <div className="space-y-3">
                        {products.slice(0, 3).map((p, i) => (
                          <div key={p.id} className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg overflow-hidden bg-[#F8EDE8] shrink-0">
                              <img src={p.image} alt={p.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[11px] font-bold text-slate-700 truncate">{p.name}</p>
                              <p className="text-[10px] text-slate-400">{p.reviewCount} مبيع</p>
                            </div>
                            <span className="text-xs font-black text-[#9A2D55] shrink-0">{p.price.toFixed(0)} د.ب</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* =========================================
                SECTION 2: ORDERS MANAGEMENT VIEW
                ========================================= */}
            {activeMenu === 'orders' && (
              <div className="space-y-6" id="orders-admin-panel">
                
                {/* Search Queue */}
                <div className="bg-white border rounded-2xl p-4 flex gap-3">
                  <input 
                    type="text" 
                    placeholder="ابحثي باسم الزبونة أو رقم الهاتف أو كود تتبع الشحن..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="flex-1 bg-[#FAF6F6] border rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none"
                  />
                  <button className="bg-slate-900 text-white font-extrabold px-6 py-2.5 rounded-xl text-xs">تحديث</button>
                </div>

                {/* High density Orders Table */}
                <div className="bg-white border rounded-2xl overflow-hidden shadow-2xs">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 border-b border-slate-100">
                        <th className="p-3">رقم الطلب</th>
                        <th className="p-3">اسم المستلمة وهاتفها</th>
                        <th className="p-3">تاريخ الطلب</th>
                        <th className="p-3">المجموع الكلي</th>
                        <th className="p-3">حالة السداد الإلكتروني</th>
                        <th className="p-3">مرحلة إعداد الشحن</th>
                        <th className="p-3 text-center">أدوات التحكم</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-bold">
                      {orders
                        .filter(o => !orderSearch || 
                           o.customer.name.toLowerCase().includes(orderSearch.toLowerCase()) || 
                           o.trackingCode.toLowerCase().includes(orderSearch.toLowerCase()) || 
                           o.customer.phone.includes(orderSearch)
                        )
                        .map((order) => (
                          <tr key={order.id} className="hover:bg-[#FAF6F6]/50">
                            <td className="p-3 font-mono text-slate-800">{order.id}</td>
                            <td className="p-3">
                              <span className="block text-slate-800">{order.customer.name}</span>
                              <span className="block text-[10px] text-slate-400 font-mono">{order.customer.phone}</span>
                            </td>
                            <td className="p-3 font-mono text-slate-500">{order.date.substring(0, 16).replace('T', ' ')}</td>
                            <td className="p-3 text-[#9A2D55] font-mono text-sm">{order.total.toFixed(2)} د.ب</td>
                            <td className="p-3">
                              <select 
                                value={order.paymentStatus} 
                                onChange={(e) => handleUpdatePaymentStatus(order.id, e.target.value as Order['paymentStatus'])}
                                className={`p-1.5 rounded-lg text-[10px] font-bold focus:outline-none border ${
                                  order.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'
                                }`}
                              >
                                <option value="paid">مسدد ومقبول ✓</option>
                                <option value="pending">قيد الانتظار</option>
                                <option value="failed">فشل السداد 🚫</option>
                              </select>
                            </td>
                            <td className="p-3">
                              <select 
                                value={order.shippingStatus} 
                                onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as Order['shippingStatus'])}
                                className={`p-1.5 rounded-lg text-[10px] font-bold focus:outline-none border ${
                                  order.shippingStatus === 'delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                  order.shippingStatus === 'shipped' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                  order.shippingStatus === 'processing' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                  'bg-slate-100 text-slate-700 border-slate-200'
                                }`}
                              >
                                <option value="pending">طلب وارد معلّق</option>
                                <option value="processing">جاري التفصيل والقص</option>
                                <option value="shipped">تم تسليم الشاحن ✈️</option>
                                <option value="delivered">تمت التسوية والتسليم✓</option>
                              </select>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center justify-center gap-1.5">
                                <button 
                                  onClick={() => setSelectedOrder(order)} 
                                  className="p-1 px-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 text-[10px] flex items-center gap-1 cursor-pointer"
                                  title="تفاصيل الطلب والبوليسية"
                                >
                                  <Eye className="w-3 h-3" /> تفاصيل الطلب كاملة
                                </button>
                                
                                <button 
                                  onClick={() => setShowShippingLabel(order)}
                                  className="p-1 px-2 bg-rose-50 text-[#9A2D55] border border-rose-200 rounded-lg hover:bg-rose-100 text-[10px] flex items-center gap-1 cursor-pointer"
                                  title="طباعة بوليصة شحن مستندات"
                                >
                                  <Printer className="w-3 h-3" /> بوليصة
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

              </div>
            )}

            {/* =========================================
                SECTION 3: SALES LEDGER VIEW
                ========================================= */}
            {activeMenu === 'sales_log' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white border rounded-2xl p-5 text-center">
                    <span className="text-slate-400 font-bold block text-[11px] mb-1">المدخول الصافي</span>
                    <strong className="text-emerald-600 font-black text-xl font-sans">{totalRevenue.toFixed(2)} د.ب</strong>
                  </div>
                  <div className="bg-white border rounded-2xl p-5 text-center">
                    <span className="text-slate-400 font-bold block text-[11px] mb-1">الطلبات المسددة بنجاح</span>
                    <strong className="text-[#9A2D55] font-black text-xl font-sans">{orders.filter(o => o.paymentStatus === 'paid').length} فاتورة</strong>
                  </div>
                  <div className="bg-white border rounded-2xl p-5 text-center">
                    <span className="text-slate-400 font-bold block text-[11px] mb-1">متوسط سلة المبيعات للعميل</span>
                    <strong className="text-slate-800 font-black text-xl font-sans">
                      {orders.length ? (totalRevenue / orders.length).toFixed(2) : 0} د.ب
                    </strong>
                  </div>
                </div>

                <div className="bg-white border rounded-2xl p-5">
                  <h3 className="font-bold text-slate-800 mb-4 text-xs border-b pb-2">دفتر المعاملات والمدخول من بوابات الدفع الخليجية</h3>
                  <div className="space-y-3">
                    {orders.filter(o => o.paymentStatus === 'paid').map((ticket) => (
                      <div key={ticket.id} className="bg-slate-50 border rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between text-xs gap-3">
                        <div>
                          <strong className="text-slate-800 block">مرخص دفع تلقائي لـ {ticket.customer.name}</strong>
                          <span className="text-[10px] text-slate-400 block font-mono mt-0.5">القناة: {ticket.paymentMethod.toUpperCase()} | المرجع تتبع: {ticket.trackingCode}</span>
                        </div>
                        <div className="text-center sm:text-left">
                          <strong className="text-emerald-600 block font-mono text-base font-black">+{ticket.total.toFixed(2)} د.ب</strong>
                          <span className="text-[9px] text-slate-400 font-mono block">{ticket.date.substring(0,16).replace('T', ' ')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* =========================================
                SECTION 4: CLIENTS DIRECTORY VIEW
                ========================================= */}
            {activeMenu === 'customers' && (
              <div className="space-y-6">
                <div className="bg-white border rounded-2xl p-5">
                  <h3 className="font-bold text-slate-800 text-xs mb-4">قائمة وسجلات المشترين وبوليسيات الاتصال</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Array.from(new Set(orders.map(o => o.customer.phone))).map((phoneNum, idx) => {
                      const clientOrders = orders.filter(o => o.customer.phone === phoneNum);
                      const customerName = clientOrders[0]?.customer.name || 'عميل مسجل';
                      const customerAddress = `${clientOrders[0]?.customer.address}, ${clientOrders[0]?.customer.city}, ${clientOrders[0]?.customer.country}`;
                      const customerEmail = clientOrders[0]?.customer.email;
                      const customerLTV = clientOrders.reduce((sum, o) => sum + o.total, 0);

                      return (
                        <div key={idx} className="bg-slate-50 border rounded-xl p-4 text-xs flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-center mb-2 border-b border-rose-100 pb-2">
                              <strong className="text-slate-800 text-sm block">{customerName}</strong>
                              <span className="bg-[#9A2D55]/10 text-[#9A2D55] text-[10px] font-bold px-2 py-0.5 rounded-full">
                                {clientOrders.length} شراءات
                              </span>
                            </div>
                            <div className="space-y-1.5 text-slate-500 mb-4 font-semibold">
                              <p>📞 رقم الهاتف الدولي: {phoneNum}</p>
                              {customerEmail && <p>✉️ بريد الاتصال: {customerEmail}</p>}
                              <p>📍 وجهة الشحن: {customerAddress}</p>
                            </div>
                          </div>
                          <div className="flex justify-between items-center pt-2 border-t border-rose-50/50">
                            <span className="text-slate-400 font-bold">إجمالي مشترياتها LTV:</span>
                            <strong className="text-[#9A2D55] font-mono text-base font-black">{customerLTV.toFixed(2)} د.ب</strong>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* =========================================
                SECTION 5: SHIPPING BILLS VIEW
                ========================================= */}
            {activeMenu === 'shipping_bills' && (
              <div className="space-y-6 bg-white border rounded-2xl p-6">
                <h3 className="font-bold text-slate-800 text-xs mb-4">نماذج بوليصات التوصيل الخليجي (أرامكس ودي إتش إل)</h3>
                <p className="text-slate-500 text-xs leading-normal">
                  هنا يمكن الإدارة توليد وطباعة بوليصة النقل لإصاقها على طرد كرتونة مخاوير ألماسة المغلفة بكل حب. يرجى اختيار الطلب من قائمة "طلبات زبائن ألماسة" المجاورة أو النقر على طباعة.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border border-dashed border-slate-300 rounded-2xl p-4 bg-slate-50 flex items-center justify-between text-xs">
                      <div>
                        <strong className="text-slate-800 font-bold">{order.customer.name}</strong>
                        <p className="text-[10px] text-slate-400 mt-0.5">رقم تتبع الشحن: {order.trackingCode}</p>
                        <p className="text-[10px] text-slate-400">الوجهة: {order.customer.city}، {order.customer.country}</p>
                      </div>

                      <button 
                        onClick={() => setShowShippingLabel(order)}
                        className="bg-[#9A2D55] hover:opacity-90 text-white font-extrabold px-4 py-2 rounded-lg text-[10px] cursor-pointer"
                      >
                        معاينة وطباعة البوليصة 📑
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* =========================================
                SECTION 6: CATEGORIES MANAGER VIEW
                ========================================= */}
            {activeMenu === 'categories' && (
              <div className="space-y-6">
                <div className="bg-white border rounded-2xl p-5">
                  <div className="flex items-center justify-between border-b pb-2 mb-4">
                    <h3 className="font-bold text-slate-800 text-xs">إدارة أقسام وتصنيفات مخاوير ألماسة</h3>
                    <span className="text-[10px] bg-rose-50 text-[#9A2D55] px-2 py-0.5 rounded font-bold">العدد: {categories.length} أقسام</span>
                  </div>

                  <div className="space-y-3">
                    {categories.map((cat) => (
                      <div key={cat.id} className="bg-[#FAF6F6] rounded-xl p-3 flex justify-between items-center text-xs">
                        <strong className="text-slate-800">{cat.name}</strong>
                        <span className="text-[#9A2D55] font-mono font-bold bg-white border px-3 py-1 rounded-lg">
                          يحتوي {products.filter(p => p.category === cat.id || cat.id === 'all').length} منتج
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* =========================================
                SECTION 7: PRODUCTS CATALOG VIEW
                ========================================= */}
            {activeMenu === 'products' && (
              <div className="space-y-6" id="products-catalog-admin">
                
                {/* Controller Bar */}
                <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                  <div className="relative w-full sm:max-w-md">
                    <input 
                      type="text" 
                      placeholder="ابحثي عن منتج مخور لتعديله أو حذفه..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="w-full bg-white border rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none"
                    />
                  </div>

                  <button 
                    onClick={() => setShowAddProductModal(true)}
                    className="w-full sm:w-auto bg-[#9A2D55] hover:bg-[#802446] text-white font-extrabold px-6 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إضافة منتج مخور جديد لمخزن العيد</span>
                  </button>
                </div>

                {/* Catalog Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products
                    .filter(p => !productSearch || p.name.toLowerCase().includes(productSearch.toLowerCase()))
                    .map((prod) => (
                      <div key={prod.id} className="bg-white border rounded-2xl overflow-hidden flex flex-col justify-between text-xs">
                        {/* Thumb */}
                        <div className="aspect-video w-full bg-slate-100 overflow-hidden relative">
                          <img src={prod.image} alt={prod.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                          <span className="absolute top-2 right-2 bg-slate-900 text-white font-bold text-[9px] px-2 py-0.5 rounded-full">
                            متبقي {prod.stock} قطع
                          </span>
                        </div>

                        {/* Config */}
                        <div className="p-4 space-y-2 flex-grow flex flex-col justify-between">
                          <div>
                            <strong className="text-slate-800 text-sm block line-clamp-1">{prod.name}</strong>
                            <p className="text-slate-400 text-[10px] line-clamp-2 leading-relaxed mt-1 font-medium">{prod.description}</p>
                          </div>

                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                            <strong className="text-[#9A2D55] text-sm font-sans font-black">{prod.price.toFixed(2)} د.ب</strong>
                            
                            <button 
                              onClick={() => handleDeleteProduct(prod.id, prod.name)}
                              className="text-red-500 hover:text-red-700 font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> حذف السلعة
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>

              </div>
            )}

            {/* =========================================
                SECTION 8: INVENTORY CONTROLLER VIEW
                ========================================= */}
            {activeMenu === 'inventory' && (
              <div className="space-y-6">
                <div className="bg-white border rounded-2xl p-5">
                  <div className="flex items-center justify-between border-b pb-2 mb-4">
                    <h3 className="font-bold text-slate-800 text-xs">تجهيز والتحكم المباشر بمخزون أقمشة الجلابيات والمخاوير</h3>
                    <span className="text-[10px] text-amber-600 bg-amber-50 px-2.5 py-1 rounded font-bold animate-pulse">
                      تحذير: منتجات مخزونها أقل من 5 قطع ستظهر كتحذير للقصاصين!
                    </span>
                  </div>

                  <div className="space-y-3">
                    {products.map((prod) => {
                      const isLowStock = prod.stock <= 5;
                      return (
                        <div 
                          key={prod.id} 
                          className={`rounded-xl p-4 border flex flex-col sm:flex-row items-center justify-between text-xs gap-3 ${
                            isLowStock ? 'bg-amber-50/50 border-amber-200' : 'bg-slate-50 border-slate-200/50'
                          }`}
                        >
                          <div>
                            <strong className="text-slate-800 block text-xs">{prod.name}</strong>
                            <span className="text-[10px] text-slate-400 font-bold block mt-0.5">القسم الفعلي: {prod.category}</span>
                          </div>

                          <div className="flex items-center gap-3">
                            {isLowStock && (
                              <span className="text-[9px] bg-red-100 text-red-700 px-2 py-0.5 rounded font-bold">تحذير نفاد قماش المخور! ⏰</span>
                            )}
                            <div className="flex items-center gap-2 bg-white border rounded-xl py-1 px-3">
                              <span className="text-slate-400 font-bold">الخيام المتوفرة:</span>
                              <strong className={`${prod.stock <= 5 ? 'text-red-600' : 'text-slate-800'}`}>{prod.stock} طقم</strong>
                              
                              <div className="flex gap-1">
                                <button 
                                  onClick={() => {
                                    const nextProds = products.map(p => {
                                      if (p.id === prod.id) {
                                        return { ...p, stock: p.stock + 5 };
                                      }
                                      return p;
                                    });
                                    setProducts(nextProds);
                                    saveStoredData({ products: nextProds });
                                  }}
                                  className="text-[10px] bg-rose-50 text-[#9A2D55] px-1.5 py-0.5 rounded border border-rose-100 font-bold hover:bg-rose-100 cursor-pointer"
                                >
                                  +5 قطع
                                </button>
                                <button 
                                  onClick={() => {
                                    const nextProds = products.map(p => {
                                      if (p.id === prod.id) {
                                        return { ...p, stock: Math.max(0, p.stock - 1) };
                                      }
                                      return p;
                                    });
                                    setProducts(nextProds);
                                    saveStoredData({ products: nextProds });
                                  }}
                                  className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded hover:bg-slate-200 cursor-pointer"
                                >
                                  -1 قطعة
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* =========================================
                SECTION 9: SYSTEM REVIEWS QUEUE
                ========================================= */}
            {activeMenu === 'reviews' && (
              <div className="space-y-6">
                <div className="bg-white border rounded-2xl p-5">
                  <h3 className="font-bold text-slate-800 text-xs mb-4">آراء عملاء مخاوير ألماسة (تعديل وحجب وعرض مباشر)</h3>
                  <div className="space-y-4">
                    {reviews.map((rev) => (
                      <div key={rev.id} className="bg-slate-50 border rounded-2xl p-4 text-xs space-y-2">
                        <div className="flex justify-between items-center bg-white p-2 rounded-xl border">
                          <div>
                            <strong className="text-slate-800">{rev.customerName}</strong>
                            <p className="text-[10px] text-slate-400 mt-0.5">تقييم للسلعة: {rev.productName}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded ${
                              rev.approved ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
                            }`}>
                              {rev.approved ? 'معروض للعامة ✓' : 'محجوب / غير موافق عليه'}
                            </span>
                            
                            <button 
                              onClick={() => handleToggleReviewApproval(rev.id, rev.approved)}
                              className="bg-slate-900 border text-white hover:opacity-90 py-1 px-3 rounded-lg text-[10px] font-bold cursor-pointer"
                            >
                              {rev.approved ? 'حجب الرأي' : 'قبول وعرض على المتجر'}
                            </button>
                          </div>
                        </div>

                        <p className="text-slate-600 leading-relaxed italic bg-white/40 p-2 rounded font-semibold">"{rev.comment}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* =========================================
                SECTION 10: PROMO COUPONS ADMIN
                ========================================= */}
            {activeMenu === 'coupons' && (
              <div className="space-y-6">
                <div className="bg-white border rounded-2xl p-5">
                  <div className="flex items-center justify-between border-b pb-2 mb-4">
                    <h3 className="font-bold text-slate-800 text-xs">أكواد الكوبونات الخصمية لعملاء المتجر</h3>
                    <span className="text-[10px] bg-rose-50 text-[#9A2D55] px-2 py-0.5 rounded font-bold">النشط: {coupons.filter(c => c.isActive).length} كوبونات</span>
                  </div>

                  <div className="space-y-3">
                    {coupons.map((coupon) => (
                      <div key={coupon.code} className="bg-[#FAF6F6] border rounded-xl p-4 flex items-center justify-between text-xs gap-3 font-semibold">
                        <div>
                          <strong className="text-slate-800 font-mono text-base">{coupon.code}</strong>
                          <p className="text-[10px] text-slate-400 mt-0.5">نسبة وتصنيف الخصم: {coupon.type === 'percentage' ? `${coupon.discount}% خصم مئوي` : `${coupon.discount.toFixed(2)} BHD خصم ثابت`}</p>
                          <p className="text-[10px] text-slate-450 block font-normal">عدد مرات الاستخدام الناجح: {coupon.usageCount} مرة</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`inline-block py-1 px-3 text-[10px] font-bold rounded-lg ${
                            coupon.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
                          }`}>
                            {coupon.isActive ? 'فعال ومستجيب' : 'معطل ومكتمل الاستعمال'}
                          </span>
                          
                          <button 
                            onClick={() => handleToggleCoupon(coupon.code)}
                            className="bg-slate-900 text-white font-bold py-1.5 px-3 rounded-lg text-[9px] cursor-pointer"
                          >
                            تغيير الحالة
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}


            {/* =========================================
                SECTION 11: PAYMENT GATEWAYS CONFIG
                ========================================= */}
            {activeMenu === 'payment_gateways' && (
              <div className="space-y-6 animate-in fade-in duration-350">
                {/* Header card info */}
                <div className="bg-white border rounded-2xl p-6 shadow-xs">
                  <div className="flex gap-4 items-start">
                    <div className="p-3 bg-rose-50 text-[#9A2D55] rounded-2xl">
                      <CreditCard className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-850 text-sm">بوابات وقنوات الدفع الإلكتروني المعتمدة</h3>
                      <p className="text-slate-400 text-[11px] mt-1 leading-relaxed font-semibold">
                        قومي بالإشراف على بوابات السداد المتكاملة وتفعيلها، وتعديل خيارات الدفع عند الاستلام وحسابات النقل المصرفي الفوري لزبائن متجر مخاوير ألماسة.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Gateways Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6">
                  
                  {/* Card 1: Tap Payments */}
                  <div className="bg-white border rounded-3xl p-6 shadow-xs flex flex-col justify-between hover:border-rose-100 transition-all relative overflow-hidden">
                    <div className="space-y-4">
                      {/* Top status & toggle */}
                      <div className="flex items-center justify-between">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={paymentGateways.tap.enabled}
                            onChange={(e) => handleUpdateGateway('tap', { enabled: e.target.checked })}
                            className="sr-only peer" 
                          />
                          <div className="w-10 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                          <span className="right-2 mr-2 text-[10px] font-extrabold text-slate-500">
                            {paymentGateways.tap.enabled ? 'مفعل' : 'غير مفعل'}
                          </span>
                        </label>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] bg-slate-100 font-mono text-slate-600 px-2 py-0.5 rounded font-extrabold">tap</span>
                          <span className="p-1 px-1.5 bg-rose-50 text-[#9A2D55] rounded-lg">
                            <Globe className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="text-center space-y-2 pt-2">
                        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-[#9A2D55] font-black border font-sans text-xs tracking-widest shadow-2xs">tap</div>
                        <h4 className="font-extrabold text-[#9A2D55] text-xs">تاب للمدفوعات (Tap Gateways)</h4>
                        <span className="inline-block bg-amber-50 border border-amber-200 text-amber-700 text-[9px] px-2.5 py-0.5 rounded-full font-bold">⚠️ مطلوب ترقية الباقة لربط الانتاج</span>
                        <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
                          مع تاب تخطى كل الحدود بأعمالك من خلال تفعيل بوابات دفع ميسرة لعملائكِ وسداد مباشر.
                        </p>
                      </div>

                      {/* Currencies supported */}
                      <div className="border-t pt-3 space-y-1">
                        <span className="text-[10px] text-slate-400 font-extrabold block">🌍 العملات المقبولة بالخليج:</span>
                        <div className="flex flex-wrap gap-1">
                          {paymentGateways.tap.currencies.map(c => (
                            <span key={c} className="text-[10px] bg-slate-50 border px-2 py-0.5 rounded-lg font-bold font-mono text-slate-600">{c}</span>
                          ))}
                        </div>
                      </div>

                      {/* Webhook URL copy block */}
                      <div className="border-t pt-3 space-y-1">
                        <span className="text-[10px] text-slate-400 font-extrabold block">🔗 Webhook URL:</span>
                        <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-xl border text-[10px] font-mono">
                          <span className="truncate flex-1 text-slate-550" title={paymentGateways.tap.webhookUrl}>{paymentGateways.tap.webhookUrl}</span>
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(paymentGateways.tap.webhookUrl);
                              setCopiedTextId('tap-wh');
                              setTimeout(() => setCopiedTextId(null), 2500);
                            }}
                            className="bg-slate-200 hover:bg-slate-300 px-2 py-0.5 rounded font-sans font-bold cursor-pointer transition-colors"
                          >
                            {copiedTextId === 'tap-wh' ? 'تم النسخ!' : 'عرض'}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Bottom action button */}
                    <div className="pt-4 mt-6 border-t flex gap-2">
                      <button 
                        onClick={() => setOpenGatewayConfig(openGatewayConfig === 'tap' ? null : 'tap')}
                        className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-[10px] py-2 px-3 rounded-xl cursor-pointer text-center"
                      >
                        ⚙️ إعدادات الربط
                      </button>
                      <a 
                        href="https://www.tap.company" 
                        target="_blank" 
                        rel="noreferrer"
                        className="bg-[#9A2D55] hover:opacity-95 text-white font-extrabold text-[9px] py-2 px-3 rounded-xl cursor-pointer text-center flex items-center justify-center gap-0.5"
                      >
                        زيارة الموقع الرسمي 👋
                      </a>
                    </div>
                  </div>

                  {/* Card 2: Cash on Delivery (COD) */}
                  <div className="bg-white border rounded-3xl p-6 shadow-xs flex flex-col justify-between hover:border-emerald-100 transition-all relative overflow-hidden">
                    <div className="space-y-4">
                      {/* Top status & toggle */}
                      <div className="flex items-center justify-between">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={paymentGateways.cod.enabled}
                            onChange={(e) => handleUpdateGateway('cod', { enabled: e.target.checked })}
                            className="sr-only peer" 
                          />
                          <div className="w-10 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                          <span className="right-2 mr-2 text-[10px] font-extrabold text-slate-500">
                            {paymentGateways.cod.enabled ? 'مفعل' : 'غير مفعل'}
                          </span>
                        </label>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] bg-slate-100 font-mono text-slate-600 px-2 py-0.5 rounded font-extrabold">COD</span>
                          <span className="p-1 px-1.5 bg-emerald-50 text-emerald-500 rounded-lg">
                            <Wallet className="w-3.5 h-3.5 animate-bounce" />
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="text-center space-y-2 pt-2">
                        <div className="w-12 h-12 bg-emerald-50 text-emerald-650 rounded-full flex items-center justify-center mx-auto text-xl font-bold border border-emerald-100 shadow-2xs">💵</div>
                        <h4 className="font-extrabold text-[#9A2D55] text-xs font-sans">الدفع عند الاستلام (COD)</h4>
                        <span className="inline-block bg-emerald-50 border border-emerald-200 text-emerald-750 text-[9px] px-2.5 py-0.5 rounded-full font-bold">✨ نشط ومتاح للعملاء بالمحرص</span>
                        <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
                          قم بتفعيل الدفع عند الاستلام لمتجركِ لتمكين عملائك من السداد بعد فحص ومعاينة السلع يدوياً.
                        </p>
                      </div>

                      {/* Info field */}
                      <div className="border-t pt-3 space-y-1">
                        <span className="text-[10px] text-slate-400 font-extrabold block">💵 رسوم إضافية تضاف للفاتورة:</span>
                        <p className="text-xs font-extrabold text-slate-800 font-sans bg-emerald-50/50 p-2 rounded-xl border border-emerald-100/40 inline-block">{paymentGateways.cod.extraFee.toFixed(3)} د.ب</p>
                      </div>
                    </div>

                    {/* Bottom action button */}
                    <div className="pt-4 mt-6 border-t">
                      <button 
                        onClick={() => setOpenGatewayConfig(openGatewayConfig === 'cod' ? null : 'cod')}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-[10px] py-2 px-3 rounded-xl cursor-pointer text-center flex items-center justify-center gap-1"
                      >
                        ⚙️ إرشادات وضبط خدمة COD
                      </button>
                    </div>
                  </div>

                  {/* Card 3: Bank Transfer */}
                  <div className="bg-white border rounded-3xl p-6 shadow-xs flex flex-col justify-between hover:border-blue-100 transition-all relative overflow-hidden">
                    <div className="space-y-4">
                      {/* Top status & toggle */}
                      <div className="flex items-center justify-between">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={paymentGateways.bankTransfer.enabled}
                            onChange={(e) => handleUpdateGateway('bankTransfer', { enabled: e.target.checked })}
                            className="sr-only peer" 
                          />
                          <div className="w-10 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                          <span className="right-2 mr-2 text-[10px] font-extrabold text-slate-500">
                            {paymentGateways.bankTransfer.enabled ? 'مفعل' : 'غير مفعل'}
                          </span>
                        </label>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] bg-slate-100 font-mono text-slate-600 px-2 py-0.5 rounded font-extrabold">BANK_TRANSFER</span>
                          <span className="p-1 px-1.5 bg-blue-50 text-blue-500 rounded-lg">
                            <Sliders className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="text-center space-y-2 pt-2">
                        <div className="w-12 h-12 bg-blue-50 text-blue-650 rounded-full flex items-center justify-center mx-auto text-xl font-bold border border-blue-100 shadow-2xs">🏛️</div>
                        <h4 className="font-extrabold text-[#9A2D55] text-xs">حوالة بنكية مباشرة</h4>
                        <span className="inline-block bg-amber-50 border border-amber-200 text-amber-700 text-[9px] px-2.5 py-0.5 rounded-full font-bold">⚠️ تمكين اختياري - مطلوب ترقية</span>
                        <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
                          السماح للعملاء بالدفع عن طريق الحوالات المالية والبنكية لخدمة حسابات متجر بوتيك ألماسة وتأكيد الدفع بالصور.
                        </p>
                      </div>

                      {/* Bank account */}
                      <div className="border-t pt-3 space-y-1">
                        <span className="text-[10px] text-slate-400 font-extrabold block">🏦 الحساب البنكي المعتمد:</span>
                        <div className="bg-slate-50 p-2.5 rounded-xl border space-y-1">
                          <div className="flex justify-between text-[10px] text-slate-600">
                            <span>البنك: {paymentGateways.bankTransfer.bankName}</span>
                          </div>
                          <div className="flex justify-between text-[10px] font-bold text-slate-800 font-mono text-right truncate">
                            <span className="text-[9px] text-[#9A2D55] font-semibold">IBAN:</span>
                            <span>{paymentGateways.bankTransfer.iban}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom action button */}
                    <div className="pt-4 mt-6 border-t">
                      <button 
                        onClick={() => setOpenGatewayConfig(openGatewayConfig === 'bankTransfer' ? null : 'bankTransfer')}
                        className="w-full bg-slate-100 hover:bg-slate-200 text-slate-705 font-extrabold text-[10px] py-2 px-3 rounded-xl cursor-pointer text-center"
                      >
                        ⚙️ إعدادات الحساب والـ IBAN
                      </button>
                    </div>
                  </div>

                  {/* Card 4: vpay */}
                  <div className="bg-white border rounded-3xl p-6 shadow-xs flex flex-col justify-between hover:border-slate-350 transition-all relative overflow-hidden">
                    <div className="space-y-4">
                      {/* Top status & toggle */}
                      <div className="flex items-center justify-between">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={paymentGateways.vpay.enabled}
                            onChange={(e) => handleUpdateGateway('vpay', { enabled: e.target.checked })}
                            className="sr-only peer" 
                          />
                          <div className="w-10 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                          <span className="right-2 mr-2 text-[10px] font-extrabold text-slate-500">
                            {paymentGateways.vpay.enabled ? 'مفعل' : 'غير مفعل'}
                          </span>
                        </label>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] bg-slate-100 font-mono text-slate-600 px-2 py-0.5 rounded font-extrabold">vpay</span>
                          <span className="p-1 px-1.5 bg-rose-50 text-rose-500 rounded-lg">
                            <Globe className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="text-center space-y-2 pt-2">
                        <div className="w-12 h-12 bg-slate-50 font-sans tracking-wide text-[#9A2D55] font-black rounded-full flex items-center justify-center mx-auto text-xs border border-rose-100 shadow-2xs">vpay</div>
                        <h4 className="font-extrabold text-[#9A2D55] text-xs">في باي (vpay Hub)</h4>
                        <span className="inline-block bg-amber-50 border border-amber-200 text-amber-700 text-[9px] px-2.5 py-0.5 rounded-full font-bold">⚠️ مطلوب ترقية الباقة لربط الانتاج</span>
                        <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
                          نظام معالجة المدفوعات الوطني البحريني لتجارة الملابس السريعة والسداد السريع بالبصمة.
                        </p>
                      </div>

                      {/* Currencies supported */}
                      <div className="border-t pt-3 space-y-1">
                        <span className="text-[10px] text-slate-400 font-extrabold block">🌍 العملات المقبولة بالخليج:</span>
                        <div className="flex flex-wrap gap-1">
                          {paymentGateways.vpay.currencies.map(c => (
                            <span key={c} className="text-[10px] bg-slate-50 border px-2 py-0.5 rounded-lg font-bold font-mono text-slate-600">{c}</span>
                          ))}
                        </div>
                      </div>

                      {/* Webhook URL copy block */}
                      <div className="border-t pt-3 space-y-1">
                        <span className="text-[10px] text-slate-400 font-extrabold block">🔗 Webhook URL:</span>
                        <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-xl border text-[10px] font-mono">
                          <span className="truncate flex-1 text-slate-550" title={paymentGateways.vpay.webhookUrl}>{paymentGateways.vpay.webhookUrl}</span>
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(paymentGateways.vpay.webhookUrl);
                              setCopiedTextId('vpay-wh');
                              setTimeout(() => setCopiedTextId(null), 2500);
                            }}
                            className="bg-slate-200 hover:bg-slate-300 px-2 py-0.5 rounded font-sans font-bold cursor-pointer transition-colors"
                          >
                            {copiedTextId === 'vpay-wh' ? 'تم النسخ!' : 'عرض'}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Bottom action button */}
                    <div className="pt-4 mt-6 border-t flex gap-2">
                      <button 
                        onClick={() => setOpenGatewayConfig(openGatewayConfig === 'vpay' ? null : 'vpay')}
                        className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-[10px] py-2 px-3 rounded-xl cursor-pointer text-center"
                      >
                        ⚙️ ربط API وبالمفاتيح
                      </button>
                      <a 
                        href="https://vpay.com" 
                        target="_blank" 
                        rel="noreferrer"
                        className="bg-[#9A2D55] hover:opacity-95 text-white font-extrabold text-[9px] py-2 px-3 rounded-xl cursor-pointer text-center flex items-center justify-center gap-0.5"
                      >
                        زيارة الموقع الرسمي 👋
                      </a>
                    </div>
                  </div>

                </div>

                {/* Inline Setup Editor when clicked */}
                {openGatewayConfig && (
                  <div className="bg-[#FAF6F6] border-2 border-dashed border-[#9A2D55]/30 rounded-3xl p-6 space-y-4 animate-in slide-in-from-bottom duration-300">
                    <div className="flex justify-between items-center pb-2 border-b">
                      <h4 className="font-extrabold text-slate-900 text-xs">
                        ⚙️ إعدادات ربط بوابة الدفع: {openGatewayConfig.toUpperCase()}
                      </h4>
                      <button 
                        onClick={() => setOpenGatewayConfig(null)}
                        className="bg-[#9A2D55] text-white hover:opacity-90 font-extrabold text-[10px] py-1 px-3 rounded-lg cursor-pointer"
                      >
                        إغلاق وحفظ ✕
                      </button>
                    </div>

                    {/* Setup blocks */}
                    {openGatewayConfig === 'tap' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 font-bold block">مفتاح الربط السري (Secret Key):</label>
                          <input 
                            type="text" 
                            value={paymentGateways.tap.secretKey} 
                            onChange={(e) => handleUpdateGateway('tap', { secretKey: e.target.value })}
                            className="bg-white border rounded-xl px-3 py-2 text-xs font-mono w-full text-slate-800"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 font-bold block">مفتاح التطبيق العام (Public Key):</label>
                          <input 
                            type="text" 
                            value={paymentGateways.tap.publicKey} 
                            onChange={(e) => handleUpdateGateway('tap', { publicKey: e.target.value })}
                            className="bg-white border rounded-xl px-3 py-2 text-xs font-mono w-full text-slate-800"
                          />
                        </div>
                      </div>
                    )}

                    {openGatewayConfig === 'cod' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 font-bold block">الرسوم الإضافية لخدمة التوصيل النقدي / دينار بحريني:</label>
                          <input 
                            type="number" 
                            step="0.05"
                            value={paymentGateways.cod.extraFee} 
                            onChange={(e) => handleUpdateGateway('cod', { extraFee: parseFloat(e.target.value) || 0 })}
                            className="bg-white border border-rose-100 rounded-xl px-3 py-2 text-xs font-mono w-full text-slate-800 font-bold"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 font-bold block">تفاصيل وتعليمات COD للزبونة:</label>
                          <input 
                            type="text" 
                            value={paymentGateways.cod.description} 
                            onChange={(e) => handleUpdateGateway('cod', { description: e.target.value })}
                            className="bg-white border border-rose-100 rounded-xl px-3 py-2 text-xs block w-full text-slate-800 font-bold"
                          />
                        </div>
                      </div>
                    )}

                    {openGatewayConfig === 'bankTransfer' && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 font-bold block">اسم البنك المعتمد:</label>
                          <input 
                            type="text" 
                            value={paymentGateways.bankTransfer.bankName} 
                            onChange={(e) => handleUpdateGateway('bankTransfer', { bankName: e.target.value })}
                            className="bg-white border rounded-xl px-3 py-2 text-xs w-full text-slate-800 font-bold"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 font-bold block">اسم المستفيد / الحساب:</label>
                          <input 
                            type="text" 
                            value={paymentGateways.bankTransfer.accountName} 
                            onChange={(e) => handleUpdateGateway('bankTransfer', { accountName: e.target.value })}
                            className="bg-white border rounded-xl px-3 py-2 text-xs w-full text-slate-800 font-bold"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 font-bold block">رقم الآيبان الدولي (IBAN Account Number):</label>
                          <input 
                            type="text" 
                            value={paymentGateways.bankTransfer.iban} 
                            onChange={(e) => handleUpdateGateway('bankTransfer', { iban: e.target.value })}
                            className="bg-white border rounded-xl px-3 py-2 text-xs font-mono w-full text-slate-800 font-bold"
                          />
                        </div>
                        <div className="col-span-1 md:col-span-3 space-y-1">
                          <label className="text-[10px] text-slate-400 font-bold block">إرشادات التحويل المضافة للعملاء:</label>
                          <textarea 
                            rows={2}
                            value={paymentGateways.bankTransfer.description} 
                            onChange={(e) => handleUpdateGateway('bankTransfer', { description: e.target.value })}
                            className="bg-white border rounded-xl px-3 py-2 text-xs block w-full text-slate-800 resize-none font-bold"
                          />
                        </div>
                      </div>
                    )}

                    {openGatewayConfig === 'vpay' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 font-bold block">المعرف التعريفي للتاجر (Merchant ID):</label>
                          <input 
                            type="text" 
                            value={paymentGateways.vpay.merchantId} 
                            onChange={(e) => handleUpdateGateway('vpay', { merchantId: e.target.value })}
                            className="bg-white border rounded-xl px-3 py-2 text-xs font-mono w-full text-slate-800"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 font-bold block">مفتاح الدخول البرمجي (vpay api key):</label>
                          <input 
                            type="text" 
                            value={paymentGateways.vpay.apiKey} 
                            onChange={(e) => handleUpdateGateway('vpay', { apiKey: e.target.value })}
                            className="bg-white border rounded-xl px-3 py-2 text-xs font-mono w-full text-slate-800"
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end gap-2 pt-2">
                      <button 
                        onClick={() => {
                          setOpenGatewayConfig(null);
                          addOperationLog(
                            `تعديل وبناء بوابة ${openGatewayConfig.toUpperCase()}`,
                            `تم حفظ إدخالات الترميز والمقاولة وتعديل مواصفات الاتصال الآمن مع بوابات التخليص الإلكتروني.`,
                            'الأدمين',
                            'system',
                            'success'
                          );
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] py-2 px-5 rounded-xl cursor-pointer shadow-xs"
                      >
                        حفظ التعديلات والتكوينات الآمنة ✔️
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}


            {/* =========================================
                SECTION 12: SHIPPING ZONES (إدارة مناطق وطرق التوصيل)
                ========================================= */}
            {activeMenu === 'shipping_zones' && (
              <div className="space-y-6 animate-in fade-in duration-350" id="shipping-zones-main-view">
                {/* Header card info */}
                <div className="bg-white border rounded-2xl p-6 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex gap-4 items-start">
                      <div className="p-3 bg-rose-50 text-[#9A2D55] rounded-2xl">
                        <Globe className="w-6 h-6 animate-pulse" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-slate-850 text-sm">مناطق الشحن وتفعيل خيارات التوصيل</h3>
                        <p className="text-slate-400 text-[11px] mt-1 leading-relaxed font-semibold">
                          نظم طرق الشحن والتوصيل الجبرية واليدوية حسب المناطق الجغرافية للزبائن في البحرين والخليج العربي.
                        </p>
                      </div>
                    </div>
                    <div>
                      <button 
                        onClick={handleOpenAddZone}
                        className="bg-slate-900 border border-slate-950 hover:bg-slate-850 text-white font-extrabold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-xs whitespace-nowrap"
                        id="btn-add-shipping-zone"
                      >
                        <Plus className="w-4 h-4" />
                        إضافة منطقة شحن جديدة
                      </button>
                    </div>
                  </div>
                </div>

                {/* Zones Grid/List */}
                {shippingZones.length === 0 ? (
                  <div className="bg-white border text-center p-12 rounded-3xl text-slate-400 font-semibold space-y-2">
                    <p className="text-sm">لم يتم تفعيل أو إعداد أي مناطق شحن جغرافية لمتجركِ بعد.</p>
                    <button 
                      onClick={handleOpenAddZone}
                      className="text-[#9A2D55] hover:underline text-xs font-bold"
                    >
                      أضف منطقة شحن الآن للبدء
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {shippingZones.map((zone) => (
                      <div key={zone.id} className="bg-white border rounded-3xl p-6 shadow-xs hover:border-slate-300 transition-all space-y-4" id={`zone-item-card-${zone.id}`}>
                        {/* Zone Header Info */}
                        <div className="flex items-start justify-between border-b pb-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-slate-150 text-slate-700 rounded-xl border border-slate-250">
                              <Globe className="w-4 h-4 text-[#9A2D55]" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-black text-slate-800 text-sm">{zone.name}</h4>
                                <span className="bg-rose-50 text-[#9A2D55] text-[9px] px-2 py-0.5 rounded-full font-bold">
                                  {zone.methods.length} {zone.methods.length === 1 ? 'طريقة شحن' : zone.methods.length === 0 ? 'طريقة شحن' : 'طرق شحن'}
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-1.5 mt-1.5">
                                {zone.countries.map((c: string, idx: number) => (
                                  <span key={idx} className="bg-slate-100 border text-slate-600 text-[10px] px-2.5 py-0.5 rounded-md font-bold font-sans">
                                    🇧🇭 {c}
                                  </span>
                                ))}
                                {zone.cities.length > 0 && (
                                  <span className="bg-slate-50 shadow-3xs text-[9px] text-[#9A2D55] font-semibold border border-rose-100/40 px-2 py-0.5 rounded-md">
                                    المدن/المناطق: {zone.cities.map((city: string) => city).join(', ')}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Zone Header Actions */}
                          <div className="flex items-center gap-1.5">
                            <button 
                              onClick={() => handleOpenEditZone(zone)}
                              className="p-1.5 px-3 border border-slate-200 text-slate-600 hover:text-slate-800 hover:bg-slate-55 rounded-xl text-[10px] font-bold cursor-pointer transition-colors"
                              title="تعديل المنطقة"
                            >
                              ⚙️ تعديل النطاق
                            </button>
                            <button 
                              onClick={() => handleDeleteZone(zone.id)}
                              className="p-1.5 px-3 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl text-[10px] font-bold cursor-pointer transition-colors"
                              title="حذف المنطقة"
                            >
                              🗑️ حذف النطاق
                            </button>
                          </div>
                        </div>

                        {/* Zone Shipping Methods Body */}
                        <div className="space-y-3">
                          {zone.methods.length === 0 ? (
                            <div className="border border-dashed border-slate-200 bg-slate-50/50 p-6 rounded-2xl text-center text-xs text-slate-400 space-y-1">
                              <p className="font-bold text-slate-505">لا توجد طرق شحن مضافة لهذه المنطقة الجغرافية</p>
                              <p className="text-[10px]">أضف طريقة شحن واحدة على الأقل تتيح لعملائكِ اختيار طريقة السداد والتوصيل في صفحة المشتريات.</p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 gap-3">
                              {zone.methods.map((method: any) => (
                                <div 
                                  key={method.id} 
                                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between border border-slate-100 bg-[#FCFCFD] p-4 rounded-2xl hover:border-[#9A2D55]/20 hover:bg-white transition-all gap-4"
                                >
                                  {/* Right side info (Title, Provider tag, details) */}
                                  <div className="flex items-center gap-3">
                                    {/* Icon of type */}
                                    <div className="p-2.5 bg-rose-50 text-[#9A2D55] rounded-xl">
                                      {method.name.includes('استلام') ? (
                                        <Globe className="w-4 h-4 text-rose-500 animate-pulse" />
                                      ) : (
                                        <Sliders className="w-4 h-4 text-[#9A2D55]" />
                                      )}
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <span className="font-extrabold text-[#9A2D55] text-xs">{method.name}</span>
                                        <span className="text-[8px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-black font-mono">
                                          {method.provider || 'LOCAL'}
                                        </span>
                                      </div>
                                      <div className="flex flex-wrap items-center gap-2 mt-1">
                                        <span className="text-[10px] text-slate-400 font-bold">
                                          {method.priceType === 'free' ? 'شحن مجاني' : 'سعر ثابت'}
                                        </span>
                                        <span className="text-[10px] bg-emerald-50 border border-emerald-100 text-emerald-700 font-mono font-black px-2 py-0.5 rounded-lg">
                                          {method.priceType === 'free' ? '0.000 د.ب' : `${parseFloat(method.price).toFixed(3)} د.ب`}
                                        </span>
                                        {method.description && (
                                          <span className="text-[10px] text-slate-400 font-semibold bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md">
                                            {method.description}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Left side actions */}
                                  <div className="flex items-center gap-2 self-end sm:self-center">
                                    <button 
                                      onClick={() => handleOpenEditMethod(zone.id, method)}
                                      className="px-3 py-1.5 text-[10px] font-bold border border-slate-205 text-slate-700 hover:bg-slate-50 rounded-lg cursor-pointer transition-all"
                                    >
                                      تعديل
                                    </button>
                                    <button 
                                      onClick={() => handleDeleteMethod(zone.id, method.id)}
                                      className="px-3 py-1.5 text-[10px] font-bold bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg cursor-pointer transition-all"
                                    >
                                      حذف
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Add shipping method to this zone card line link */}
                          <div className="pt-2">
                            <button 
                              onClick={() => handleOpenAddMethod(zone.id)}
                              className="w-full border-2 border-dashed border-slate-200 hover:border-[#9A2D55]/35 hover:bg-[#FAF6F6] text-slate-[#9A2D55] text-[11px] font-extrabold py-3 rounded-2xl cursor-pointer text-center flex items-center justify-center gap-1.5 transition-all text-[#9A2D55]"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              إضافة طريقة شحن وتوصيل لهذه المنطقة
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* MODAL 1: Add/Edit Shipping Zone */}
                {openZoneModal && (
                  <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden border p-6 space-y-4 shadow-xl animate-in zoom-in-95 duration-150">
                      <div className="flex justify-between items-center border-b pb-2">
                        <h4 className="font-extrabold text-slate-900 text-sm">
                          {editingZoneId ? '✏️ تعديل المنطقة الجغرافية' : '➕ إضافة منطقة شحن جغرافية'}
                        </h4>
                        <button 
                          onClick={() => setOpenZoneModal(false)}
                          className="text-slate-400 hover:text-slate-600 text-base"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="space-y-3 font-semibold text-xs text-slate-700">
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 font-bold block">اسم نطاق الشحن:</label>
                          <input 
                            type="text" 
                            placeholder="مثال: محلي - BH، أو دول مجلس التعاون الخليجي"
                            value={zoneName} 
                            onChange={(e) => setZoneName(e.target.value)}
                            className="bg-white border rounded-xl px-3 py-2 w-full text-slate-800 font-bold"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 font-bold block">الدول أو النطاقات (مفصولة بفاصلة):</label>
                          <input 
                            type="text" 
                            placeholder="البحرين، السعودية، الكويت"
                            value={zoneCountries} 
                            onChange={(e) => setZoneCountries(e.target.value)}
                            className="bg-white border rounded-xl px-3 py-2 w-full text-slate-800 font-bold"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 font-bold block">المدن والمناطق (مفصولة بفاصلة):</label>
                          <textarea 
                            rows={3}
                            placeholder="المنامة، الرفاع الغربي، المحرق، ABHA، ABQAIQ"
                            value={zoneCities} 
                            onChange={(e) => setZoneCities(e.target.value)}
                            className="bg-white border rounded-xl px-3 py-2 w-full text-slate-800 resize-none font-bold"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button 
                          onClick={() => setOpenZoneModal(false)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] py-1.5 px-4 rounded-xl cursor-pointer"
                        >
                          إلغاء
                        </button>
                        <button 
                          onClick={handleSaveZone}
                          className="bg-[#9A2D55] hover:opacity-95 text-white font-extrabold text-[10px] py-1.5 px-5 rounded-xl cursor-pointer shadow-xs"
                        >
                          حفظ النطاق الجغرافي ✔️
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* MODAL 2: Add/Edit Shipping Method */}
                {openMethodModal && (
                  <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden border p-6 space-y-4 shadow-xl animate-in zoom-in-95 duration-150">
                      <div className="flex justify-between items-center border-b pb-2">
                        <h4 className="font-extrabold text-slate-900 text-sm">
                          {editingMethodId ? '✏️ تعديل طريقة شحن في المنطقة' : '➕ إضافة طريقة شحن جديدة'}
                        </h4>
                        <button 
                          onClick={() => setOpenMethodModal(false)}
                          className="text-slate-400 hover:text-slate-600 text-base"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="space-y-3 font-semibold text-xs text-slate-700">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] text-slate-400 font-bold block">اسم طريقة الشحن:</label>
                            <input 
                              type="text" 
                              placeholder="توصيل محلي، استلام، شحن سريع"
                              value={methodName} 
                              onChange={(e) => setMethodName(e.target.value)}
                              className="bg-white border rounded-xl px-3 py-2 w-full text-slate-800 font-bold"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] text-slate-400 font-bold block">مزود الخدمة:</label>
                            <input 
                              type="text" 
                              placeholder="LOCAL, SMSA, ARAMEX, DHL"
                              value={methodProvider} 
                              onChange={(e) => setMethodProvider(e.target.value)}
                              className="bg-white border rounded-xl px-3 py-2 w-full font-mono text-slate-800 font-bold"
                            />
                          </div>
                      </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] text-slate-400 font-bold block">نوع التسعير:</label>
                            <select 
                              value={methodPriceType} 
                              onChange={(e) => setMethodPriceType(e.target.value)}
                              className="bg-white border rounded-xl px-3 py-2 w-full text-slate-850 font-bold"
                            >
                              <option value="fixed">سعر ثابت</option>
                              <option value="free">شحن مجاني</option>
                              <option value="calculated">محسوب متوافق/ديناميكي</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] text-slate-400 font-bold block">سعر التوصيل (د.ب):</label>
                            <input 
                              type="number" 
                              step="0.05"
                              disabled={methodPriceType === 'free'}
                              value={methodPrice} 
                              onChange={(e) => setMethodPrice(parseFloat(e.target.value) || 0)}
                              className="bg-white border rounded-xl px-3 py-2 w-full font-mono text-slate-800 disabled:bg-slate-50 disabled:text-slate-400 font-black"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 font-bold block">تفاصيل ووصف طريقة الشحن:</label>
                          <input 
                            type="text" 
                            placeholder="مثال: توصيل سريع لباب المنزل خلال 24 ساعة بمناسبة العيد"
                            value={methodDescription} 
                            onChange={(e) => setMethodDescription(e.target.value)}
                            className="bg-white border rounded-xl px-3 py-2 w-full text-slate-850 font-bold"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button 
                          onClick={() => setOpenMethodModal(false)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] py-1.5 px-4 rounded-xl cursor-pointer"
                        >
                          إلغاء
                        </button>
                        <button 
                          onClick={handleSaveMethod}
                          className="bg-[#9A2D55] hover:opacity-95 text-white font-extrabold text-[10px] py-1.5 px-5 rounded-xl cursor-pointer shadow-xs"
                        >
                          حفظ تفاصيل السداد والتوصيل ✔️
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}


            {/* =========================================
                DEVELOPMENT PLACEHOLDER ACCORD FOR IMAGES EMPTY SUBMENUS
                ========================================= */}
            {!['dashboard', 'orders', 'sales_log', 'customers', 'shipping_bills', 'categories', 'products', 'inventory', 'reviews', 'coupons', 'payment_gateways', 'shipping_zones'].includes(activeMenu) && (
              <div className="bg-white border rounded-2xl p-8 text-center text-slate-400 font-semibold text-xs py-16">
                <p className="text-lg font-bold text-[#9A2D55] mb-2 font-mono">⚜️ القسم: {activeMenu.toUpperCase()} قيد العمل ⚜️</p>
                <p className="leading-relaxed text-slate-500">
                  تم تهيئة هذا الإعداد المتوافق مع شاشات الإدارة بنجاح وفق رغبتكم. هذا الحقل يمنح الإدارة وصولاً كاملاً لتخزين التحديثات ومعايراتها.
                </p>
                <div className="w-16 h-1 bg-[#9A2D55] rounded mx-auto mt-4" />
              </div>
            )}

          </main>

          {/* C. MODAL overlay: Full Order Card Details (تفاصيل الطلب الكاملة وسجل العمليات) */}
          {selectedOrder && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto" id="order-card-detail-modal">
              <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden border p-6 space-y-6 max-h-[90vh] overflow-y-auto">
                
                {/* Header */}
                <div className="flex justify-between items-center border-b pb-3">
                  <h3 className="font-extrabold text-slate-900 text-base">بطاقة الطلب وتفاصيله الكاملة #{selectedOrder.id}</h3>
                  <button onClick={() => setSelectedOrder(null)} className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-500">
                    ✕ أغلق
                  </button>
                </div>

                {/* Grid 1: Customer metadata */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl text-xs font-semibold">
                  <div>
                    <h4 className="text-[10px] text-slate-400 font-bold block mb-1">تفاصيل مستلمة الطرد:</h4>
                    <p className="text-slate-800 text-sm">{selectedOrder.customer.name}</p>
                    <p className="text-slate-500">📞 الهاتف: {selectedOrder.customer.phone}</p>
                    <p className="text-slate-500">✉️ البريد: {selectedOrder.customer.email}</p>
                  </div>
                  <div>
                    <h4 className="text-[10px] text-slate-400 font-bold block mb-1">وجهة التوصيل والشحن:</h4>
                    <p className="text-slate-800">{selectedOrder.customer.address}</p>
                    <p className="text-slate-650">{selectedOrder.customer.city}، {selectedOrder.customer.country}</p>
                    <p className="text-[#9A2D55] font-mono mt-1">كود التتبع: {selectedOrder.trackingCode}</p>
                  </div>
                </div>

                {/* Items detail list */}
                <div>
                  <h4 className="text-slate-800 text-xs font-bold mb-2">أطقم قماش المخاوير المنتقاة:</h4>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex gap-3 bg-slate-50 p-3 rounded-xl border text-xs font-bold items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img src={item.product.image} alt={item.product.name} referrerPolicy="no-referrer" className="w-10 h-10 object-cover rounded-lg" />
                          <div>
                            <span className="text-slate-800 block leading-tight">{item.product.name}</span>
                            <span className="text-[9px] text-[#9A2D55] block">المقاس: {item.selectedSize} | اللون: {item.selectedColor}</span>
                          </div>
                        </div>
                        <span className="text-slate-500 shrink-0">كمية: {item.quantity} × {item.product.price} BHD</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Financial overview */}
                <div className="border-t border-dashed border-slate-200 pt-4 text-xs font-bold space-y-1">
                  <div className="flex justify-between text-slate-400">
                    <span>المجموع الفرعي:</span>
                    <span>{selectedOrder.subtotal.toFixed(2)} د.ب</span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>الخصم بالكوبون:</span>
                      <span>-{selectedOrder.discount.toFixed(2)} د.ب</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-400">
                    <span>شحنات كارجو:</span>
                    <span>{selectedOrder.shippingFee === 0 ? 'مجاااني' : `${selectedOrder.shippingFee.toFixed(2)} د.ب`}</span>
                  </div>
                  <div className="flex justify-between text-sm text-[#9A2D55] font-extrabold pt-1">
                    <span>القيمة الإجمالية المدفوعة الكترونياً:</span>
                    <span className="font-mono">{selectedOrder.total.toFixed(2)} د.ب</span>
                  </div>
                </div>

                {/* Notes */}
                {selectedOrder.notes && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[11px] font-bold text-amber-800 space-y-1">
                    <span>📝 ملاحظات المخور وتفاصيل القماش الفنية:</span>
                    <p className="font-normal italic">"{selectedOrder.notes}"</p>
                  </div>
                )}

                {/* Order Timeline (سجل خط سير الطلب) */}
                <div className="border-t pt-4">
                  <h4 className="text-slate-800 text-xs font-bold mb-3">سجل وخط سير الطرد ألماسي (Timeline)</h4>
                  <div className="space-y-3 font-semibold text-xs">
                    {selectedOrder.timeline.map((event, idx) => (
                      <div key={idx} className="bg-[#FAF6F6] p-2.5 rounded-lg border border-rose-100 flex justify-between items-start">
                        <div>
                          <strong className="text-slate-800 text-[11px] block">{event.title}</strong>
                          <p className="text-slate-500 text-[10px] mt-0.5">{event.description}</p>
                        </div>
                        <span className="text-[9px] text-slate-400 font-mono mt-1">{event.date}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Print Invoice Button / Print */}
                <div className="pt-4 border-t flex justify-end gap-2">
                  <button 
                    onClick={() => { setSelectedOrder(null); alert('جاري توجيه الأمر للطابعة المركزية للمعمل...'); }}
                    className="bg-slate-900 text-white font-extrabold px-6 py-2.5 rounded-xl text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" /> طباعة الفاتورة والوصل 🧾
                  </button>
                </div>

              </div>
            </div>
          )}


          {/* D. PRINTABLE SHIPPING LABEL (بوليصة الشحن) VISUAL POPUP */}
          {showShippingLabel && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50" id="visual-shipping-bill-popup">
              <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden border p-6 space-y-4 shadow-2xl relative font-sans">
                
                {/* Visual Label layout mock */}
                <div className="border-4 border-black p-4 space-y-4 text-black select-all text-right font-medium">
                  
                  {/* barcode mock */}
                  <div className="flex justify-between items-center border-b-2 border-black pb-2 text-xs">
                    <span className="font-mono text-xs">SA-ARAMEX-02213</span>
                    <strong className="font-black text-sm">أركس بلس / Aramex Plus</strong>
                  </div>

                  <div className="text-center py-2 h-14 bg-black flex items-center justify-center text-white text-3xl font-mono tracking-widest leading-none">
                    ||||| ||| |||| || || |
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs border-b border-black pb-2">
                    <div>
                      <span className="text-[10px] text-slate-500 block">رقم طرد التتبع:</span>
                      <strong className="font-mono font-bold">{showShippingLabel.trackingCode}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">مرجع ألماسة:</span>
                      <strong className="font-mono font-bold">ALM-{showShippingLabel.id}</strong>
                    </div>
                  </div>

                  <div className="text-xs border-b border-black pb-2">
                    <span className="text-[10px] text-slate-500 block">من الشاحن (Shipper):</span>
                    <strong className="block text-slate-800 font-extrabold text-xs">متجر مخاوير ألماسة الموحد (almaasa.bh)</strong>
                    <span className="block text-[11px] text-slate-500 font-semibold">مملكة البحرين - الرفاع الغربي 🇧🇭</span>
                  </div>

                  <div className="text-xs">
                    <span className="text-[10px] text-slate-500 block">إلى المستلمة (Consignee):</span>
                    <strong className="block text-slate-800 font-extrabold text-sm">{showShippingLabel.customer.name}</strong>
                    <span className="block text-xs text-slate-700 font-semibold">{showShippingLabel.customer.address}</span>
                    <span className="block text-xs text-slate-700 font-bold">{showShippingLabel.customer.city}، {showShippingLabel.customer.country}</span>
                    <span className="block text-xs font-mono text-[#9A2D55] font-extrabold mt-1">الهاتف: {showShippingLabel.customer.phone}</span>
                  </div>

                  <div className="bg-slate-100 p-2 text-[10px] text-slate-700 text-center rounded border border-black/20">
                    نوع المحتوى: جلابية مطرزة يدوياً "مخور" مع كيس هدايا خاص وشيلة 🧕
                  </div>

                </div>

                {/* Print confirmation tools */}
                <div className="pt-2 flex justify-between gap-2 text-xs">
                  <button onClick={() => setShowShippingLabel(null)} className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 rounded-xl font-bold">
                    إلغاء المعاينة
                  </button>

                  <button 
                    onClick={() => { setShowShippingLabel(null); alert('جاري إطلاق الأمر وجمل البوليسية لخطوط الشحن Aramex...'); }}
                    className="bg-[#9A2D55] text-white px-6 py-2 rounded-xl font-extrabold cursor-pointer"
                  >
                    تفويض وإرسال البوليسية 🖨️
                  </button>
                </div>

              </div>
            </div>
          )}


          {/* PRODUCT ADD MODAL */}
          {showAddProductModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto" id="product-add-modal">
              <div className="bg-white rounded-3xl w-full max-w-lg p-6 border shadow-xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                  <strong className="text-slate-800 text-base">إضافة قطعة مخور جديدة للكتالوج</strong>
                  <button onClick={() => setShowAddProductModal(false)} className="text-slate-400 hover:text-slate-650">✕ أغلق</button>
                </div>

                <form onSubmit={handleAddProduct} className="space-y-4 font-semibold text-xs text-slate-600">
                  <div>
                    <label className="block mb-1">اسم الموديل الجديد *</label>
                    <input 
                      type="text" 
                      placeholder="مخور الكافيار الوردي اللامع" 
                      value={pName}
                      onChange={(e) => setPName(e.target.value)}
                      required
                      className="w-full bg-slate-50 border rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#9A2D55]"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block">وصف المنتج الفني والخيام *</label>
                      <button
                        type="button"
                        onClick={handleGenerateAIDesc}
                        disabled={isGeneratingDesc}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all ${
                          isGeneratingDesc
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : 'bg-rose-50 hover:bg-rose-100 text-[#9A2D55] border border-rose-100 shadow-xs cursor-pointer'
                        }`}
                      >
                        {isGeneratingDesc ? (
                          <>
                            <span className="w-2 h-2 rounded-full bg-[#9A2D55] animate-ping" />
                            جاري جلب الوصف الفخم...
                          </>
                        ) : (
                          <>
                            <span>✨ كتابة بالذكاء الاصطناعي</span>
                          </>
                        )}
                      </button>
                    </div>
                    <textarea 
                      placeholder="اكتبي مواصفات القماش، الزينة، ومناسبة هذا المخور أو انقري على كتابة الوصف السحري أعلاه..." 
                      value={pDesc}
                      onChange={(e) => setPDesc(e.target.value)}
                      rows={3}
                      className="w-full bg-slate-50 border rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#9A2D55]"
                    />
                    {aiError && (
                      <p className="text-[10px] text-red-600 font-bold mt-1">{aiError}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block mb-1">سعر المبيع الماسي *</label>
                      <input 
                        type="number" 
                        value={pPrice}
                        onChange={(e) => setPPrice(Number(e.target.value))}
                        required
                        className="w-full bg-slate-50 border rounded-xl px-3 py-2 text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block mb-1">السعر الأصلي قبل الخصم (اختياري)</label>
                      <input 
                        type="number" 
                        value={pOrigPrice}
                        onChange={(e) => setPOrigPrice(e.target.value)}
                        placeholder="مثال: 45"
                        className="w-full bg-slate-50 border rounded-xl px-3 py-2 text-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block mb-1">المخزون البدئي (طقم) *</label>
                      <input 
                        type="number" 
                        value={pStock}
                        onChange={(e) => setPStock(Number(e.target.value))}
                        required
                        className="w-full bg-slate-50 border rounded-xl px-3 py-2 text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block mb-1">القسم الفعلي والمكان</label>
                      <select 
                        value={pCategory} 
                        onChange={(e) => setPCategory(e.target.value)}
                        className="w-full bg-slate-50 border rounded-xl px-3 py-2 text-xs focus:outline-none"
                      >
                        <option value="available">المتوفر حالياً</option>
                        <option value="with-sheilah">مخاوير مع شيلة 🧕</option>
                        <option value="kids">مخاوير الأطفال 👶</option>
                        <option value="mother-daughter">طقم الأم والبنت 👩‍👧</option>
                        <option value="accessories">اكسسوارات ومجوهرات 💍</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block mb-1">المقاسات المتاحة (مفصولة بفاصلة)</label>
                      <input 
                        type="text" 
                        value={pSizes}
                        onChange={(e) => setPSizes(e.target.value)}
                        className="w-full bg-slate-50 border rounded-xl px-3 py-2 text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block mb-1">ألوان التطريز (مفصولة بفاصلة)</label>
                      <input 
                        type="text" 
                        value={pColors}
                        onChange={(e) => setPColors(e.target.value)}
                        className="w-full bg-slate-50 border rounded-xl px-3 py-2 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block mb-1">صورة المخور المميزة *</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
                      {/* Image upload area */}
                      <div className="border-2 border-dashed border-rose-200 hover:border-[#9A2D55] bg-rose-50/10 rounded-2xl p-4 text-center cursor-pointer transition-all relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="space-y-1 text-slate-500 pointer-events-none">
                          <span className="text-2xl block">📸</span>
                          <span className="text-xs font-bold text-[#9A2D55] block">اسحبي صورة المخور هنا أو انقري لتحديد ملف</span>
                          <span className="text-[10px] text-slate-400 block">يدعم JPG, PNG, WebP (أقل من 8 ميجا)</span>
                        </div>
                      </div>

                      {/* Display preview & fallback text url */}
                      <div className="bg-slate-50 p-3 rounded-2xl border space-y-2">
                        <div className="flex items-center gap-2">
                          <img 
                            src={pImage || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600&auto=format&fit=crop'} 
                            alt="Preview" 
                            referrerPolicy="no-referrer"
                            className="w-12 h-12 rounded-lg object-cover border border-rose-100 shadow-xs shrink-0 bg-white" 
                          />
                          <div className="flex-1 overflow-hidden">
                            <span className="text-[10px] text-slate-400 block font-bold">حالة الصورة / الرابط المباشر:</span>
                            <input 
                              type="text" 
                              value={pImage.startsWith('data:') ? 'تم تحميل ملف الصورة بنجاح (Base64)' : pImage}
                              onChange={(e) => {
                                if (!e.target.value.startsWith('تم تحميل')) {
                                  setPImage(e.target.value);
                                }
                              }}
                              placeholder="رابط الصورة البديل..."
                              className="w-full bg-white border rounded-lg px-2 py-1 text-[10px] focus:outline-none focus:ring-1 focus:ring-[#9A2D55]"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t text-xs">
                    <input 
                      type="checkbox" 
                      id="phassheilah" 
                      checked={pHasSheilah} 
                      onChange={(e) => setPHasSheilah(e.target.checked)}
                    />
                    <label htmlFor="phassheilah" className="font-bold">الموديل يشتمل على شيلة مطابقة للأطراف 🧕</label>
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button type="submit" className="bg-[#9A2D55] text-white font-extrabold px-6 py-2 rounded-xl">
                      تأكيد وعرض القطعة في المتجر
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
