import dynamic from 'next/dynamic';
import Link from 'next/link';

import { UserSelfChip } from '@/components/auth/client/user-self-chip';
import Text from '@/components/common/server/text';
import { BoardHeader } from '@/components/common/server/board-header';
import Time from '@/components/common/server/time';
import { CreateReviewButton } from '@/components/review/client/create-review-button';
import ReviewTitle from '@/components/review/client/review-title';

import { EditorRefProvider } from '@/context/editor/editor-ref-context';
import { ReviewProvider } from '@/context/review/review-context';

const Editor = dynamic(() => import('@/editor'), {
  ssr: false,
  loading: () => <div className="mx-auto my-5 h-[9.4rem] w-full"></div>,
});

function EditorHeader() {
  return (
    <BoardHeader>
      <Link href="/review" className="rounded-full border bg-white px-2 py-1">
        <Text>목록으로</Text>
      </Link>
      <CreateReviewButton />
    </BoardHeader>
  );
}

export default function Page() {
  return (
    <EditorRefProvider>
      <ReviewProvider>
        <main className="container mx-auto flex max-w-5xl flex-col items-center">
          <EditorHeader />

          <section className="w-full p-4">
            <div className="my-2 flex items-center gap-1">
              <Text size="sm" weight="bold">
                by
              </Text>
              <UserSelfChip />
            </div>

            <Time dateStr={new Date().toISOString()} />

            <div className="flex w-full flex-col gap-4 pt-4">
              <ReviewTitle placeholder="Title" />
              <ReviewTitle isMovieName placeholder="Movie" />
            </div>

            <Editor namespace="review-editor" isNew />
          </section>
        </main>
      </ReviewProvider>
    </EditorRefProvider>
  );
}
