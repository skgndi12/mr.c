import { $nodesOfType, TextNode, type EditorState } from 'lexical';

export function getReviewContent(editorState: EditorState) {
  try {
    const description = editorState.read(() => {
      const textNodes = $nodesOfType(TextNode);
      return textNodes.map((node) => node.getTextContent()).join(' ');
    });

    return {
      description,
      serializedEditorState: editorState.toJSON(), // toJSON() return valid editorState object
    };
  } catch (error) {
    throw new Error('Lexical Error: not a valid editorState');
  }
}
