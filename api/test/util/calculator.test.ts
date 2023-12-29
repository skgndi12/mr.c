import { HexaModCalculator } from '@src/util/calculator';

describe('Test hexaMod calculator', () => {
  it('should return correct result', () => {
    const testSet: Array<[number, number]> = [];

    for (
      let i = Number.MAX_SAFE_INTEGER - 50;
      i <= Number.MAX_SAFE_INTEGER;
      i++
    ) {
      testSet.push([i, Math.floor(i / 1000)]);
    }

    for (const [dividend, divisor] of testSet) {
      expect(
        HexaModCalculator.hexaMod(dividend.toString(16), divisor.toString(16))
      ).toEqual(dividend % divisor);
    }
  });

  it('should work correctly even if given dividend is very large', () => {
    expect(
      HexaModCalculator.hexaMod(
        '9ff4599228e14263b7076e2fa7a6477c998fabf315129eee77549ff238bfe26aa9b976f0db9e68f5',
        '469cbad3'
      )
    ).toEqual(114047340);
  });

  it('should throw Error when given divisor is zero', () => {
    expect(() => HexaModCalculator.hexaMod('111', '0')).toThrow();
  });

  it('should throw Error when given dividend is not valid hex', () => {
    expect(() => HexaModCalculator.hexaMod('xyz', 'ab')).toThrow();
  });
});
