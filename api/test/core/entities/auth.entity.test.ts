import { AccessLevel, Idp } from '@prisma/client';

import { AppIdToken } from '@src/core/entities/auth.entity';
import { AccessLevelEnum, IdpEnum } from '@src/core/types';

describe('Test auth enity', () => {
  const requestedUserId = 'randomId';
  const requesterUserId = 'anotherRandomId';

  it("should return true when given requester's access level is high enough", () => {
    const givenRequiredLevel = new AccessLevelEnum(AccessLevel.ADMIN);
    const givenRequesterIdToken = new AppIdToken(
      requesterUserId,
      'nickname',
      '#TAGG',
      new IdpEnum(Idp.GOOGLE),
      'user1@gmail.com',
      new AccessLevelEnum(AccessLevel.ADMIN)
    );

    expect(
      givenRequesterIdToken.isAccessLevelAndUserIdAuthorized(
        givenRequiredLevel,
        requestedUserId
      )
    ).toEqual(true);
  });

  it('should return true when the requester ID is equal to the requested ID', () => {
    const givenRequiredLevel = new AccessLevelEnum(AccessLevel.ADMIN);
    const givenRequesterIdToken = new AppIdToken(
      requesterUserId,
      'nickname',
      '#TAGG',
      new IdpEnum(Idp.GOOGLE),
      'user1@gmail.com',
      new AccessLevelEnum(AccessLevel.USER)
    );

    expect(
      givenRequesterIdToken.isAccessLevelAndUserIdAuthorized(
        givenRequiredLevel,
        requesterUserId
      )
    ).toEqual(true);
  });

  it("should return false when requester's access level is not sufficient", () => {
    const givenRequiredLevel = new AccessLevelEnum(AccessLevel.ADMIN);
    const givenRequesterIdToken = new AppIdToken(
      requesterUserId,
      'nickname',
      '#TAGG',
      new IdpEnum(Idp.GOOGLE),
      'user1@gmail.com',
      new AccessLevelEnum(AccessLevel.USER)
    );

    expect(
      givenRequesterIdToken.isAccessLevelAndUserIdAuthorized(
        givenRequiredLevel,
        requestedUserId
      )
    ).toEqual(false);
  });
});
