import { Tspec } from 'tspec';

import { LivenessResponse } from '@controller/http/health/response/health.response';
import { HttpErrorResponse } from '@controller/http/response';

export type HealthApiSpec = Tspec.DefineApiSpec<{
  basePath: '/healthz';
  tags: ['Health Checks'];
  paths: {
    '/liveness': {
      get: {
        summary: 'Check for liveness';
        responses: {
          200: LivenessResponse;
          default: HttpErrorResponse;
        };
      };
    };
  };
}>;
