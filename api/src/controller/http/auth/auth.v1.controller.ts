import { Request, Response, Router } from 'express';

import { AuthService } from '@src/core/services/auth/auth.service';

import { GoogleSignInV1Response } from '@controller/http/auth/response/auth.v1.response';
import { methodNotAllowed } from '@controller/http/handler';

export class AuthV1Controller {
  constructor(private readonly service: AuthService) {}

  public routes = (): Router => {
    const router: Router = Router();
    const googlePrefix = '/v1/google';

    router
      .route(`${googlePrefix}/sign-in`)
      .get(this.googleSignIn)
      .all(methodNotAllowed);

    return router;
  };

  public googleSignIn = async (
    req: Request,
    res: Response<GoogleSignInV1Response>
  ) => {
    const referrer = req.get('Referer') ?? req.get('Referrer') ?? null;
    const redirectUrl = this.service.initiateGoogleSignIn(
      req.protocol,
      referrer
    );
    res.redirect(redirectUrl);
  };
}
