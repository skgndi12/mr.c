'use client';

import { useEffect, useRef } from 'react';
import { CheckCircleIcon, ExclamationCircleIcon, XMarkIcon } from '@heroicons/react/24/solid';

import Text from '@/components/common/server/text';
import { PausibleTimer } from '@/lib/utils/common/pausible-timer';

export interface ToastData {
  id: number;
  message: string;
  type: 'success' | 'error';
}

// life span of a toast (ms)
const LIFE_SPAN = 3000;

interface ToastProps {
  toastData: ToastData;
  onDelete: (toastId: number) => void;
  isPaused: boolean;
}

// TODO: more delicate animation with framer-motion
export function Toast({ toastData, onDelete, isPaused }: ToastProps) {
  const timer = useRef<PausibleTimer | null>(null);

  useEffect(() => {
    timer.current = new PausibleTimer(() => {
      onDelete(toastData.id);
    }, LIFE_SPAN);

    return () => {
      timer.current?.clear();
      timer.current = null;
    };
  }, [toastData, onDelete]);

  useEffect(() => {
    if (isPaused) {
      timer.current?.pause();
    } else {
      timer.current?.resume();
    }
  }, [isPaused]);

  return (
    <div className="flex w-80 animate-slide-up items-center justify-between space-x-3 rounded-md border border-gray-200 bg-white p-3 shadow-md sm:w-96">
      {toastData.type === 'success' ? (
        <CheckCircleIcon className="w-6 text-green-500" />
      ) : (
        <ExclamationCircleIcon className="w-6 text-red-500" />
      )}

      <div className="flex-1">
        <Text size="sm">{toastData.message}</Text>
      </div>

      <button color="gray" onClick={() => onDelete(toastData.id)}>
        <XMarkIcon className="w-4" />
      </button>
    </div>
  );
}
