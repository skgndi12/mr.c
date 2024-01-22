import { AccessLevelEnum, IdpEnum } from '@src/core/types';

export class AppIdToken {
  constructor(
    public readonly userId: string,
    public readonly nickname: string,
    public readonly tag: string,
    public readonly idp: IdpEnum,
    public readonly email: string,
    public readonly accessLevel: AccessLevelEnum
  ) {}

  public isAccessLevelAndUserIdAuthorized = (
    requiredLevel: AccessLevelEnum,
    requestedUserId: string
  ): boolean => {
    if (
      !this.isAccessLevelAuthorized(requiredLevel) &&
      this.userId !== requestedUserId
    ) {
      return false;
    }
    return true;
  };

  public isAccessLevelAuthorized = (
    requiredLevel: AccessLevelEnum
  ): boolean => {
    if (this.accessLevel.toNumber() < requiredLevel.toNumber()) {
      return false;
    }
    return true;
  };
}

export interface GoogleIdToken {
  iss: string;
  aud: string;
  sub: string;
  email: string;
  iat: number;
  exp: number;
}
