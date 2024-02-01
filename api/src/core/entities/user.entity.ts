import { AccessLevel, Idp } from '@prisma/client';

import { AccessLevelEnum, IdpEnum } from '@src/core/types';

export interface UserData {
  id: string;
  nickname: string;
  tag: string;
  idp: Idp;
  email: string;
  accessLevel: AccessLevel;
  createdAt: Date;
  updatedAt: Date;
}

export class User {
  constructor(
    public readonly id: string,
    public readonly nickname: string,
    public readonly tag: string,
    public readonly idp: IdpEnum,
    public readonly email: string,
    public readonly accessLevel: AccessLevelEnum,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  public getData = (): UserData => {
    return {
      id: this.id,
      nickname: this.nickname,
      tag: this.tag,
      idp: this.idp.get(),
      email: this.email,
      accessLevel: this.accessLevel.get(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  };
}
