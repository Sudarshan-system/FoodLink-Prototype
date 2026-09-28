import React from 'react';
import { AlertTriangle, AlertCircle, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = false,
  onConfirm,
  onCancel,
  isLoading = false
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-harbor-950/75 backdrop-blur-sm animate-fade-in"
      onClick={onCancel}
    >
      <div 
        className="w-full max-w-md bg-white dark:bg-harbor-800 rounded-3xl border border-harbor-200 dark:border-harbor-700 shadow-2xl p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start space-x-3">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
            isDestructive 
              ? 'bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400' 
              : 'bg-teal-100 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400'
          }`}>
            {isDestructive ? <AlertTriangle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-harbor-900 dark:text-white">
              {title}
            </h3>
            <p className="text-xs text-harbor-600 dark:text-slate-300 mt-1 leading-relaxed">
              {message}
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="text-harbor-400 hover:text-harbor-600 dark:hover:text-slate-300 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="min-h-[44px] px-4 py-2 rounded-xl border border-harbor-200 dark:border-harbor-700 text-xs font-semibold text-harbor-700 dark:text-slate-300 hover:bg-harbor-100 dark:hover:bg-harbor-700 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`min-h-[44px] px-5 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-sm ${
              isDestructive
                ? 'bg-red-600 hover:bg-red-700 active:bg-red-800'
                : 'bg-teal-600 hover:bg-teal-700 active:bg-teal-800'
            }`}
          >
            {isLoading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
