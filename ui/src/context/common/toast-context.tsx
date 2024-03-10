'use client';

import { createContext, useCallback, useContext, useState, useRef, type ReactNode } from 'react';

import type { ToastData } from '@/components/common/client/toast';
import Toaster from '@/components/common/client/toaster';

interface ToastContext {
  emitToast: (message: string, type: ToastData['type']) => void;
}

const ToastContext = createContext<ToastContext | null>(null);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const nextId = useRef(0);
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const emitToast = useCallback(
    (message: string, type: ToastData['type']) => {
      const toast = {
        id: nextId.current++,
        message,
        type,
      };

      setToasts((prev) => [...prev, toast]);
    },
    [nextId]
  );

  const deleteToast = useCallback((toastId: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== toastId));
  }, []);

  return (
    <ToastContext.Provider value={{ emitToast }}>
      {children}
      <Toaster toastDataList={toasts} onDelete={deleteToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');

  return context;
};
