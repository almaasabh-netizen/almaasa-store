import { Product, Order, OperationLog, Category, Coupon, SizeGuide, Review, StoreSettings } from './types';

// Standard mock products inspired by Almaasa Instagram images
const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'مخور ملكي مطرز بالخرز اللامع - وردي هادئ',
    description: 'مخور تقليدي فاخر من قماش الحرير الناعم مطرز يدوياً بنقشات هندسية رقيقة وصمغ وحبات الخرز الكريستالية اللامعة. تصميم ناعم مريح للغاية ومناسب للأعياد والمناسبات السعيدة.',
    category: 'available',
    price: 32.0,
    originalPrice: 40.0,
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600&auto=format&fit=crop', // Elegant soft fashion
    stock: 12,
    rating: 5.0,
    reviewCount: 14,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['وردي فاتر', 'ذهبي شامبين', 'أبيض كريمي'],
    hasSheilah: true,
    properties: [
      { label: 'نوع القماش', value: 'حرير اندونيسي ممتاز' },
      { label: 'نوع التطريز', value: 'تطريز يدوي بالخرز والترتر' },
      { label: 'بلد الصنع', value: 'البحرين والامارات' },
      { label: 'مشتملات الطقم', value: 'مخور مع شيلة مكشكشة الأطراف' }
    ]
  },
  {
    id: 'prod-2',
    name: 'طقم الأم والبنت - مخاوير العيد الكلاسيكية',
    description: 'طقم من قطعتين متناسقتين للأم وابنتها بتطريز متطابق بنقشات الزهور الربيعية والورود الملونة. مصنوع من القطن البارد المناسب للأجواء الصيفية.',
    category: 'mother-daughter',
    price: 48.0,
    originalPrice: 55.0,
    image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=600&auto=format&fit=crop', // Elegant embroidered dress detail
    stock: 5,
    rating: 4.8,
    reviewCount: 9,
    sizes: ['M', 'L', 'XL', 'Kids 4Y', 'Kids 6Y', 'Kids 8Y'],
    colors: ['خوخي ناعم', 'بنفسجي لافندر'],
    hasSheilah: false,
    properties: [
      { label: 'نوع القماش', value: 'قطن بارد 100%' },
      { label: 'الوزن', value: 'خفيف وملائم للصيف' },
      { label: 'تفاصيل الصدر', value: 'ياقة مطرزة بخيوط الحرير الذهبي' }
    ]
  },
  {
    id: 'prod-3',
    name: 'مخور مخمل مع شيلة حريرية حمراء فاخرة',
    description: 'تصميم خاص مطرز بأسلوب هندي فاخر يجمع بين الأصالة والحداثة تلتف حوله خيوط القصب اللامعة مع فصوص الألماس الزجاجية المتلألئة.',
    category: 'with-sheilah',
    price: 36.5,
    image: 'https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?q=80&w=600&auto=format&fit=crop', // Rich traditional embroidery
    stock: 8,
    rating: 4.9,
    reviewCount: 22,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['أحمر عقيق', 'أزرق تركواز', 'أخضر يشم'],
    hasSheilah: true,
    properties: [
      { label: 'نوع القماش', value: 'ستان هندي ملكي' },
      { label: 'الشيلة', value: 'شيلة شيفون مطابقة مع تطريز على الأطراف' },
      { label: 'صيانة القماش', value: 'غسيل جاف فقط لضمان بقاء الفصوص' }
    ]
  },
  {
    id: 'prod-4',
    name: 'مخور الأطفال بنقش الورود والشرائط الرقيقة',
    description: 'قطعة رائعة صممت خصيصاً بنقشة خفيفة وحركة مريحة لتدخل البهجة بقلب طفلتك في العيد. خفيفة جداً ومبطنة بطبقة ناعمة لحماية بشرة الأطفال.',
    category: 'kids',
    price: 18.0,
    originalPrice: 24.0,
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=600&auto=format&fit=crop', // Children traditional elegant styling
    stock: 14,
    rating: 4.7,
    reviewCount: 11,
    sizes: ['2Y', '4Y', '6Y', '8Y', '10Y'],
    colors: ['وردي فاتح', 'أزرق سماوي'],
    hasSheilah: false,
    properties: [
      { label: 'الفئة العمرية', value: 'من سنتين إلى 10 سنوات' },
      { label: 'القماش', value: 'شيفون فرنسي مبطن بقطن بارد' },
      { label: 'مستوى الأمان', value: 'تطريز مريح خالي من الأطراف الحادة' }
    ]
  },
  {
    id: 'prod-5',
    name: 'بروش ألماسة الفضي مطعم بالكريستال الحر',
    description: 'بروش فاخر ومميز مستوحى من شكل الألماسة الأنيق ومطلي بالفضية اللامعة لمنح المخور هيبة وأناقة متكاملة.',
    category: 'accessories',
    price: 6.5,
    originalPrice: 8.0,
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop', // Luxury brooch jewel
    stock: 30,
    rating: 5.0,
    reviewCount: 31,
    sizes: ['قياس موحد'],
    colors: ['فضي دياموند', 'ذهبي ملكي'],
    hasSheilah: false,
    properties: [
      { label: 'الطلاء', value: 'فضة عيار 925 مقاومة للصدأ' },
      { label: 'نوع الحجر', value: 'زركون ناصع اللمعان بقطع بريليانت' }
    ]
  },
  {
    id: 'prod-6',
    name: 'مخور الأورجانزا الفاخر مع تطريز السيرما',
    description: 'أرقى أنواع أقمشة الأورجانزا الشفافة مطرز بكثافة باللون الذهبي البراق، يعطي طابعاً ملكياً مبهراً يلفت الأنظار وبأكمام منفوخة واسعة.',
    category: 'available',
    price: 45.0,
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=600&auto=format&fit=crop', // Beautiful luxury fabric
    stock: 4,
    rating: 4.6,
    reviewCount: 7,
    sizes: ['M', 'L', 'XL'],
    colors: ['أوف وايت', 'أخضر ملكي مذهب'],
    hasSheilah: true,
    properties: [
      { label: 'القماش', value: 'أورجانزا يابانية أصلية' },
      { label: 'التطريز', value: 'قصب دهبي وسيرما فاخرة كلاسيكية' }
    ]
  }
];

const INITIAL_CATEGORIES: Category[] = [
  { id: 'all', name: 'الكل', slug: 'all', count: 6 },
  { id: 'with-sheilah', name: 'مخاوير مع شيلة', slug: 'with-sheilah', count: 2 },
  { id: 'kids', name: 'مخاوير الأطفال', slug: 'kids', count: 1 },
  { id: 'available', name: 'المتوفر حالياً', slug: 'available', count: 2 },
  { id: 'mother-daughter', name: 'طقم الأم والبنت', slug: 'mother-daughter', count: 1 },
  { id: 'accessories', name: 'اكسسوارات', slug: 'accessories', count: 1 }
];

const INITIAL_SIZE_GUIDES: SizeGuide[] = [
  {
    id: 'g-1',
    name: 'جدول مقاسات المخاوير للبالغين',
    sizes: [
      { label: 'S', chest: '36 بوصة', length: '54 بوصة', waist: '32 بوصة', sleeve: '22 بوصة' },
      { label: 'M', chest: '39 بوصة', length: '56 بوصة', waist: '34 بوصة', sleeve: '23  بوصة' },
      { label: 'L', chest: '42 بوصة', length: '58 بوصة', waist: '37 بوصة', sleeve: '23.5 بوصة' },
      { label: 'XL', chest: '46 بوصة', length: '60 بوصة', waist: '41 بوصة', sleeve: '24 بوصة' },
      { label: 'XXL', chest: '50 بوصة', length: '60 بوصة', waist: '45 بوصة', sleeve: '24.5 بوصة' }
    ]
  },
  {
    id: 'g-2',
    name: 'جدول مقاسات مخاوير الأطفال',
    sizes: [
      { label: '2Y', chest: '22 بوصة', length: '28 بوصة', waist: '21 بوصة', sleeve: '12 بوصة' },
      { label: '4Y', chest: '24 بوصة', length: '32 بوصة', waist: '23 بوصة', sleeve: '14 بوصة' },
      { label: '6Y', chest: '26 بوصة', length: '38 بوصة', waist: '25 بوصة', sleeve: '16 بوصة' },
      { label: '8Y', chest: '28 بوصة', length: '44 بوصة', waist: '27 بوصة', sleeve: '18 بوصة' },
      { label: '10Y', chest: '30 بوصة', length: '49 بوصة', waist: '29 بوصة', sleeve: '19 بوصة' }
    ]
  }
];

const INITIAL_COUPONS: Coupon[] = [
  { code: 'ALMAASA10', discount: 10, type: 'percentage', isActive: true, usageCount: 45 },
  { code: 'EID2026', discount: 5.0, type: 'fixed', isActive: true, usageCount: 22 },
  { code: 'FREE_SHIP', discount: 0, type: 'percentage', isActive: false, usageCount: 0 }
];

const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    productId: 'prod-1',
    productName: 'مخور ملكي مطرز بالخرز اللامع - وردي هادئ',
    customerName: 'فاطمة الكعبي',
    rating: 5,
    comment: 'ما شاء الله تبارك الرحمن، المخور بالواقع وايد أجمل من الصور والتطريز ثجيل ومرتب والشيفون وايد بارد. الشحنة وصلت البحرين بـ 3 أيام فقط والخدمة وايد ممتازة.',
    date: '2026-05-28',
    approved: true
  },
  {
    id: 'rev-2',
    productId: 'prod-2',
    productName: 'طقم الأم والبنت - مخاوير العيد الكلاسيكية',
    customerName: 'مريم الدوسري',
    rating: 5,
    comment: 'طلبته حق العيد لي ولبنتي الصغيرة يجنننن وخامته ناعمة وباردة والكل سألني عنه! مشكورين ألماسة على القطع الرايقة.',
    date: '2026-05-30',
    approved: true
  }
];

const INITIAL_SETTINGS: StoreSettings = {
  storeName: 'Almaasa / مخاوير ألماسة',
  storeBio: 'مخاوير ألماسة 💎 توصيل لجميع دول العالم ✈️🇧🇭 للطلب والتفاصيل تصفحي المنتجات والدفع آمن وتتبع مباشر لطلبكِ بكل سهولة.',
  whatsappNumber: '97337037697',
  instagramUsername: 'almaasa.bh',
  currency: 'د.ب (BHD)',
  shippingCost: 2.5,
  freeShippingThreshold: 50,
  themeColor: 'pink',
  enablePaymentMock: true
};

const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-1001',
    trackingCode: 'AL-92813-BH',
    customer: {
      name: 'عائشة أحمد البنعلي',
      email: 'aisha@example.com',
      phone: '+973 3944 5512',
      address: 'فيلا 12، طريق 2203، مجمع 922',
      city: 'الرفاع الغربي',
      country: 'البحرين'
    },
    items: [
      {
        product: INITIAL_PRODUCTS[0],
        quantity: 1,
        selectedSize: 'L',
        selectedColor: 'وردي فاتر'
      }
    ],
    subtotal: 32.0,
    discount: 3.2, // 10% coupon
    shippingFee: 2.5,
    total: 31.3,
    paymentMethod: 'benefit',
    paymentStatus: 'paid',
    shippingStatus: 'processing',
    date: '2026-05-30T14:22:00Z',
    notes: 'الرجاء كتابة كارت تهنئة: عساكم من عواده بمناسبة العيد الحبيب',
    timeline: [
      { title: 'تم استلام الطلب', description: 'تم استلام الطلب بنجاح وجاري تحضيره للتجهيز وننتظر تأكيد الدفع الإلكتروني.', date: '2026-05-30 14:22', status: 'pending' },
      { title: 'تأكيد الدفع', description: 'تم تأكيد السداد الإلكتروني بنجاح بواسطة بنفت بي (BenefitPay). المبلغ مسدد كلياً.', date: '2026-05-30 14:25', status: 'pending' },
      { title: 'جاري التجهيز والتحضير', description: 'بدأ فريق التطريز والمقاسات مراجعة القياسات المحددة لتجهيز الطرود.', date: '2026-05-31 09:30', status: 'processing' }
    ]
  },
  {
    id: 'ord-1002',
    trackingCode: 'AL-51203-SA',
    customer: {
      name: 'سارة بنت محمد آل سعود',
      email: 'sara.saud@example.com',
      phone: '+966 55 412 8822',
      address: 'شارع التخصصي، حي المعذر الشمالي',
      city: 'الرياض',
      country: 'السعودية'
    },
    items: [
      {
        product: INITIAL_PRODUCTS[2],
        quantity: 2,
        selectedSize: 'XL',
        selectedColor: 'أحمر عقيق'
      },
      {
        product: INITIAL_PRODUCTS[4],
        quantity: 1,
        selectedSize: 'قياس موحد',
        selectedColor: 'فضي دياموند'
      }
    ],
    subtotal: 79.5,
    discount: 0,
    shippingFee: 0, // Free shipping above 50
    total: 79.5,
    paymentMethod: 'card',
    paymentStatus: 'paid',
    shippingStatus: 'shipped',
    date: '2026-05-29T10:15:00Z',
    notes: 'الشحن السريع أرجوكم للتسليم قبل عطلة نهاية الأسبوع',
    timeline: [
      { title: 'تم استلام الطلب وبدء التحضير', description: 'تم تسجيل تفاصيل الطلب بشكل فوري في النظام.', date: '2026-05-29 10:15', status: 'pending' },
      { title: 'تأكيد الدفع', description: 'تمت قنوات السداد بنجاح عن طريق الدفع بالبطاقة الائتمانية.', date: '2026-05-29 10:18', status: 'pending' },
      { title: 'جاري التغليف في المعمل', description: 'تم تجهيز كيس الهدايا وعبوتنا الخاصة وتثبيت مخاوير الشرفية.', date: '2026-05-29 16:40', status: 'processing' },
      { title: 'تم الشحن مع أرامكس', description: 'تم تسليم الشحنة لشركة النقل أرامكس. رقم التتبع الشحنة: ARMX-92138241.', date: '2026-05-30 11:00', status: 'shipped' }
    ]
  }
];

const INITIAL_LOGS: OperationLog[] = [
  {
    id: 'log-1',
    action: 'تهيئة المتجر والمخزون',
    details: 'تم تجهيز وإطلاق مخزون مخاوير ألماسة الافتراضي بنجاح وتفعيل جدول السلع.',
    date: '2026-05-31 08:00',
    operator: 'النظام',
    type: 'system',
    severity: 'success'
  },
  {
    id: 'log-2',
    action: 'تأكيد دفع طلب #1001',
    details: 'أكد السداد التلقائي لطلب السيدة عائشة البنعلي بنجاح بمبلغ 31.3 د.ب.',
    date: '2026-05-30 14:25',
    operator: 'بوابة الدفع الإلكتروني',
    type: 'payment',
    severity: 'success'
  },
  {
    id: 'log-3',
    action: 'تغيير حالة الشحن طلب #1002',
    details: 'تم تعديل حالة الطلب #1002 إلى "تم الشحن" مع شركة النقل أرامكس.',
    date: '2026-05-30 11:00',
    operator: 'مها أحمد (مدير العمليات)',
    type: 'order',
    severity: 'info'
  }
];

// Helper functions for state resolution with active localStorage caching
export const getStoredData = () => {
  if (typeof window === 'undefined') return {
    products: INITIAL_PRODUCTS,
    orders: INITIAL_ORDERS,
    logs: INITIAL_LOGS,
    categories: INITIAL_CATEGORIES,
    coupons: INITIAL_COUPONS,
    settings: INITIAL_SETTINGS,
    sizeGuides: INITIAL_SIZE_GUIDES,
    reviews: INITIAL_REVIEWS
  };

  const products = localStorage.getItem('ama_products') ? JSON.parse(localStorage.getItem('ama_products')!) : INITIAL_PRODUCTS;
  const orders = localStorage.getItem('ama_orders') ? JSON.parse(localStorage.getItem('ama_orders')!) : INITIAL_ORDERS;
  const logs = localStorage.getItem('ama_logs') ? JSON.parse(localStorage.getItem('ama_logs')!) : INITIAL_LOGS;
  const categories = localStorage.getItem('ama_categories') ? JSON.parse(localStorage.getItem('ama_categories')!) : INITIAL_CATEGORIES;
  const coupons = localStorage.getItem('ama_coupons') ? JSON.parse(localStorage.getItem('ama_coupons')!) : INITIAL_COUPONS;
  const settings = localStorage.getItem('ama_settings') ? JSON.parse(localStorage.getItem('ama_settings')!) : INITIAL_SETTINGS;
  const sizeGuides = localStorage.getItem('ama_size_guides') ? JSON.parse(localStorage.getItem('ama_size_guides')!) : INITIAL_SIZE_GUIDES;
  const reviews = localStorage.getItem('ama_reviews') ? JSON.parse(localStorage.getItem('ama_reviews')!) : INITIAL_REVIEWS;
  const shippingZones = localStorage.getItem('ama_shipping_zones') ? JSON.parse(localStorage.getItem('ama_shipping_zones')!) : [];

  return { products, orders, logs, categories, coupons, settings, sizeGuides, reviews, shippingZones };
};

export const saveStoredData = (data: {
  products?: Product[];
  orders?: Order[];
  logs?: OperationLog[];
  categories?: Category[];
  coupons?: Coupon[];
  settings?: StoreSettings;
  sizeGuides?: SizeGuide[];
  reviews?: Review[];
  shippingZones?: any[];
}) => {
  if (typeof window === 'undefined') return;

  if (data.products) localStorage.setItem('ama_products', JSON.stringify(data.products));
  if (data.orders) localStorage.setItem('ama_orders', JSON.stringify(data.orders));
  if (data.logs) localStorage.setItem('ama_logs', JSON.stringify(data.logs));
  if (data.categories) localStorage.setItem('ama_categories', JSON.stringify(data.categories));
  if (data.coupons) localStorage.setItem('ama_coupons', JSON.stringify(data.coupons));
  if (data.settings) localStorage.setItem('ama_settings', JSON.stringify(data.settings));
  if (data.sizeGuides) localStorage.setItem('ama_size_guides', JSON.stringify(data.sizeGuides));
  if (data.reviews) localStorage.setItem('ama_reviews', JSON.stringify(data.reviews));
  if (data.shippingZones) localStorage.setItem('ama_shipping_zones', JSON.stringify(data.shippingZones));
};

export const addOperationLog = (action: string, details: string, operator: string, type: OperationLog['type'], severity: OperationLog['severity'] = 'info') => {
  const { logs } = getStoredData();
  const dateStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
  const newLog: OperationLog = {
    id: `log-${Date.now()}`,
    action,
    details,
    date: dateStr,
    operator,
    type,
    severity
  };
  const updatedLogs = [newLog, ...logs];
  saveStoredData({ logs: updatedLogs });
  return updatedLogs;
};
