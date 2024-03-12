import { createHeadlessEditor as _createHeadlessEditor } from '@lexical/headless';

import nodes from '@/editor/nodes';
import theme from '@/editor/theme';

const createHeadlessEditor = ({ namespace }: { namespace: string }) => {
  return _createHeadlessEditor({
    namespace,
    nodes: [...nodes],
    theme,
    onError: (error) => {
      throw error;
    },
  });
};

export default createHeadlessEditor;
