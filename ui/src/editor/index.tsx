'use client';

import { LexicalComposer, type InitialConfigType } from '@lexical/react/LexicalComposer';
import { Plugins } from '@/editor/plugins';
import nodes from '@/editor/nodes';
import theme from '@/editor/theme';
import '@/styles/editor.css';

// This has to be rendered on client side only (no ssr!)
export default function Editor() {
  const initialConfig: InitialConfigType = {
    nodes: [...nodes],
    namespace: 'review-editor',
    onError: (error: Error) => {
      throw error;
    },
    theme: theme,
  };

  return (
    <div className="editor">
      <LexicalComposer initialConfig={initialConfig}>
        <Plugins />
      </LexicalComposer>
    </div>
  );
}
