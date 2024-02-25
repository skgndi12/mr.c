'use client';

import clsx from 'clsx';
import { ReactNode } from 'react';

// TODO: make it generic
export default function ChipButton({
  onClick,
  Text,
  Icon,
  rounded,
  type = 'button',
  width,
}: {
  Text: ReactNode;
  Icon?: ReactNode;
  onClick?: () => void;
  rounded: 'full' | 'lg';
  type?: 'button' | 'submit';
  width: 'fit' | 'full';
}) {
  const roundClass = clsx({ 'rounded-lg': rounded === 'lg', 'rounded-full': rounded === 'full' });
  const widthClass = clsx({ 'w-full': width === 'full', 'w-fit': width === 'fit' });

  return (
    <button
      className={clsx(
        'flex items-center space-x-1 px-2 py-1 hover:bg-gray-100',
        roundClass,
        widthClass
      )}
      onClick={onClick}
      type={type}
    >
      {Icon}
      {Text}
    </button>
  );
}
