import Pagination from '@/components/common/client/pagination';
import { ReviewCard } from '@/components/review/client/review-card';

import { listReviews } from '@/lib/apis/review/server';
import type { ListReviewsQuery } from '@/lib/definitions/review';

export async function ReviewCardsList({ query }: { query: ListReviewsQuery }) {
  const { reviews, pagination } = await listReviews(query);

  return (
    <div className="flex w-full flex-col items-center space-y-6">
      <div className="w-full">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>

      <Pagination totalPages={pagination.totalPageCount} />
    </div>
  );
}
