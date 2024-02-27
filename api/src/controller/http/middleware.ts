import { NextFunction, Request, Response } from 'express';
import 'express-async-errors';
import { HttpError as ValidationError } from 'express-openapi-validator/dist/framework/types';
import { Logger } from 'winston';

import { JwtHandler } from '@src/core/ports/jwt.handler';
import { AppErrorCode, CustomError, HttpErrorCode } from '@src/error/errors';

import { HttpErrorResponse } from '@controller/http/response';
import { idTokenCookieName } from '@controller/http/types';

export class Middleware {
  constructor(
    private readonly logger: Logger,
    private readonly jwtHandler: JwtHandler
  ) {}

  public accessLog = (req: Request, res: Response, next: NextFunction) => {
    const start = new Date().getTime();
    res.on('finish', () => {
      const end = new Date().getTime();
      this.logger.http('Access log', {
        method: req.method,
        url: req.originalUrl,
        addr: req.ip,
        proto: `${req.protocol}/${req.httpVersion}`,
        contentLength: req.headers['content-length'],
        userAgent: req.headers['user-agent'],
        statusCode: res.statusCode,
        bodyBytes: res.getHeader('Content-Length'),
        elapsedMs: end - start,
        contentType: res.getHeader('Content-Type')?.toString().split(';')[0],
        error: res.locals?.error
      });
    });

    next();
  };

  public handleError = (
    err: unknown,
    req: Request,
    res: Response<HttpErrorResponse>,
    next: NextFunction
  ) => {
    let customError: CustomError;
    if (err instanceof CustomError) {
      customError = err;
    } else if (err instanceof ValidationError) {
      customError = this.convertValidationErrorToCustomError(err);
    } else {
      customError = new CustomError({
        code: HttpErrorCode.INTERNAL_ERROR,
        cause: err,
        message: 'Unexpected error occured'
      });
    }

    this.responseError(customError, res);
  };

  // TODO: https://github.com/MovieReviewComment/Mr.C/issues/49
  public handleNotFoundRoute = (
    req: Request,
    res: Response<HttpErrorResponse>,
    next: NextFunction
  ) => {
    this.responseError(
      new CustomError({
        code: HttpErrorCode.NOT_FOUND,
        cause: new Error('Not found route'),
        messages: ['No matching route found']
      }),
      res
    );
  };

  public issuePassport = (req: Request, res: Response, next: NextFunction) => {
    let passport = this.issuePassportFromHeader(req);

    if (passport === null) {
      passport = this.issuePassportFromCookie(req);
    }

    res.locals.passport = passport;
    next();
  };

  private convertValidationErrorToCustomError = (
    err: ValidationError
  ): CustomError => {
    const errMessages = this.getValidationErrorMessages(err);

    switch (err.status) {
      case 400:
        return new CustomError({
          code: HttpErrorCode.BAD_REQUEST,
          cause: err,
          messages: errMessages
        });
      case 401:
        return new CustomError({
          code: HttpErrorCode.UNAUTHORIZED,
          cause: err,
          messages: errMessages
        });
      case 403:
        return new CustomError({
          code: HttpErrorCode.FORBIDDEN,
          cause: err,
          messages: errMessages
        });
      case 404:
        return new CustomError({
          code: HttpErrorCode.NOT_FOUND,
          cause: err,
          messages: errMessages
        });
      case 405:
        return new CustomError({
          code: HttpErrorCode.METHOD_NOT_ALLOWED,
          cause: err,
          messages: errMessages
        });
      case 406:
        return new CustomError({
          code: HttpErrorCode.NOT_ACCEPTABLE,
          cause: err,
          messages: errMessages
        });
      case 413:
        return new CustomError({
          code: HttpErrorCode.PAYLOAD_TOO_LARGE,
          cause: err,
          messages: errMessages
        });
      case 415:
        return new CustomError({
          code: HttpErrorCode.UNSUPPORTED_MEDIA_TYPE,
          cause: err,
          messages: errMessages
        });
      default:
        return new CustomError({
          code: HttpErrorCode.INTERNAL_ERROR,
          cause: err,
          messages: errMessages
        });
    }
  };

  private getValidationErrorMessages = (err: ValidationError): string[] => {
    const errorMessages = err.errors.map((e) => {
      if (err.status < 500) return `${e.path}: ${e.message}`;
      else {
        return 'Unexpected error occured';
      }
    });

    return errorMessages;
  };

  private responseError = (
    err: CustomError,
    res: Response<HttpErrorResponse>
  ) => {
    const statusCode = err.getHttpStatusCode();

    switch (true) {
      case statusCode >= 500:
        this.logger.error('5xx error occured', {
          error: err,
          statusCode: statusCode
        });
        break;
      case statusCode >= 400:
        this.logger.warn('4xx error occured', {
          error: err,
          statusCode: statusCode
        });
        break;
    }

    res.locals.error = err;
    res.status(statusCode);
    res.send({
      messages: err.messages
    });
  };

  private issuePassportFromHeader = (req: Request) => {
    const authHeader = req.get('Authorization');
    if (authHeader === undefined) {
      return null;
    }

    const splittedAuthHeader = authHeader.split(' ', 2);
    if (splittedAuthHeader.length !== 2 || splittedAuthHeader[0] !== 'Bearer') {
      throw new CustomError({
        code: AppErrorCode.UNAUTHENTICATED,
        message: 'Authorization header must be in Bearer format',
        context: { splittedAuthHeader }
      });
    }

    return this.jwtHandler.verifyAppIdToken(splittedAuthHeader[1]);
  };

  private issuePassportFromCookie = (req: Request) => {
    const cookie = req.cookies[idTokenCookieName];
    if (cookie === undefined) {
      throw new CustomError({
        code: AppErrorCode.UNAUTHENTICATED,
        message: 'cookie does not exist',
        context: { cookie }
      });
    }

    return this.jwtHandler.verifyAppIdToken(cookie);
  };
}
