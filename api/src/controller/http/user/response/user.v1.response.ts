import { AccessLevel, Idp } from '@prisma/client';

export interface UserV1Response {
  id: string;
  nickname: string;
  tag: string;
  idp: Idp;
  email: string;
  accessLevel: AccessLevel;
  createdAt: Date;
  updatedAt: Date;
}

export interface GetSelfUserV1Response {
  user: UserV1Response;
}

export interface GetUserV1Response {
  user: UserV1Response;
}

export interface UpdateUserV1Response {
  user: UserV1Response;
}

export interface DeleteUserV1Response {}
