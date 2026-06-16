import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  text: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

export function useToast() {
  const [toasts, setToasts] = React.useState<ToastMessage[]>([]);

  const toast = (text: string, type: ToastType = 'info') => {
    const id = `t_${Date.now()}`;
    setToasts(prev => [...prev, { id, type, text }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  };

  return { toasts, toast, removeToast: (id: string) => setToasts(prev => prev.filter(t => t.id !== id)) };
}

const icons = { success: CheckCircle, error: XCircle, info: AlertCircle };
const colors = {
  success: { bg: '#F0FDF4', border: '#BBF7D0', icon: '#22C55E', text: '#166534' },
  error:   { bg: '#FEF2F2', border: '#FECACA', icon: '#EF4444', text: '#991B1B' },
  info:    { bg: '#FFF8F8', border: '#F0DDE0', icon: '#D79AA8', text: '#5A4047' },
};

export default function Toast({ toasts, onRemove }: ToastProps) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-80" dir="rtl">
      {toasts.map(t => {
        const Icon = icons[t.type];
        const c = colors[t.type];
        return (
          <div key={t.id} className="flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-bold animate-in fade-in slide-in-from-top-2"
            style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.text }}>
            <Icon className="w-4 h-4 shrink-0" style={{ color: c.icon }} />
            <span className="flex-1">{t.text}</span>
            <button onClick={() => onRemove(t.id)} className="shrink-0 opacity-50 hover:opacity-100">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
