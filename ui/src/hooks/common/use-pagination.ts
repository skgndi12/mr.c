import { redirect, usePathname, useSearchParams } from 'next/navigation';
import { generatePagination } from '@/lib/utils/common/generate-pagination';

export function usePagination(totalPages: number) {
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

  return { allPages, createPageURL, currentPage };
}
