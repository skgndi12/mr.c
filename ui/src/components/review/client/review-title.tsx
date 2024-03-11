'use client';

import Title from '@/components/common/client/title';
import { useReview } from '@/context/review/review-context';
import { useToast } from '@/context/common/toast-context';
import { useDebouncedCallback } from '@/hooks/common/use-debounced-callback';
import { MAX_TITLE_LENGTH } from '@/lib/constants/review';
import { MAX_MOVIE_NAME_LENGTH } from '@/lib/constants/common';
import { normalizeWhitespace } from '@/lib/utils/common/normalizeWhitespace';

export default function ReviewTitle({
  placeholder,
  isMovieName,
}: {
  placeholder: string;
  isMovieName?: boolean;
}) {
  const { title, movieName, setTitle, setMovieName, titleRef, movieNameRef } = useReview();

  const [value, setValue, ref, maxLength] = isMovieName
    ? [movieName, setMovieName, movieNameRef, MAX_MOVIE_NAME_LENGTH]
    : [title, setTitle, titleRef, MAX_TITLE_LENGTH];

  const { emitToast } = useToast();
  const debouncedEmitToast = useDebouncedCallback(emitToast, 300);

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    let newText = normalizeWhitespace(e.target.value);

    // limit length
    if (newText.length > maxLength) {
      newText = newText.slice(0, maxLength);

      debouncedEmitToast(
        `${isMovieName ? '영화 제목' : '제목'}은 ${maxLength}자 이하로 입력해주세요.`,
        'error'
      );
    }

    setValue(newText);
  };

  return (
    <Title
      placeholder={placeholder}
      subtitle={isMovieName}
      value={value}
      onChange={onChange}
      ref={ref}
    />
  );
}
