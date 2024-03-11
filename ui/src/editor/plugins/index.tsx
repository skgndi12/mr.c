import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';

import { useEditorRef } from '@/context/editor/editor-ref-context';
import { EditorRefPlugin } from '@/editor/plugins/editor-ref';
import { MarkdownShortcutPlugin } from '@/editor/plugins/markdown-shorcut';

function Placeholder() {
  return <div className="placeholder">Begin writing your review...</div>;
}

export function Plugins() {
  const { onRef } = useEditorRef() ?? {};

  return (
    <>
      <RichTextPlugin
        contentEditable={
          <div className="content-editable-wrapper">
            <div className="content-editable">
              <ContentEditable data-testid="content-editable" />
            </div>
          </div>
        }
        placeholder={<Placeholder />}
        ErrorBoundary={LexicalErrorBoundary}
      />
      <MarkdownShortcutPlugin />
      {onRef !== undefined && <EditorRefPlugin editorRef={onRef} />}
    </>
  );
}
