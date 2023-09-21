import { useMemo } from 'react';
export interface AtomicComponentProps {
  color: 'primary' | 'secondary';
}

const AtomicComponent = ({ color = 'primary' }: AtomicComponentProps) => {
  const colorClass = useMemo(() => {
    switch (color) {
      case 'primary':
        return 'text-blue-300';
      case 'secondary':
        return 'text-blue-600';
    }
  }, [color]);

  return (
    <div>
      <p className={colorClass}>Test~</p>
    </div>
  );
};

export default AtomicComponent;
