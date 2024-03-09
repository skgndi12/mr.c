import { ReactNode } from 'react';

export function BoardHeader({ children }: { children: ReactNode }) {
  return (
    <section className="sticky top-0 z-10 flex w-full items-center justify-between border-b bg-white px-6 py-4">
      {children}
    </section>
  );
}
