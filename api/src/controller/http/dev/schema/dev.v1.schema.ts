import { Tspec } from 'tspec';

import { GreetingV1Request } from '@controller/http/dev/request/dev.v1.request';
import { GreetingV1Response } from '@controller/http/dev/response/dev.v1.response';
import { HttpErrorResponse } from '@controller/http/response';

export type DevApiSpec = Tspec.DefineApiSpec<{
  basePath: '/api/v1/dev';
  security: 'jwt';
  tags: ['Development'];
  paths: {
    '/greeting': {
      post: {
        summary: 'Greeting';
        body: GreetingV1Request;
        responses: {
          200: GreetingV1Response;
          default: HttpErrorResponse;
        };
      };
    };
  };
}>;
