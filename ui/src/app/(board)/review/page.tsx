import { Suspense } from 'react';

import { ReviewBoardHeader } from '@/components/review-board-header';
import { ReviewCardsList } from '@/components/review-cards-list';
import { ReviewCardsListSkeleton } from '@/components/skeletons';

import type { ListReviewsQuery } from '@/lib/definitions/review';

export default function Page({
  searchParams,
}: {
  searchParams?: Omit<ListReviewsQuery, 'pageOffset' | 'pageSize'> & {
    page?: string;
  };
}) {
  const query: ListReviewsQuery = {
    movieName: searchParams?.movieName,
    nickname: searchParams?.nickname,
    title: searchParams?.title,
    pageOffset: Number(searchParams?.page),
  };

  return (
    <main className="container mx-auto flex max-w-5xl flex-col items-center">
      <ReviewBoardHeader />

      <section className="w-full py-4">
        <Suspense key={JSON.stringify(query)} fallback={<ReviewCardsListSkeleton />}>
          <ReviewCardsList query={query} />
        </Suspense>
      </section>
    </main>
  );
}
