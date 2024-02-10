import type { Klass, LexicalNode, LexicalNodeReplacement } from 'lexical';

import { LinkNode } from '@lexical/link';
import { ListNode, ListItemNode } from '@lexical/list';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';

const mrcNodes: (Klass<LexicalNode> | LexicalNodeReplacement)[] = [
  HeadingNode,
  QuoteNode,
  ListNode,
  ListItemNode,
  LinkNode,
];

export default mrcNodes;
