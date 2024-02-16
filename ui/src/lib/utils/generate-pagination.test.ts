import { generatePagination } from '@/lib/utils/generate-pagination';

describe('generatePagination', () => {
  test.each([
    { currentPage: 1, totalPages: 5, expected: [1, 2, 3, 4, 5] },
    { currentPage: 1, totalPages: 10, expected: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
    { currentPage: 1, totalPages: 11, expected: [1, 2, 3, 4, 5, '...', 10, 11] },
    { currentPage: 5, totalPages: 11, expected: [1, 2, 3, 4, 5, 6, 7, '...', 10, 11] },
    { currentPage: 10, totalPages: 20, expected: [1, 2, '...', 8, 9, 10, 11, 12, '...', 19, 20] },
    { currentPage: 15, totalPages: 20, expected: [1, 2, '...', 13, 14, 15, 16, 17, 18, 19, 20] },
    { currentPage: 19, totalPages: 20, expected: [1, 2, '...', 16, 17, 18, 19, 20] },
  ])('should generate array of page numbers correctly', ({ currentPage, totalPages, expected }) => {
    expect(generatePagination(currentPage, totalPages)).toEqual(expected);
  });

  expect(() => generatePagination(10, 4)).toThrow('invalid');
});
