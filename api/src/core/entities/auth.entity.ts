import { AccessLevel, Idp } from '@prisma/client';

export interface AppIdToken {
  userId: string;
  nickname: string;
  tag: string;
  idp: Idp;
  email: string;
  accessLevel: AccessLevel;
}

export interface GoogleIdToken {
  iss: string;
  aud: string;
  sub: string;
  idp: Idp;
  email: string;
  accessLevel: AccessLevel;
}
