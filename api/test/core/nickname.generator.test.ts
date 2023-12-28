import { randomUUID } from 'crypto';

import {
  generateUserNickname,
  generateUserTag
} from '@src/core/nickname.generator';

describe('Test generate user nickname', () => {
  it('should consistently generate the same nickname upon repeated execution', () => {
    const userId = randomUUID();
    const expectedResult = generateUserNickname(userId);
    for (let i = 0; i < 3; i++) {
      expect(generateUserNickname(userId)).toEqual(expectedResult);
    }
  });
});

describe('Test generate user tag', () => {
  it('should consistently generate the same userTag upon repeated execution', () => {
    const userId = randomUUID();
    const expectedResult = generateUserTag(userId);
    for (let i = 0; i < 3; i++) {
      expect(generateUserTag(userId)).toEqual(expectedResult);
    }
  });
});
