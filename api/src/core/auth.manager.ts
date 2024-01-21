import { AppIdToken } from '@src/core/entities/auth.entity';
import { AccessLevelEnum } from '@src/core/types';

export function validateUserAuthorization(
  requiredLevel: AccessLevelEnum,
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
  requiredLevel: AccessLevelEnum,
  userLevel: AccessLevelEnum
): boolean {
  if (userLevel.toNumber() < requiredLevel.toNumber()) {
    return false;
  }
  return true;
}
