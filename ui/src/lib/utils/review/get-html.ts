import type { SerializedEditorState } from 'lexical';
import { $generateHtmlFromNodes } from '@lexical/html';
import { JSDOM } from 'jsdom';

import createHeadlessEditor from '@/editor/headless';

function setupDom() {
  const dom = new JSDOM();

  const _window = global.window;
  const _document = global.document;

  // @ts-expect-error - this is inevitable due to lib.dom.d.ts
  // https://github.com/DefinitelyTyped/DefinitelyTyped/issues/51276
  // https://github.com/capricorn86/happy-dom/issues/1227
  global.window = dom.window;
  global.document = dom.window.document;

  return () => {
    global.window = _window;
    global.document = _document;
  };
}

export async function getHtml(serializedEditorState: SerializedEditorState) {
  const html: string = await new Promise((resolve) => {
    const editor = createHeadlessEditor({ namespace: 'html-generator' });

    editor.setEditorState(editor.parseEditorState(serializedEditorState));

    editor.update(() => {
      const cleanup = setupDom();
      const _html = $generateHtmlFromNodes(editor, null);
      cleanup();

      resolve(_html);
    });
  });

  return html;
}
