import { AsccessLevelEnum, IdpEnum } from '@src/core/types';

export interface User {
  id: string;
  nickname: string;
  tag: string;
  idp: IdpEnum;
  email: string;
  accessLevel: AsccessLevelEnum;
  createdAt: Date;
  updatedAt: Date;
}
