import { Request, Response, Router } from 'express';

import { AppIdToken } from '@src/core/entities/auth.entity';

import { GreetingV1Request } from '@controller/http/dev/request/dev.v1.request';
import {
  GreetingV1Response,
  ServerTimeV1Response
} from '@controller/http/dev/response/dev.v1.response';
import { methodNotAllowed } from '@controller/http/handler';
import { Middleware } from '@controller/http/middleware';

export class DevV1Controller {
  constructor(private readonly middleware: Middleware) {}

  public routes = (): Router => {
    const router: Router = Router();
    const prefix = '/v1/dev';

    router
      .route(`${prefix}/greeting`)
      .post(this.middleware.issuePassport, this.greeting)
      .all(methodNotAllowed);

    router
      .route(`${prefix}/server-time`)
      .get(this.middleware.issuePassport, this.serverTime)
      .all(methodNotAllowed);

    return router;
  };

  public greeting = async (
    req: Request<any, any, GreetingV1Request, any, AppIdToken>,
    res: Response<GreetingV1Response>
  ) => {
    res.send({ message: 'Hello World!' });
  };

  public serverTime = async (
    req: Request<any, any, any, any, AppIdToken>,
    res: Response<ServerTimeV1Response>
  ) => {
    const now = new Date();

    res.send({ message: now.toISOString() });
  };
}
