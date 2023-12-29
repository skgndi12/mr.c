import { createHash } from 'crypto';

export function generateMd5Hash(data: string): string {
  return createHash('md5').update(data).digest('hex');
}

export class HexaModCalculator {
  private static hexadecimalDigits: Map<string, number>;
  private static isInitialized = false;

  private static initialize = () => {
    HexaModCalculator.hexadecimalDigits = new Map();

    for (let i = 0; i <= 9; i++) {
      HexaModCalculator.hexadecimalDigits.set(
        String.fromCharCode(i + '0'.charCodeAt(0)),
        i
      );
    }

    HexaModCalculator.hexadecimalDigits.set('a', 10);
    HexaModCalculator.hexadecimalDigits.set('b', 11);
    HexaModCalculator.hexadecimalDigits.set('c', 12);
    HexaModCalculator.hexadecimalDigits.set('d', 13);
    HexaModCalculator.hexadecimalDigits.set('e', 14);
    HexaModCalculator.hexadecimalDigits.set('f', 15);
  };

  private static ensureInitialize = () => {
    if (!HexaModCalculator.isInitialized) {
      HexaModCalculator.initialize();
      HexaModCalculator.isInitialized = true;
    }
  };

  // NOTE: This code is adapted from https://www.geeksforgeeks.org/modulus-of-two-hexadecimal-numbers/
  public static hexaMod = (hexDividend: string, hexDivisor: string): number => {
    HexaModCalculator.ensureInitialize();

    const decimalDivisor = parseInt(hexDivisor, 16);
    if (decimalDivisor <= 0) {
      throw Error('division by zero is not allowed');
    }

    let decimalBase = 1;
    let decimalResult = 0;

    for (let i = hexDividend.length - 1; i >= 0; i--) {
      const decimalValue = HexaModCalculator.hexadecimalDigits.get(
        hexDividend[i]
      );
      if (decimalValue === undefined) {
        throw Error('invalid hexadecimal value');
      }

      const decimalRemainder = decimalValue % decimalDivisor;
      decimalResult =
        (decimalResult +
          ((((decimalBase % decimalDivisor) * decimalRemainder) %
            decimalDivisor) %
            decimalDivisor)) %
        decimalDivisor;
      decimalBase =
        (((decimalBase % decimalDivisor) * 16) % decimalDivisor) %
        decimalDivisor;
    }

    return decimalResult;
  };
}
