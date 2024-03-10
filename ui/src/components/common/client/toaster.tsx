'use client';

import { useState } from 'react';

import { Toast, type ToastData } from '@/components/common/client/toast';
import Portal from '@/components/common/client/portal';

// Visible toasts amount
const VISIBLE_TOASTS_AMOUNT = 5;

interface ToasterProps {
  toastDataList: ToastData[];
  onDelete: (toastId: number) => void;
}

export default function Toaster({ toastDataList, onDelete }: ToasterProps) {
  const [isPaused, setIsPaused] = useState(false);

  return (
    toastDataList.length > 0 && (
      <Portal>
        <div
          className="fixed bottom-6 right-1/2 z-50 translate-x-1/2 space-y-2 sm:right-6 sm:translate-x-0"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          {toastDataList.slice(-VISIBLE_TOASTS_AMOUNT).map((toast) => (
            <Toast key={toast.id} toastData={toast} onDelete={onDelete} isPaused={isPaused} />
          ))}
        </div>
      </Portal>
    )
  );
}
