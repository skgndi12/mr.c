import { Request, Response, Router } from 'express';

import { AuthService } from '@src/core/services/auth/auth.service';

import { GoogleSignInTokenV1Query } from '@controller/http/auth/request/auth.v1.request';
import {
  GoogleSignInTokenV1Response,
  GoogleSignInV1Response,
  SignOutV1Response
} from '@controller/http/auth/response/auth.v1.response';
import { methodNotAllowed } from '@controller/http/handler';
import { idTokenCookieName } from '@controller/http/types';

export class AuthV1Controller {
  constructor(
    private readonly service: AuthService,
    private readonly cookieExpirationHours: number
  ) {}

  public routes = (): Router => {
    const router: Router = Router();
    const authPrefix = '/v1/auth';
    const googlePrefix = '/v1/google';

    router
      .route(`${googlePrefix}/sign-in/token`)
      .get(this.googleSignInToken)
      .all(methodNotAllowed);

    router
      .route(`${googlePrefix}/sign-in`)
      .get(this.googleSignIn)
      .all(methodNotAllowed);

    router
      .route(`${authPrefix}/sign-out`)
      .get(this.signOut)
      .all(methodNotAllowed);

    return router;
  };

  public googleSignIn = async (
    req: Request,
    res: Response<GoogleSignInV1Response>
  ) => {
    const referrer = req.get('Referer') ?? req.get('Referrer') ?? null;
    const host = req.get('X-Forwarded-Host') ?? req.get('Host') ?? req.hostname;
    const baseUrl = `${req.protocol}://${host}`;
    const redirectUrl = await this.service.initiateGoogleSignIn(
      baseUrl,
      referrer
    );

    res.redirect(redirectUrl);
  };

  public googleSignInToken = async (
    req: Request<any, any, any, GoogleSignInTokenV1Query>,
    res: Response<GoogleSignInTokenV1Response>
  ) => {
    const host = req.get('X-Forwarded-Host') ?? req.get('Host') ?? req.hostname;
    const baseUrl = `${req.protocol}://${host}`;
    const [redirectUrl, appIdToken] = await this.service.finalizeGoogleSignIn(
      baseUrl,
      req.query.state,
      req.query.code
    );

    res.cookie(idTokenCookieName, appIdToken, {
      path: '/',
      httpOnly: true,
      sameSite: 'strict',
      expires: new Date(
        Date.now() + this.cookieExpirationHours * 60 * 60 * 1000
      )
    });
    res.redirect(redirectUrl);
  };

  public signOut = (req: Request, res: Response<SignOutV1Response>) => {
    res.clearCookie(idTokenCookieName);
    res.send();
  };
}
