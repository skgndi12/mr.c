import { AccessLevel } from '@prisma/client';

import { validateUserAuthorization } from '@src/core/auth.manager';
import { AppIdToken } from '@src/core/entities/auth.entity';
import { AccessLevelEnum } from '@src/core/types';

describe('Test validate user authorization', () => {
  const requestedUserId = 'randomId';
  const requesterUserId = 'anotherRandomId';

  it('should return true when given access level is high enough', () => {
    const givenRequiredLevel = new AccessLevelEnum(AccessLevel.ADMIN);
    const givenRequesterIdToken = {
      userId: requesterUserId,
      accessLevel: new AccessLevelEnum(AccessLevel.ADMIN)
    } as AppIdToken;

    expect(
      validateUserAuthorization(
        givenRequiredLevel,
        givenRequesterIdToken,
        requestedUserId
      )
    ).toEqual(true);
  });

  it('should return true when the requester ID is equal to the requested ID', () => {
    const givenRequiredAccessLevel = new AccessLevelEnum(AccessLevel.ADMIN);
    const givenRequesterIdToken = {
      userId: requestedUserId,
      accessLevel: new AccessLevelEnum(AccessLevel.USER)
    } as AppIdToken;

    expect(
      validateUserAuthorization(
        givenRequiredAccessLevel,
        givenRequesterIdToken,
        requestedUserId
      )
    ).toEqual(true);
  });

  it("should return false when requester's access level is not sufficient", () => {
    const givenRequiredAccessLevel = new AccessLevelEnum(AccessLevel.ADMIN);
    const givenRequesterIdToken = {
      userId: requesterUserId,
      accessLevel: new AccessLevelEnum(AccessLevel.USER)
    } as AppIdToken;

    expect(
      validateUserAuthorization(
        givenRequiredAccessLevel,
        givenRequesterIdToken,
        requestedUserId
      )
    ).toEqual(false);
  });
});
