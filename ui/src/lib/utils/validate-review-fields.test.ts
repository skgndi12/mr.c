import {
  $getRoot,
  $createParagraphNode,
  $createTextNode,
  type LexicalEditor,
  type EditorState,
} from 'lexical';

import { createHeadlessEditor } from '@lexical/headless';

import { validateReviewFields } from '@/lib/utils/validate-review-fields';

describe('validateReviewFields', () => {
  let editor: LexicalEditor;
  let rawData: {
    title: string;
    movieName: string;
    editorState: EditorState;
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

  test('should return proper CreateReviewReqeust on success ', async () => {
    await update(() => {
      $getRoot().append($createParagraphNode().append($createTextNode('hi')));
    });

    rawData = {
      title: 'foo',
      movieName: 'bar',
      editorState: editor.getEditorState(),
    };

    expect(validateReviewFields(rawData)).toEqual({
      success: true,
      data: {
        title: 'foo',
        movieName: 'bar',
        content:
          '{"description":"hi","serializedEditorState":{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"hi","type":"text","version":1}],"direction":null,"format":"","indent":0,"type":"paragraph","version":1}],"direction":null,"format":"","indent":0,"type":"root","version":1}}}',
      },
    });
  });

  describe('on fail', () => {
    test('should return error message for empty title', async () => {
      await update(() => {
        $getRoot().append($createParagraphNode().append($createTextNode('hi')));
      });

      rawData = {
        title: '',
        movieName: 'bar',
        editorState: editor.getEditorState(),
      };

      expect(validateReviewFields(rawData)).toEqual({
        success: false,
        errors: {
          title: '제목을 입력해주세요.',
        },
      });
    });

    test('should return error message for empty movieTitme', async () => {
      await update(() => {
        $getRoot().append($createParagraphNode().append($createTextNode('hi')));
      });

      rawData = {
        title: 'foo',
        movieName: '',
        editorState: editor.getEditorState(),
      };

      expect(validateReviewFields(rawData)).toEqual({
        success: false,
        errors: {
          movieName: '영화 제목을 입력해주세요.',
        },
      });
    });

    test('should return error message for empty content', () => {
      rawData = {
        title: 'foo',
        movieName: 'bar',
        editorState: editor.getEditorState(),
      };

      expect(validateReviewFields(rawData)).toEqual({
        success: false,
        errors: {
          content: '내용을 입력해주세요.',
        },
      });
    });

    test('should return error message for invalid EditorState', () => {
      rawData = {
        title: 'foo',
        movieName: 'bar',
        editorState: { root: null } as unknown as EditorState,
      };

      expect(validateReviewFields(rawData)).toEqual({
        success: false,
        errors: {
          content: '내용을 저장하는 중 오류가 발생했습니다.',
        },
      });
    });

    test('should return error messages for several fields', async () => {
      rawData = {
        title: 'foo',
        movieName: '',
        editorState: { root: null } as unknown as EditorState,
      };

      expect(validateReviewFields(rawData)).toEqual({
        success: false,
        errors: {
          movieName: '영화 제목을 입력해주세요.',
          content: '내용을 저장하는 중 오류가 발생했습니다.',
        },
      });

      await update(() => {
        $getRoot().append($createParagraphNode().append($createTextNode('hi')));
      });

      rawData = {
        title: '',
        movieName: '',
        editorState: editor.getEditorState(),
      };

      expect(validateReviewFields(rawData)).toEqual({
        success: false,
        errors: {
          title: '제목을 입력해주세요.',
          movieName: '영화 제목을 입력해주세요.',
        },
      });
    });
  });
});
