import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  type SerializedEditorState,
  type LexicalEditor,
  type EditorState,
} from 'lexical';

import { createHeadlessEditor } from '@lexical/headless';

import { getReviewContent } from '@/lib/utils/review/get-review-content';

describe('getReviewContent', () => {
  let editor: LexicalEditor;

  let content: {
    description: string;
    serializedEditorState: SerializedEditorState;
  };

  async function update(updateFn: () => void) {
    editor.update(updateFn);
    await Promise.resolve();
  }

  beforeEach(() => {
    editor = createHeadlessEditor({
      onError: (error) => {
        throw error;
      },
    });
  });

  test('should return all texts joined with space as seperator on description field', async () => {
    await update(() => {
      const root = $getRoot();

      root.append($createParagraphNode());
      root.append($createParagraphNode().append($createTextNode('First Line')));
      root.append($createParagraphNode());
      root.append($createParagraphNode());
      root.append($createParagraphNode());
      root.append($createParagraphNode());
      root.append($createParagraphNode());
      root.append($createParagraphNode().append($createTextNode('Second Line')));
      root.append($createParagraphNode());
      root.append($createParagraphNode());
    });

    const editorState = editor.getEditorState();

    content = getReviewContent(editorState);

    expect(content.description).toBe('First Line Second Line');
  });

  test('should return content properly', async () => {
    await update(() => {
      const root = $getRoot();

      root.append($createParagraphNode().append($createTextNode('First Line')));
      root.append($createParagraphNode().append($createTextNode('Second Line')));
    });

    const editorState = editor.getEditorState();

    content = getReviewContent(editorState);

    expect(content).toEqual({
      description: 'First Line Second Line',
      serializedEditorState: {
        root: {
          children: [
            {
              children: [
                {
                  detail: 0,
                  format: 0,
                  mode: 'normal',
                  style: '',
                  text: 'First Line',
                  type: 'text',
                  version: 1,
                },
              ],
              direction: null,
              format: '',
              indent: 0,
              type: 'paragraph',
              version: 1,
            },
            {
              children: [
                {
                  detail: 0,
                  format: 0,
                  mode: 'normal',
                  style: '',
                  text: 'Second Line',
                  type: 'text',
                  version: 1,
                },
              ],
              direction: null,
              format: '',
              indent: 0,
              type: 'paragraph',
              version: 1,
            },
          ],
          direction: null,
          format: '',
          indent: 0,
          type: 'root',
          version: 1,
        },
      },
    });
  });

  test('should throw an Error with invalid EditorState', () => {
    expect(() => getReviewContent({ root: null } as unknown as EditorState)).toThrow(
      'Lexical Error'
    );
  });
});
