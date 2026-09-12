import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Ya, Lanjutkan',
  cancelText = 'Batal',
  isDanger = true,
  onConfirm,
  onCancel
}) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className={`relative w-full max-w-md rounded-2xl p-6 shadow-2xl border transition-all ${
        isLight 
          ? 'bg-white border-slate-200 text-slate-900' 
          : 'bg-[#0f172a] border-slate-700 text-white'
      }`}>
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start space-x-3.5">
          <div className={`p-2.5 rounded-xl shrink-0 ${
            isDanger 
              ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' 
              : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
          }`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold leading-6">{title}</h3>
            <p className={`mt-2 text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
              {message}
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end space-x-2.5 pt-4 border-t border-slate-700/50">
          <button
            type="button"
            onClick={onCancel}
            className={`px-4 py-2 text-xs font-bold rounded-xl border transition ${
              isLight 
                ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700' 
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
            }`}
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onCancel();
            }}
            className={`px-4 py-2 text-xs font-bold rounded-xl text-white shadow-lg transition active:scale-95 ${
              isDanger 
                ? 'bg-rose-600 hover:bg-rose-500' 
                : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
