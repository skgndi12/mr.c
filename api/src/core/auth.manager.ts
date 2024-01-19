import { AccessLevel } from '@prisma/client';

import { AppIdToken } from '@src/core/entities/auth.entity';

export function validateUserAuthorization(
  requiredLevel: AccessLevel,
  requesterIdToken: AppIdToken,
  requestedUserId: string
): boolean {
  if (
    !validateAccessLevel(requiredLevel, requesterIdToken.accessLevel) &&
    requesterIdToken.userId !== requestedUserId
  ) {
    return false;
  }
  return true;
}

export function validateAccessLevel(
  requiredLevel: AccessLevel,
  userLevel: AccessLevel
): boolean {
  const requiredLevelNumber = convertAccessLevelToNumber(requiredLevel);
  const userLevelNumber = convertAccessLevelToNumber(userLevel);

  if (userLevelNumber < requiredLevelNumber) {
    return false;
  }
  return true;
}

function convertAccessLevelToNumber(accessLevel: AccessLevel): number {
  switch (accessLevel) {
    case AccessLevel.USER:
      return 1;
    case AccessLevel.DEVELOPER:
      return 2;
    case AccessLevel.ADMIN:
      return 3;
  }
}
