import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';

function Placeholder() {
  return <div className="placeholder">Begin writing your review...</div>;
}

export function Plugins() {
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
    </>
  );
}
