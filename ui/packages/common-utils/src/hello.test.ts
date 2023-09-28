import { hello } from './hello';

describe('hello', () => {
  it("should return 'Hello world!'", () => {
    expect(hello('world')).toBe('Hello world!');
  });
});
