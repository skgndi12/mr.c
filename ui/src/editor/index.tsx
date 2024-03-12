'use client';

import { LexicalComposer, type InitialConfigType } from '@lexical/react/LexicalComposer';

import { Plugins } from '@/editor/plugins';
import nodes from '@/editor/nodes';
import theme from '@/editor/theme';
import '@/styles/editor.css';

// This has to be rendered on client side only (no ssr!)
export default function Editor({ namespace, isNew }: { namespace: string; isNew: boolean }) {
  const initialConfig: InitialConfigType = {
    nodes: [...nodes],
    namespace,
    onError: (error: Error) => {
      throw error;
    },
    theme,
    editable: isNew,
  };

  return (
    <div className="editor">
      <LexicalComposer initialConfig={initialConfig}>
        <Plugins />
      </LexicalComposer>
    </div>
  );
}
