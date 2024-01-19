import { User } from '@src/core/entities/user.entity';

export interface GetUserV1Response {
  user: User;
}

export interface UpdateUserV1Response {
  user: User;
}

export interface DeleteUserV1Response {}
