import { formatDateToLocal } from '@/lib/utils/format-date-to-local';

function getRelativeDateStr(interval: number) {
  const currentDateTime = new Date().getTime();
  return new Date(currentDateTime - interval).toISOString();
}

describe('formatDateToLocal', () => {
  describe('default mode', () => {
    const certainDateStr = '2023-04-02T15:08:00+09:00';

    test('should format time in Korean', () => {
      expect(formatDateToLocal(certainDateStr, 'ko-KR')).toBe('2023년 4월 2일');
    });

    test('should format time in English', () => {
      expect(formatDateToLocal(certainDateStr, 'en-US')).toBe('Apr 2, 2023');
    });
  });

  describe('relative mode', () => {
    let relativeDateStr: string;

    test.each([
      { interval: 1000 * 5, expected: '몇 초 전' },
      { interval: 1000 * 89, expected: '1분 전' },
      { interval: 1000 * 91, expected: '2분 전' },
      { interval: 1000 * 60 * 60 * 24 * 3, expected: '3일 전' },
      { interval: -1 * 1000 * 90, expected: '2분 후' },
    ])('should format time in Korean', ({ interval, expected }) => {
      relativeDateStr = getRelativeDateStr(interval);
      expect(formatDateToLocal(relativeDateStr, 'ko-KR', true)).toBe(expected);
    });

    test.each([
      { interval: 1000 * 5, expected: 'a few seconds ago' },
      { interval: 1000 * 89, expected: 'a minute ago' },
      { interval: 1000 * 91, expected: '2 minutes ago' },
      { interval: 1000 * 60 * 60 * 24 * 3, expected: '3 days ago' },
      { interval: -1 * 1000 * 90, expected: 'in 2 minutes' },
    ])('should format time in English', ({ interval, expected }) => {
      relativeDateStr = getRelativeDateStr(interval);
      expect(formatDateToLocal(relativeDateStr, 'en-US', true)).toBe(expected);
    });
  });

  test('should throw an Error when date string is not valid', () => {
    const invalidDateStr = 'foo';
    expect(() => formatDateToLocal(invalidDateStr, 'en-US')).toThrow(invalidDateStr);
  });
});
