'use client';

import { useEffect, useMemo, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface Props {
  children: ReactNode;
}

export default function Portal({ children }: Props) {
  const portalRoot = useMemo(() => {
    const div = document.createElement('div');
    // Add a className to the div if needed
    // div.className = PORTAL_CLASSNAME;
    return div;
  }, []);

  useEffect(() => {
    document.body.append(portalRoot);

    return () => {
      portalRoot.remove();
    };
  }, [portalRoot]);

  return <>{createPortal(children, portalRoot)}</>;
}
