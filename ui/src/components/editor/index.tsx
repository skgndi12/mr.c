'use client';

import { LexicalComposer, type InitialConfigType } from '@lexical/react/LexicalComposer';
import { Plugins } from '@/components/editor/plugins';
import nodes from '@/components/editor/nodes';
import theme from '@/components/editor/theme';
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
