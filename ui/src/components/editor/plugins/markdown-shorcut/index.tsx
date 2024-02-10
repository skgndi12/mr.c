import { MarkdownShortcutPlugin as LexicalMarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { TRANSFORMERS, CODE, INLINE_CODE, type Transformer } from '@lexical/markdown';

const NO_USE = new Set<Transformer>([CODE, INLINE_CODE]);
const TRANSFORMERS_IN_USE = TRANSFORMERS.filter((transformer) => !NO_USE.has(transformer));

export function MarkdownShortcutPlugin() {
  return <LexicalMarkdownShortcutPlugin transformers={TRANSFORMERS_IN_USE} />;
}

/*
TRANSFORMERS from @lexical/markdown

const TRANSFORMERS: Array<Transformer> = [
  ...ELEMENT_TRANSFORMERS,
  ...TEXT_FORMAT_TRANSFORMERS,
  ...TEXT_MATCH_TRANSFORMERS,
];

const ELEMENT_TRANSFORMERS: Array<ElementTransformer> = [
  HEADING,
  QUOTE,
  CODE,
  UNORDERED_LIST,
  ORDERED_LIST,
];

const TEXT_FORMAT_TRANSFORMERS: Array<TextFormatTransformer> = [
  INLINE_CODE,
  BOLD_ITALIC_STAR,
  BOLD_ITALIC_UNDERSCORE,
  BOLD_STAR,
  BOLD_UNDERSCORE,
  HIGHLIGHT,
  ITALIC_STAR,
  ITALIC_UNDERSCORE,
  STRIKETHROUGH,
];

const TEXT_MATCH_TRANSFORMERS: Array<TextMatchTransformer> = [LINK];
*/
