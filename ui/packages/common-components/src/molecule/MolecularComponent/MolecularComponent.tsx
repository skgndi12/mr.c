import { useMemo } from 'react';
import { AtomicComponent } from '../../atom/AtomicComponent';
import type { AtomicComponentProps } from '../../atom/AtomicComponent';
import { hello } from '@mrc/common-utils';
export interface MolecularComponentProps extends AtomicComponentProps {
  description: string;
}

const MolecularComponent = ({ color = 'primary', description }: MolecularComponentProps) => {
  const colorClass = useMemo(() => {
    switch (color) {
      case 'primary':
        return 'text-blue-300';
      case 'secondary':
        return 'text-blue-600';
    }
  }, [color]);

  const helloString = hello('Common Components');

  return (
    <div>
      <p className={colorClass}>{description}</p>
      <AtomicComponent color={color} />
      <p>{helloString}</p>
    </div>
  );
};

export default MolecularComponent;
