import { AccessLevelEnum, IdpEnum } from '@src/core/types';

export interface User {
  id: string;
  nickname: string;
  tag: string;
  idp: IdpEnum;
  email: string;
  accessLevel: AccessLevelEnum;
  createdAt: Date;
  updatedAt: Date;
}
