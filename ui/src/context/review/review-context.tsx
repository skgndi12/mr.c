'use client';

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
