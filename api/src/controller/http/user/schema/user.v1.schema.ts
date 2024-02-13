import { Tspec } from 'tspec';

import { HttpErrorResponse } from '@controller/http/response';
import { UpdateUserV1Request } from '@controller/http/user/request/user.v1.request';
import {
  DeleteUserV1Response,
  GetSelfUserV1Response,
  GetUserV1Response,
  UpdateUserV1Response
} from '@controller/http/user/response/user.v1.response';

export type UserV1ApiSpec = Tspec.DefineApiSpec<{
  basePath: '/api/v1/users';
  tags: ['User'];
  paths: {
    '/self': {
      get: {
        summary: 'Fetch self user detail';
        responses: {
          200: GetSelfUserV1Response;
          default: HttpErrorResponse;
        };
      };
    };
    '/{userId}': {
      get: {
        summary: 'Fetch user detail';
        path: { userId: string };
        responses: {
          200: GetUserV1Response;
          default: HttpErrorResponse;
        };
      };
      put: {
        summary: "Update user's information";
        path: { userId: string };
        body: UpdateUserV1Request;
        responses: {
          200: UpdateUserV1Response;
          default: HttpErrorResponse;
        };
      };
      delete: {
        summary: "Delete user's information";
        path: { userId: string };
        responses: {
          200: DeleteUserV1Response;
          default: HttpErrorResponse;
        };
      };
    };
  };
}>;
