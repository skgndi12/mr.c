'use client';

import { generatePagination } from '@/lib/utils/generate-pagination';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import Link from 'next/link';
import { redirect, usePathname, useSearchParams } from 'next/navigation';

function PaginationArrow({
  type = 'single',
  href,
  direction,
  isDisabled,
}: {
  type?: 'single' | 'double';
  href: string;
  direction: 'left' | 'right';
  isDisabled?: boolean;
}) {
  const className = clsx('flex h-10 w-10 items-center justify-center rounded-full', {
    'pointer-events-none text-gray-300': isDisabled,
    'hover:bg-gray-100': !isDisabled,
    'mr-2 md:mr-4': direction === 'left',
    'ml-2 md:ml-4': direction === 'right',
  });

  const icon =
    direction === 'left' ? (
      type === 'single' ? (
        <ChevronLeftIcon className="w-4" />
      ) : (
        <ChevronDoubleLeftIcon className="w-4" />
      )
    ) : type === 'single' ? (
      <ChevronRightIcon className="w-4" />
    ) : (
      <ChevronDoubleRightIcon className="w-4" />
    );

  return (
    <Link className={className} href={href} aria-disabled={isDisabled}>
      {icon}
    </Link>
  );
}

function PaginationNumber({
  page,
  href,
  isActive,
  position,
}: {
  page: number | string;
  href: string;
  position?: 'first' | 'last' | 'middle';
  isActive: boolean;
}) {
  const className = clsx('flex h-10 w-10 items-center justify-center rounded-full text-sm', {
    'z-10 border-gray-200 bg-gray-200 font-bold': isActive,
    'hover:bg-gray-100': !isActive && position !== 'middle',
    'pointer-events-none text-gray-300': position === 'middle',
  });

  return isActive || position === 'middle' ? (
    <div className={className}>{page}</div>
  ) : (
    <Link href={href} className={className}>
      {page}
    </Link>
  );
}

export default function Pagination({ totalPages }: { totalPages: number }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get('page')) || 1;

  if (currentPage < 1 || currentPage > totalPages) {
    redirect(`${pathname}?page=1`);
    // TODO: handle properly - move this to page.tsx before fetch and redirect to notfound ?
  }

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  const allPages = generatePagination(currentPage, totalPages);

  return (
    <>
      <div className="inline-flex">
        <div className="sm:hidden">
          <PaginationArrow
            type="double"
            direction="left"
            href={createPageURL(1)}
            isDisabled={currentPage <= 1}
          />
        </div>

        <PaginationArrow
          direction="left"
          href={createPageURL(currentPage - 1)}
          isDisabled={currentPage <= 1}
        />

        <div className="hidden space-x-1 sm:flex">
          {allPages.map((page, index) => {
            let position: 'first' | 'last' | 'middle' | undefined;

            if (index === 0) position = 'first';
            if (index === allPages.length - 1) position = 'last';
            if (page === '...') position = 'middle';

            return (
              <PaginationNumber
                key={page + `${index}`}
                href={createPageURL(page)}
                page={page}
                position={position}
                isActive={currentPage === page}
              />
            );
          })}
        </div>

        <div className="pointer-events-none sm:hidden">
          <PaginationNumber
            href={createPageURL(currentPage)}
            page={currentPage}
            position={undefined}
            isActive={false}
          />
        </div>

        <PaginationArrow
          direction="right"
          href={createPageURL(currentPage + 1)}
          isDisabled={currentPage >= totalPages}
        />

        <div className="sm:hidden">
          <PaginationArrow
            type="double"
            direction="right"
            href={createPageURL(totalPages)}
            isDisabled={currentPage >= totalPages}
          />
        </div>
      </div>
    </>
  );
}
