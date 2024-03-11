'use client';

import clsx from 'clsx';
import { useRouter } from 'next/navigation';

import Text from '@/components/common/server/text';

import { useToast } from '@/context/common/toast-context';
import { useReview } from '@/context/review/review-context';
import { useEditorRef } from '@/context/editor/editor-ref-context';

import { createReview } from '@/lib/apis/review/client';
import { validateReviewFields } from '@/lib/utils/review/validate-review-fields';
import { isErrorWithMessage } from '@/lib/utils/common/error';

export function CreateReviewButton() {
  const router = useRouter();
  const { emitToast } = useToast();

  const { title, movieName, movieNameRef, titleRef, disabled, setDisabled } = useReview();
  const { editorRef } = useEditorRef() ?? {};

  const handleClick = () => {
    setDisabled(true);

    const editorState = editorRef?.current?.getEditorState();

    if (editorState) {
      const validatedFields = validateReviewFields({ title, movieName, editorState });

      if (!validatedFields.success) {
        // Order to check should be aligned with the order of elements in the DOM
        // title -> movieName -> editor
        if (validatedFields.errors.title) {
          titleRef.current?.focus();
          emitToast(validatedFields.errors.title, 'error');
        } else if (validatedFields.errors.movieName) {
          movieNameRef.current?.focus();
          emitToast(validatedFields.errors.movieName, 'error');
        } else {
          editorRef?.current?.focus();
          emitToast(validatedFields.errors.content!, 'error');
        }

        setDisabled(false);
        return;
      }

      void createReview(validatedFields.data)
        .then(({ review }) => {
          emitToast('리뷰 등록 완료', 'success');
          router.push(`/review/${review.id}`);
        })
        .catch((error) => {
          if (isErrorWithMessage(error)) {
            emitToast(error.message, 'error');
          } else {
            // TODO: throw new Error and move to global error handler
            console.error(error);
            emitToast('알 수 없는 에러가 발생했습니다. 다시 시도해주세요.', 'error');
          }
        })
        .finally(() => setDisabled(false));
    }
  };

  const className = clsx(' rounded-full border bg-white px-2 py-1', {
    'pointer-events-none': disabled,
  });

  return (
    <button className={className} onClick={handleClick} aria-disabled={disabled}>
      <Text>등록하기</Text>
    </button>
  );
}
