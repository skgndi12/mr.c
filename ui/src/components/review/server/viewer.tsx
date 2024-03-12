'use server';

import dynamic from 'next/dynamic';

import { getHtml } from '@/lib/utils/review/get-html';
import { parseReviewContent } from '@/lib/utils/review/parse-review-content';

export async function Viewer({ content }: { content: string }) {
  const { serializedEditorState } = parseReviewContent(content);
  const html = await getHtml(serializedEditorState);

  const Editor = dynamic(() => import('@/editor'), {
    ssr: false,
    loading: () => <div className="editor" dangerouslySetInnerHTML={{ __html: html }} />,
  });

  return <Editor namespace="review-editor" isNew={false} prepopulated={serializedEditorState} />;
}
