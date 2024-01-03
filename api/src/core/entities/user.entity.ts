import { AccessLevel, Idp } from '@prisma/client';

export interface User {
  id: string;
  nickname: string;
  tag: string;
  idp: Idp;
  email: string;
  accessLevel: AccessLevel;
  createdAt: Date;
  updatedAt: Date;
}
