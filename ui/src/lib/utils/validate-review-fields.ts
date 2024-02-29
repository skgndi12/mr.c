import type { EditorState, SerializedEditorState } from 'lexical';
import { $isRootTextContentEmptyCurry } from '@lexical/text';

import { getReviewContent } from '@/lib/utils/get-review-content';
import type { CreateReviewRequest } from '@/lib/definitions/review';

interface RawReviewField {
  title: string;
  movieName: string;
  editorState: EditorState;
}

interface OnSuccess {
  success: true;
  data: CreateReviewRequest;
}

interface OnFail {
  success: false;
  errors: Partial<CreateReviewRequest>;
}

export function validateReviewFields(rawData: RawReviewField): OnSuccess | OnFail {
  const errors = new Map<string, string>();

  const { title, movieName, editorState } = rawData;

  if (title.length < 1) {
    errors.set('title', 'title is empty');
  }

  // TODO: validate max length after dicussion
  // if (title.length > 20) {
  //   errors.set('title', 'title is too long. it should be less than 20');
  // }

  if (movieName.length < 1) {
    errors.set('movieName', 'movieName is empty');
  }

  let reviewContent: {
    description: string;
    serializedEditorState: SerializedEditorState;
  };
  let serializedContent: string;

  try {
    if (editorState.read($isRootTextContentEmptyCurry(false))) {
      errors.set('content', 'content is empty');
    }

    reviewContent = getReviewContent(editorState);
    serializedContent = JSON.stringify(reviewContent);
  } catch (error) {
    errors.set('content', 'content has something wrong');
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
