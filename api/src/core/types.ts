import { AccessLevel, Idp } from '@prisma/client';

export class IdpEnum {
  constructor(private readonly idp: Idp) {}

  public get = (): Idp => {
    return this.idp;
  };
}

export class AccessLevelEnum {
  constructor(private readonly accessLevel: AccessLevel) {}

  public get = (): AccessLevel => {
    return this.accessLevel;
  };

  public toNumber = (): number => {
    switch (this.accessLevel) {
      case AccessLevel.USER:
        return 1;
      case AccessLevel.DEVELOPER:
        return 2;
      case AccessLevel.ADMIN:
        return 3;
    }
  };
}
