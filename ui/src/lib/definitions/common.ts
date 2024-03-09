export interface Pagination {
  pageOffset: number;
  pageSize: number;
  totalEntryCount: number;
  totalPageCount: number;
  direction: 'desc' | 'asc';
  sortBy: 'createdAt' | 'movieName';
}
