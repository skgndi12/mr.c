import type { SerializedEditorState } from 'lexical';

// The review_content JSON should be validated before being stored in DB.
// So we assume it is valid.
export function parseReviewContent(serializedContent: string) {
  const content = JSON.parse(serializedContent) as {
    description: string;
    serializedEditorState: SerializedEditorState;
  };

  return content;
}
