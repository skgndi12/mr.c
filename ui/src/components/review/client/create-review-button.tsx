'use client';

import clsx from 'clsx';
import { useRouter } from 'next/navigation';

import Text from '@/components/common/server/text';

import { useToast } from '@/context/common/toast-context';
import { useReview } from '@/context/review/review-context';

import { useApiError } from '@/hooks/common/use-api-error';
import { createReview } from '@/lib/apis/review/client';

export function CreateReviewButton() {
  const router = useRouter();
  const { emitToast } = useToast();
  const { disabled, setDisabled, validateAndGetData } = useReview();
  const { handleApiError } = useApiError();

  const handleCreateReview = async () => {
    setDisabled(true);

    const data = validateAndGetData();

    if (!data) {
      return;
    }

    try {
      const { review } = await createReview(data);

      emitToast('리뷰 등록 완료', 'success');
      router.push(`/review/${review.id}`);
    } catch (error) {
      handleApiError(error);
    } finally {
      setDisabled(false);
    }
  };

  const handleClick = () => {
    void handleCreateReview();
  };

  return (
    <button
      role="button"
      className={clsx('rounded-full border bg-white px-2 py-1', {
        'pointer-events-none': disabled,
      })}
      onClick={handleClick}
      aria-disabled={disabled}
    >
      <Text>등록하기</Text>
    </button>
  );
}
