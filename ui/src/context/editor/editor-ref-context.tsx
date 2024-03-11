'use client';

import { type LexicalEditor } from 'lexical';
import {
  ReactNode,
  RefCallback,
  RefObject,
  createContext,
  useCallback,
  useContext,
  useState,
} from 'react';

interface ContextShape {
  editorRef: RefObject<LexicalEditor>;
  onRef: RefCallback<LexicalEditor>;
}

const EditorRefContext = createContext<ContextShape | null>(null);

export function EditorRefProvider({ children }: { children: ReactNode }) {
  const [editorRef, setEditorRef] = useState<{ current: LexicalEditor | null }>({ current: null });
  const onRef = useCallback((editor: LexicalEditor) => setEditorRef({ current: editor }), []);

  return (
    <EditorRefContext.Provider value={{ editorRef, onRef }}>{children}</EditorRefContext.Provider>
  );
}

export function useEditorRef() {
  return useContext(EditorRefContext);
}
