import clsx from 'clsx';

import Text from '@/components/common/server/text';

// https://delba.dev/blog/animated-loading-skeletons-with-tailwind
const shimmer = clsx(
  'relative before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-gray-100/60 before:to-transparent'
);

const skeletonClass = clsx(
  shimmer,
  'isolate overflow-hidden rounded-md bg-gray-200 shadow-xl shadow-black/5 before:border-t before:border-gray-100/60'
);

function UserchipSkeleton() {
  return <div className={clsx('h-5 w-56 shrink-0 pb-1', skeletonClass)}></div>;
}

function ReviewCardSkeleton() {
  return (
    <div className="flex flex-col border-t p-6 [&:first-child]:border-none">
      <div className={clsx('mb-1 h-6 w-56', skeletonClass)}></div>
      <div className={clsx('mb-1 h-5 w-52', skeletonClass)}></div>

      <div className="mt-4">
        <div className={clsx('mb-1 h-5 w-full', skeletonClass)}></div>
        <div className={clsx('mb-1 h-5 w-full', skeletonClass)}></div>
        <div className={clsx('mb-1 h-5 w-full', skeletonClass)}></div>
      </div>

      <div className={clsx('mt-3 h-5 w-14', skeletonClass)}></div>

      <div className="mt-4 flex flex-wrap items-center gap-1">
        <UserchipSkeleton />
        <Text weight="bold">&#183;</Text>
        <div className={clsx('h-5 w-14 shrink-0 pb-1', skeletonClass)}></div>
      </div>
    </div>
  );
}

function PaginationSkeleton() {
  return <div className="h-10"></div>;
}

export function ReviewCardsListSkeleton() {
  // TODO: pagination skeleton do paginate with caching totalPagesCount by query ?

  return (
    <div className={clsx('flex w-full flex-col items-center space-y-6')}>
      <div className="w-full">
        <ReviewCardSkeleton />
        <ReviewCardSkeleton />
        <ReviewCardSkeleton />
        <ReviewCardSkeleton />
        <ReviewCardSkeleton />
        <ReviewCardSkeleton />
        <ReviewCardSkeleton />
        <ReviewCardSkeleton />
        <ReviewCardSkeleton />
      </div>

      <PaginationSkeleton />
    </div>
  );
}
