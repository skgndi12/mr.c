// https://github.com/facebook/lexical/issues/5700

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { LexicalEditor } from 'lexical';
import { MutableRefObject } from 'react';
import * as React from 'react';

/**
 *
 * Use this plugin to access the editor instance outside of the
 * LexicalComposer. This can help with things like buttons or other
 * UI components that need to update or read EditorState but need to
 * be positioned outside the LexicalComposer in the React tree.
 */
export function EditorRefPlugin({
  editorRef,
}: {
  editorRef: React.RefCallback<LexicalEditor> | MutableRefObject<LexicalEditor | null | undefined>;
}): null {
  const [editor] = useLexicalComposerContext();

  // https://github.com/facebook/react/issues/18178#issuecomment-596880684
  React.useEffect(() => {
    if (typeof editorRef === 'function') {
      editorRef(editor);
    } else if (typeof editorRef === 'object') {
      editorRef.current = editor;
    }

    // prevent unnecessary updates
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  return null;
}
