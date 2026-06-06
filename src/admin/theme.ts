export const theme = {
  primary: '#D79AA8',
  secondary: '#F3E6E8',
  background: '#FFF8F8',
  text: '#5A4047',
  accent: '#C77D8A',
  success: '#4CAF82',
  warning: '#F5A623',
  danger: '#E05C6E',
  info: '#5B8DEF',
  border: '#F0DDE0',
  sidebar: '#FFFFFF',
  card: '#FFFFFF',
};

export const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  new:        { bg: '#EBF5FF', text: '#3B82F6', label: 'جديد' },
  processing: { bg: '#FFF7ED', text: '#F59E0B', label: 'قيد التجهيز' },
  shipping:   { bg: '#F0FDF4', text: '#22C55E', label: 'تم الشحن' },
  delivered:  { bg: '#DCFCE7', text: '#16A34A', label: 'تم التسليم' },
  cancelled:  { bg: '#FEF2F2', text: '#EF4444', label: 'ملغي' },
  returned:   { bg: '#FDF4FF', text: '#A855F7', label: 'مُرتجع' },
};
