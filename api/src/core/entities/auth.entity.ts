import { AccessLevel, Idp } from '@prisma/client';

export interface AppIdToken {
  userId: string;
  nickname: string;
  tag: string;
  idp: Idp;
  email: string;
  accessLevel: AccessLevel;
}
