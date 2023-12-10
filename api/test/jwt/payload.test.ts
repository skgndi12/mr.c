import { randomUUID } from 'crypto';

import { isAppPayload } from '@src/jwt/payload';

describe('Tests about app payload', () => {
  let now: number;
  let exp: number;
  beforeAll(async () => {
    now = Math.floor(Date.now() / 1000);
    exp = now + 3600;
  });

  it('should return true when payload is valid', () => {
    const givenPayload = {
      iss: 'test',
      iat: now,
      nbf: now,
      exp: exp,
      userId: randomUUID(),
      nickname: '신비로운 시네필 황금 사자',
      tag: '#MQ3B',
      idp: 'GOOGLE',
      email: 'user1@gmail.com',
      accessLevel: 'USER'
    };
    expect(isAppPayload(givenPayload)).toEqual(true);
  });

  it('should return false when payload includes unsupported IDP', () => {
    const givenPayload = {
      iss: 'test',
      iat: now,
      nbf: now,
      exp: exp,
      userId: randomUUID(),
      nickname: '신비로운 시네필 황금 사자',
      tag: '#MQ3B',
      idp: 'KAKAO',
      email: 'user1@gmail.com',
      accessLevel: 'USER'
    };
    expect(isAppPayload(givenPayload)).toEqual(false);
  });

  it('should return false when payload includes invalid accessLevel', () => {
    const givenPayload = {
      iss: 'test',
      iat: now,
      nbf: now,
      exp: exp,
      userId: randomUUID(),
      nickname: '신비로운 시네필 황금 사자',
      tag: '#MQ3B',
      idp: 'GOOGLE',
      email: 'user1@gmail.com',
      accessLevel: 'SUPER'
    };
    expect(isAppPayload(givenPayload)).toEqual(false);
  });

  it('should return false when payload missing nickname field', () => {
    const givenPayload = {
      iss: 'test',
      iat: now,
      nbf: now,
      exp: exp,
      userId: randomUUID(),
      tag: '#MQ3B',
      idp: 'GOOGLE',
      email: 'user1@gmail.com',
      accessLevel: 'USER'
    };
    expect(isAppPayload(givenPayload)).toEqual(false);
  });

  it('should return false when the payload iat field has an unexpected type', () => {
    const givenPayload = {
      iss: 'test',
      iat: `${now}`,
      nbf: now,
      exp: exp,
      userId: randomUUID(),
      nickname: '신비로운 시네필 황금 사자',
      tag: '#MQ3B',
      idp: 'GOOGLE',
      email: 'user1@gmail.com',
      accessLevel: 'USER'
    };
    expect(isAppPayload(givenPayload)).toEqual(false);
  });
});
