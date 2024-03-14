'use client';

import { useToast } from '@/context/common/toast-context';
import { useEditorRef } from '@/context/editor/editor-ref-context';
import { validateReviewFields } from '@/lib/utils/review/validate-review-fields';
import React, {
  Dispatch,
  ReactNode,
  SetStateAction,
  createContext,
  useContext,
  useRef,
  useState,
} from 'react';

interface ContextShape {
  title: string;
  setTitle: Dispatch<SetStateAction<string>>;
  titleRef: React.RefObject<HTMLTextAreaElement>;
  movieName: string;
  setMovieName: Dispatch<SetStateAction<string>>;
  movieNameRef: React.RefObject<HTMLTextAreaElement>;
  disabled: boolean;
  setDisabled: Dispatch<SetStateAction<boolean>>;
  validateAndGetData: () =>
    | {
        title: string;
        movieName: string;
        content: string;
      }
    | undefined;
}

const ReviewContext = createContext<ContextShape | null>(null);

export function ReviewProvider({
  children,
  prepopulated,
}: {
  children: ReactNode;
  prepopulated?: {
    title: string;
    movieName: string;
  };
}) {
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const movieNameRef = useRef<HTMLTextAreaElement>(null);

  const [title, setTitle] = useState(prepopulated?.title ?? '');
  const [movieName, setMovieName] = useState(prepopulated?.movieName ?? '');

  const [disabled, setDisabled] = useState(false);

  const { editorRef } = useEditorRef() ?? {};

  const { emitToast } = useToast();

  const validateAndGetData = () => {
    if (!editorRef?.current) {
      return;
    }

    const editorState = editorRef.current.getEditorState();

    const validatedFields = validateReviewFields({ title, movieName, editorState });

    if (!validatedFields.success) {
      // Order to check should be aligned with the order of elements in the DOM
      // title -> movieName -> editor
      if (validatedFields.errors.title) {
        titleRef.current?.focus();
        emitToast(validatedFields.errors.title, 'error');
      } else if (validatedFields.errors.movieName) {
        movieNameRef.current?.focus();
        emitToast(validatedFields.errors.movieName, 'error');
      } else {
        editorRef?.current?.focus();
        emitToast(validatedFields.errors.content!, 'error');
      }

      setDisabled(false);
      return;
    }

    return validatedFields.data;
  };

  return (
    <ReviewContext.Provider
      value={{
        title,
        setTitle,
        titleRef,
        movieName,
        setMovieName,
        movieNameRef,
        disabled,
        setDisabled,
        validateAndGetData,
      }}
    >
      {children}
    </ReviewContext.Provider>
  );
}

export function useReview() {
  const context = useContext(ReviewContext);
  if (!context) {
    throw new Error('useReview must be used within an ReviewProvider');
  }

  return context;
}
