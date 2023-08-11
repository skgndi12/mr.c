import { Request, Response, Router } from 'express';
import express from 'express';
import { Logger } from 'winston';

import { GreetingV1Request } from '@controller/http/dev/request/dev.v1.request';
import { GreetingV1Response } from '@controller/http/dev/response/dev.v1.response';
import { methodNotAllowed } from '@controller/http/handler';

export class DevV1Controller {
  constructor(public logger: Logger) {}

  public routes = (): Router => {
    const router: Router = Router();
    const prefix = '/v1/dev';

    router
      .use(express.json())
      .route(`${prefix}/greeting`)
      .post(this.greeting)
      .all(methodNotAllowed);

    return router;
  };

  public greeting = async (
    req: Request<any, any, GreetingV1Request>,
    res: Response<GreetingV1Response>
  ) => {
    this.logger.info(req.body);
    res.send({ message: 'Hello World!' });
  };
}
