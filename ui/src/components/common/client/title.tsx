'use client';

import clsx from 'clsx';
import {
  useRef,
  useLayoutEffect,
  useImperativeHandle,
  forwardRef,
  type ChangeEventHandler,
} from 'react';

import '@/styles/editor-theme.css';

interface TitleProps {
  subtitle?: boolean;
  placeholder?: string;
  value: string;
  onChange?: ChangeEventHandler<HTMLTextAreaElement>;
  readOnly?: boolean;
}

export interface TitleRef {
  focus: () => void;
}

export default forwardRef<TitleRef, TitleProps>(function Title(
  { subtitle = false, placeholder, value, onChange, readOnly },
  ref
) {
  const titleEl = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    if (!titleEl.current) return;
    titleEl.current.style.height = '0px'; // This is important for shrinking
    titleEl.current.style.height = titleEl.current.scrollHeight + 'px';
  }, [value]);

  useImperativeHandle(ref, () => ({ focus: () => titleEl.current?.focus() }));

  return (
    <textarea
      ref={titleEl}
      className={clsx(
        `w-full resize-none overflow-hidden bg-transparent focus-visible:outline-none`,
        {
          'PlaygroundEditorTheme__h1 h-9': subtitle === false,
          'PlaygroundEditorTheme__h2 h-5': subtitle === true,
        }
      )}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      readOnly={readOnly}
    />
  );
});
