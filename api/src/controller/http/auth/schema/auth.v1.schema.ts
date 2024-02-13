import { Tspec } from 'tspec';

import { GoogleSignInTokenV1Query } from '@controller/http/auth/request/auth.v1.request';
import {
  GoogleSignInV1Response,
  SignOutV1Response
} from '@controller/http/auth/response/auth.v1.response';
import { HttpErrorResponse } from '@controller/http/response';

export type AuthV1ApiSpec = Tspec.DefineApiSpec<{
  basePath: '/api/v1';
  tags: ['Auth'];
  paths: {
    '/google/sign-in': {
      get: {
        summary: 'Initiate google sign in';
        responses: {
          302: GoogleSignInV1Response;
          default: HttpErrorResponse;
        };
      };
    };
    '/google/sign-in/token': {
      get: {
        summary: 'Finalize google sign in';
        query: GoogleSignInTokenV1Query;
        responses: {
          302: GoogleSignInV1Response;
          default: HttpErrorResponse;
        };
      };
    };
    '/auth/sign-out': {
      get: {
        security: 'jwt';
        summary: 'Sign out';
        responses: {
          200: SignOutV1Response;
          default: HttpErrorResponse;
        };
      };
    };
  };
}>;
