import clsx from 'clsx';

export interface TextProps {
  children: string;
  size?: 'sm' | 'base' | 'lg' | 'xl' | '5xl';
  weight?: 'light' | 'normal' | 'medium' | 'bold';
  nowrap?: boolean;
  noselect?: boolean;
}

export default function Text({
  children,
  size = 'base',
  weight = 'normal',
  nowrap = false,
  noselect = false,
}: TextProps) {
  const sizeClass = clsx({
    'text-sm': size === 'sm',
    'text-base': size === 'base',
    'text-lg': size === 'lg',
    'text-xl': size === 'xl',
    'text-5xl': size === '5xl',
  });

  const weightClass = clsx({
    'font-light': weight === 'light',
    'font-normal': weight === 'normal',
    'font-medium': weight === 'medium',
    'font-bold': weight === 'bold',
  });

  return (
    <div
      className={clsx(
        'm-0 flex h-fit w-fit items-center justify-center p-0',
        sizeClass,
        weightClass,
        { 'whitespace-nowrap': nowrap },
        { 'select-none': noselect }
      )}
    >
      <p>{children}</p>
    </div>
  );
}
