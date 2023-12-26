import { Tspec } from 'tspec';

import { GoogleSignInV1Response } from '@controller/http/auth/response/auth.v1.response';
import { HttpErrorResponse } from '@controller/http/response';

export type AuthV1ApiSpec = Tspec.DefineApiSpec<{
  basePath: '/api/v1/google';
  tags: ['Auth'];
  paths: {
    '/sign-in': {
      get: {
        summary: 'Initiate google sign in';
        responses: {
          302: GoogleSignInV1Response;
          default: HttpErrorResponse;
        };
      };
    };
  };
}>;
