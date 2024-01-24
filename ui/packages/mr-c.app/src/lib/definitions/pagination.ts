export interface Pagination {
  pageOffset: number;
  pageSize: number;
  totalPageCount: number;
  direction: 'desc' | 'asc';
  sortBy: 'createdAt' | 'movieName';
}
