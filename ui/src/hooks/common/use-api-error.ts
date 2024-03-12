'use client';

import { useToast } from '@/context/common/toast-context';
import { isErrorWithMessage } from '@/lib/utils/common/error';

export function useApiError() {
  const { emitToast } = useToast();

  const handleApiError = (error: unknown) => {
    if (isErrorWithMessage(error)) {
      emitToast(error.message, 'error');
    } else {
      // TODO: throw new Error and move to global error handler
      console.error(error);
      emitToast('알 수 없는 에러가 발생했습니다. 다시 시도해주세요.', 'error');
    }
  };

  return { handleApiError };
}
