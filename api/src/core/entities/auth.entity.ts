import { AccessLevelEnum, IdpEnum } from '@src/core/types';

export interface AppIdToken {
  userId: string;
  nickname: string;
  tag: string;
  idp: IdpEnum;
  email: string;
  accessLevel: AccessLevelEnum;
}
