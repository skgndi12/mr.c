import { AccessLevel } from '@prisma/client';

export interface UserV1PathParameter {
  userId: string;
}

export interface UpdateUserV1Request {
  requestedAccessLevel: AccessLevel;
}
