export function generatePagination(currentPage: number, totalPages: number) {
  if (currentPage < 1 || currentPage > totalPages) {
    throw new Error('Fail to generate pagination: invalid page');
  }

  // If the total number of pages is 10 or less,
  // display all pages without any ellipsis.
  if (totalPages <= 10) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // If the current page is among the first 3 pages,
  // show the first 5, an ellipsis, and the last 2 pages.
  if (currentPage <= 3) {
    return [1, 2, 3, 4, 5, '...', totalPages - 1, totalPages];
  }

  // If the current page is among 4 and 6
  // show the pages less than current page, current page, its neighbors within 2 steps,
  // an ellipsis, and the last 2 pages.
  if (currentPage <= 6) {
    return [
      ...Array.from({ length: currentPage + 2 }, (_, i) => i + 1),
      '...',
      totalPages - 1,
      totalPages,
    ];
  }

  // If the current page is among the last 5 pages,
  // show the first 2, an ellipsis, and the last 5 pages.
  if (currentPage >= totalPages - 2) {
    return [
      1,
      2,
      '...',
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  // If the current page is among 4 and 6 from the last,
  // show the first 2, an ellipsis, and the 2 neighbors of current page,
  // the current page, and the remains till last.
  if (currentPage >= totalPages - 5) {
    return [
      1,
      2,
      '...',
      ...Array.from({ length: totalPages - currentPage + 3 }, (_, i) => totalPages - i).reverse(),
    ];
  }

  // If the current page is somewhere in the middle,
  // show the first page, an ellipsis, the current page and its neighbors,
  // another ellipsis, and the last page.
  return [
    1,
    2,
    '...',
    currentPage - 2,
    currentPage - 1,
    currentPage,
    currentPage + 1,
    currentPage + 2,
    '...',
    totalPages - 1,
    totalPages,
  ];
}
