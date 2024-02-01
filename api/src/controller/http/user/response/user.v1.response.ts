import { UserData } from '@src/core/entities/user.entity';

export interface GetUserV1Response {
  user: UserData;
}

export interface UpdateUserV1Response {
  user: UserData;
}

export interface DeleteUserV1Response {}
