import { AccessLevel, Idp } from '@prisma/client';
import { randomUUID } from 'crypto';

import { AppIdToken } from '@src/core/entities/auth.entity';
import { AccessLevelEnum, IdpEnum } from '@src/core/types';
import { CustomError } from '@src/error/errors';
import { JwtClient } from '@src/jwt/jwt.client';
import { AppPayload } from '@src/jwt/payload';

function base64UrlEncode(str: string) {
  return Buffer.from(str).toString('base64url');
}

function decodePayload(str: string) {
  return JSON.parse(Buffer.from(str, 'base64url').toString('utf8'));
}

describe('Test jwt client', () => {
  let client: JwtClient;

  beforeAll(() => {
    const config = {
      activeKeyPair: 'test',
      expirationHour: 1,
      keyPairs: [
        {
          name: 'test',
          private:
            '-----BEGIN RSA PRIVATE KEY-----\nMIIEpQIBAAKCAQEAsNp22LRZ1VNL+0KI21Cd7XFIF5bdN4fiNjESGMcH8iylL0Pg\n924lYq/Jtt8wtBAVUn6W87hRqFN4jwrHfcaGd25aTf/MnR9asteSj8+d9K/s8UOL\nMQMRPjY0ud/NNL4Bn3LubjwLXjEkhV6bC9LeIZSAFiomjjqW2V4rFecffngdtOo8\nP77P19Rg5snQkLox1ABmVGE9+XWU2Hr1vZ+mh2WqwGmQr/j5Us6QZ8vvKR0oQdmz\nz9+P/1w/xwEYvZhZyn1hTWvBEufUQYWSb0ve/uKYA36hQt+ou2Y7ITRR0raFePtw\niwRfIT1cqeqG6+n+uMiT5kh70P6vQbglfCj91QIDAQABAoIBAGl4H+Bkzh42qt2R\ndGS20zhDkqbexdbUJsgCw7QbHlYC4hAp/wQQoCMWismQmU8JOG4WKJf4mFo2TXOh\nDg+oUZDwMtLJdpFNnZ2CillRi/Xc5QWNLnlwRtw/H3qqSYrmtbkNpbv/+xeVXx5a\nqUSH4QlNsoWFZbD0p/nB+xf42gNlSO5pOOqP5iXt5wJBbWhpomqFFZuD/+Pf6Uma\n+YNB6u6/obdS+AaHt3TIUck2CtMgZ49jI+rx87JEpNO2QVeiprTDBlZMyzxTQi3W\n3tfY5o5Nsu42ZyptZSTacNKgOzKub/7T0p6852j/fOXGQvVRT8baVFAeM9TrPExS\np2f/84ECgYEA3eaM/Q+flts3KJBpiTw5kwD5v6vAoZ4oGlJIxlMEjE4vLtruS1Fa\nYxChOeEmdu9oAk3drxDmtPmNTKXnlv75P2/h0Qi1burEF0wcQN5tUF1blcdgG4kr\nQVCf+Bwk03lVcPS8YxxeHCpq5NEEKLFImkjbY/X9pqWxQbsPjZOTfxkCgYEAzAfH\nznohrkWoy1guV/sxZjs6AIwBqM1uWhraXmDc+yVc1nNMKuyL5LKuaJFWSwXWMe2F\nhUT5BYs3ajtpEboxmQ+V9nCM6jbSSsxSrWe8sOffZj2hTbsJh8/N5rXTK1QaMRD3\ns1BQINAofxitFxKYWJ60tKAhTlmNMMwfH7Y7WB0CgYEAlN0cbJDUoWHDKUVoZ5at\nkT8wTTOt8T6m7LGS/OmovW+eG7Ln9kNHffokDy5KnbOSdSlDtTSDcZmQ/4C1UwkO\nsU4fkhpjjVuV3YND2QjfEPDwhhTRFuf4ysKJ7usCkZRui27EC0F2qTKTr5nBToNQ\nj6Cc/fyDBA9YUR5rGrGMW9ECgYEAxqKciAynVb9DwhSrqcRIJ7tpkLa9ttWppdeW\n2WN8QJXzeGTvtqps186Ntggo9wlLq3gPEdxAhIExBh+o/zVCrD1cRnz08+FDgsbB\nh0kDj0dvW16M99wsPyi00PQcDobmqPZX8R8zo36Erpgbi+byovSAAYoUYu8UYnmX\no4wK4pECgYEA2HY5ChDIAwucoN0mHDRsCUDQqopiI7rS9WckH6LnNbB5H9/mKvOK\ncHgqP1sH8xA9hYK1Gh5LljUHbwp3XAaLZULkDsMgPKG7DpnBN81Jq9avo0k9tl9b\nziVXu0bWgX8bIt9cmoG5eP9jx8oCTnR/l7xDxOTsDH1VV91lQjfj9fo=\n-----END RSA PRIVATE KEY-----\n',
          public:
            '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAsNp22LRZ1VNL+0KI21Cd\n7XFIF5bdN4fiNjESGMcH8iylL0Pg924lYq/Jtt8wtBAVUn6W87hRqFN4jwrHfcaG\nd25aTf/MnR9asteSj8+d9K/s8UOLMQMRPjY0ud/NNL4Bn3LubjwLXjEkhV6bC9Le\nIZSAFiomjjqW2V4rFecffngdtOo8P77P19Rg5snQkLox1ABmVGE9+XWU2Hr1vZ+m\nh2WqwGmQr/j5Us6QZ8vvKR0oQdmzz9+P/1w/xwEYvZhZyn1hTWvBEufUQYWSb0ve\n/uKYA36hQt+ou2Y7ITRR0raFePtwiwRfIT1cqeqG6+n+uMiT5kh70P6vQbglfCj9\n1QIDAQAB\n-----END PUBLIC KEY-----\n'
        }
      ]
    };
    client = new JwtClient(config);
  });

  it('should verify app id token', () => {
    const givenToken = new AppIdToken(
      randomUUID(),
      '신비로운 시네필 황금 사자',
      '#MQ3B',
      new IdpEnum(Idp.GOOGLE),
      'user1@gmail.com',
      new AccessLevelEnum(AccessLevel.USER)
    );

    const tokenString = client.signAppIdToken(givenToken);
    const verifiedToken = client.verifyAppIdToken(tokenString);

    expect(JSON.stringify(verifiedToken)).toEqual(JSON.stringify(givenToken));
  });

  it('should throw error when verify malicious app id token', () => {
    const givenToken = new AppIdToken(
      randomUUID(),
      '신비로운 시네필 황금 사자',
      '#MQ3B',
      new IdpEnum(Idp.GOOGLE),
      'user1@gmail.com',
      new AccessLevelEnum(AccessLevel.USER)
    );

    const tokenString = client.signAppIdToken(givenToken);
    const [encodedHeader, encodedPayload, signature] = tokenString.split('.');
    const maliciousPayload = decodePayload(encodedPayload);
    maliciousPayload.accessLevel = AccessLevel.ADMIN;
    const maliciousToken =
      encodedHeader +
      '.' +
      base64UrlEncode(JSON.stringify(maliciousPayload)) +
      '.' +
      signature;

    expect(() => {
      client.verifyAppIdToken(maliciousToken);
    }).toThrowError(CustomError);
  });

  it('should successfully decode a token without verification', () => {
    const givenToken = new AppIdToken(
      randomUUID(),
      '신비로운 시네필 황금 사자',
      '#MQ3B',
      new IdpEnum(Idp.GOOGLE),
      'user1@gmail.com',
      new AccessLevelEnum(AccessLevel.USER)
    );

    const tokenString = client.signAppIdToken(givenToken);
    const decodedPayload = client.decodeTokenWithoutVerify(tokenString)
      .payload as AppPayload;

    expect(decodedPayload).toEqual(
      expect.objectContaining({
        userId: givenToken.userId,
        nickname: givenToken.nickname,
        tag: givenToken.tag,
        idp: givenToken.idp.get(),
        email: givenToken.email,
        accessLevel: givenToken.accessLevel.get()
      })
    );
  });
});
