import { normalizeWhitespace } from '@/lib/utils/common/normalizeWhitespace';

describe('normalizeWhitespace', () => {
  test.each([
    ['  a  b  c  ', 'a b c '],
    ['  a\nb\n\n\n\nc  ', 'a b c '],
    ['  a\tb\t\t\t\tc  ', 'a b c '],
    [' \n\n\t a\n\t\n  b\t\n\tc  ', 'a b c '],
  ])('should normalize whitespace', (input, expected) => {
    expect(normalizeWhitespace(input)).toBe(expected);
  });
});
