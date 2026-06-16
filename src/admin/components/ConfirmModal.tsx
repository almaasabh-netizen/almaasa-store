import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  open, title, message, confirmText = 'تأكيد', cancelText = 'إلغاء', danger = true, onConfirm, onCancel
}: ConfirmModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir="rtl">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative rounded-2xl p-6 w-full max-w-sm shadow-2xl" style={{ background: '#FFFFFF', border: '1px solid #F0DDE0' }}>
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: danger ? '#FEF2F2' : '#F3E6E8' }}>
            <AlertTriangle className="w-5 h-5" style={{ color: danger ? '#EF4444' : '#D79AA8' }} />
          </div>
          <div className="flex-1">
            <h3 className="font-black text-sm mb-1" style={{ color: '#5A4047' }}>{title}</h3>
            <p className="text-xs leading-relaxed" style={{ color: '#9A7A82' }}>{message}</p>
          </div>
          <button onClick={onCancel} className="p-1 rounded-lg hover:bg-[#F3E6E8]">
            <X className="w-4 h-4" style={{ color: '#D79AA8' }} />
          </button>
        </div>
        <div className="flex gap-2 mt-5 justify-end">
          <button onClick={onCancel}
            className="px-4 py-2 rounded-xl text-xs font-bold"
            style={{ background: '#F3E6E8', color: '#C77D8A' }}>
            {cancelText}
          </button>
          <button onClick={() => { onConfirm(); onCancel(); }}
            className="px-4 py-2 rounded-xl text-xs font-bold"
            style={{ background: danger ? '#EF4444' : '#D79AA8', color: 'white' }}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
