import type { EditorState, SerializedEditorState } from 'lexical';
import { $isRootTextContentEmptyCurry } from '@lexical/text';

import { getReviewContent } from '@/lib/utils/review/get-review-content';

interface RawReviewField {
  title: string;
  movieName: string;
  editorState: EditorState;
}

interface OnSuccess {
  success: true;
  data: {
    title: string;
    movieName: string;
    content: string;
  };
}

interface OnFail {
  success: false;
  errors: Partial<{
    title: string;
    movieName: string;
    content: string;
  }>;
}

export function validateReviewFields(rawData: RawReviewField): OnSuccess | OnFail {
  const errors = new Map<string, string>();

  const { title, movieName, editorState } = rawData;

  if (title.length < 1) {
    errors.set('title', '제목을 입력해주세요.');
  }

  if (movieName.length < 1) {
    errors.set('movieName', '영화 제목을 입력해주세요.');
  }

  let reviewContent: {
    description: string;
    serializedEditorState: SerializedEditorState;
  };
  let serializedContent: string;

  try {
    if (editorState.read($isRootTextContentEmptyCurry(false))) {
      errors.set('content', '내용을 입력해주세요.');
    }

    reviewContent = getReviewContent(editorState);
    serializedContent = JSON.stringify(reviewContent);
  } catch (error) {
    errors.set('content', `내용을 저장하는 중 오류가 발생했습니다.`);
  }

  if (errors.size > 0) {
    return {
      success: false,
      errors: Object.fromEntries(errors),
    };
  }

  return {
    success: true,
    data: {
      title,
      movieName,
      content: serializedContent!,
    },
  };
}
