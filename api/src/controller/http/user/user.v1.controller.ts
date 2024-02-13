import { Request, Response, Router } from 'express';

import { AppIdToken } from '@src/core/entities/auth.entity';
import { User } from '@src/core/entities/user.entity';
import { UserService } from '@src/core/services/user/user.service';

import { methodNotAllowed } from '@controller/http/handler';
import { Middleware } from '@controller/http/middleware';
import {
  UpdateUserV1Request,
  UserV1PathParameter
} from '@controller/http/user/request/user.v1.request';
import {
  DeleteUserV1Response,
  GetSelfUserV1Response,
  GetUserV1Response,
  UpdateUserV1Response,
  UserV1Response
} from '@controller/http/user/response/user.v1.response';

export class UserV1Controller {
  constructor(
    private readonly middleware: Middleware,
    private readonly service: UserService
  ) {}

  public routes = (): Router => {
    const router: Router = Router();
    const prefix = '/v1/users';

    router
      .route(`${prefix}/self`)
      .all(this.middleware.issuePassport)
      .get(this.getSelfUser)
      .all(methodNotAllowed);

    router
      .route(`${prefix}/:userId`)
      .all(this.middleware.issuePassport)
      .get(this.getUser)
      .put(this.updateUser)
      .delete(this.deleteUser)
      .all(methodNotAllowed);

    return router;
  };

  public getSelfUser = async (
    req: Request<any, any, any, any, AppIdToken>,
    res: Response<GetSelfUserV1Response>
  ) => {
    const user = await this.service.getUser(
      res.locals.passport,
      res.locals.passport.userId
    );

    res.send({ user: this.buildUserResponse(user) });
  };

  public getUser = async (
    req: Request<UserV1PathParameter, any, any, any, AppIdToken>,
    res: Response<GetUserV1Response>
  ) => {
    const user = await this.service.getUser(
      res.locals.passport,
      req.params.userId
    );

    res.send({ user: this.buildUserResponse(user) });
  };

  public updateUser = async (
    req: Request<
      UserV1PathParameter,
      any,
      any,
      UpdateUserV1Request,
      AppIdToken
    >,
    res: Response<UpdateUserV1Response>
  ) => {
    const userUpdated = await this.service.updateUser(
      res.locals.passport,
      req.params.userId,
      req.body.requestedAccessLevel
    );

    res.send({ user: this.buildUserResponse(userUpdated) });
  };

  public deleteUser = async (
    req: Request<UserV1PathParameter, any, any, any, AppIdToken>,
    res: Response<DeleteUserV1Response>
  ) => {
    await this.service.deleteUser(res.locals.passport, req.params.userId);

    res.send();
  };

  private buildUserResponse = (user: User): UserV1Response => {
    return {
      id: user.id,
      nickname: user.nickname,
      tag: user.tag,
      idp: user.idp.get(),
      email: user.email,
      accessLevel: user.accessLevel.get(),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  };
}
