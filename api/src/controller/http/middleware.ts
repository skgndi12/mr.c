import { NextFunction, Request, Response } from 'express';
import 'express-async-errors';
import { HttpError as ValidationError } from 'express-openapi-validator/dist/framework/types';
import { Logger } from 'winston';

import {
  BadRequestErrorType,
  CustomError,
  ForbiddenErrorType,
  InternalErrorType,
  MethodNotAllowedErrorType,
  NotAcceptableErrorType,
  NotFoundErrorType,
  PayloadTooLargeErrorType,
  UnauthorizedErrorType,
  UnsupportedMediaErrorType
} from '@controller/http/errors';
import { HttpErrorResponse } from '@controller/http/response';

export class Middleware {
  constructor(public logger: Logger) {}

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
        errors: res.locals.error?.messages
      });
    });

    next();
  };

  public handleError = (
    err: Error,
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
      customError = new CustomError(
        InternalErrorType.UNEXPECTED,
        'Unexpected error happened'
      );
    }

    this.respondError(customError, res);
  };

  // TODO: https://github.com/MovieReviewComment/Mr.C/issues/49
  public handleNotFoundRoute = (
    req: Request,
    res: Response<HttpErrorResponse>,
    next: NextFunction
  ) => {
    this.respondError(
      new CustomError(
        NotFoundErrorType.ROUTE_NOT_FOUND,
        'No matching route found'
      ),
      res
    );
  };

  private convertValidationErrorToCustomError = (
    err: ValidationError
  ): CustomError => {
    const errMessages = err.errors.map((e) => e.message);

    switch (err.status) {
      case 400:
        return new CustomError(BadRequestErrorType.BAD_REQUEST, ...errMessages);
      case 401:
        return new CustomError(
          UnauthorizedErrorType.UNAUTHORIZED,
          ...errMessages
        );
      case 403:
        return new CustomError(ForbiddenErrorType.FORBIDDEN, ...errMessages);
      case 404:
        return new CustomError(
          NotFoundErrorType.ROUTE_NOT_FOUND,
          ...errMessages
        );
      case 405:
        return new CustomError(
          MethodNotAllowedErrorType.METHOD_NOT_ALLOWED,
          ...errMessages
        );
      case 406:
        return new CustomError(
          NotAcceptableErrorType.NOT_ACCEPTABLE,
          ...errMessages
        );
      case 413:
        return new CustomError(
          PayloadTooLargeErrorType.PAYLOAD_TOO_LARGE,
          ...errMessages
        );
      case 415:
        return new CustomError(
          UnsupportedMediaErrorType.UNSUPPORTED_MEDIA_TYPE,
          ...errMessages
        );
      default:
        return new CustomError(InternalErrorType.UNEXPECTED, ...errMessages);
    }
  };

  private respondError = (
    err: CustomError,
    res: Response<HttpErrorResponse>
  ) => {
    const statusCode = this.getStatusCode(err);

    res.locals.error = err;
    res.status(statusCode);
    res.send({
      type: err.type,
      messages: err.messages
    });
  };

  private getStatusCode = (err: CustomError) => {
    switch (err.type) {
      case 'BAD_REQUEST':
        return 400;
      case 'UNAUTHORIZED':
        return 401;
      case 'FORBIDDEN':
        return 403;
      case 'ROUTE_NOT_FOUND':
        return 404;
      case 'USER_NOT_FOUND':
        return 404;
      case 'REVIEW_NOT_FOUND':
        return 404;
      case 'REPLY_NOT_FOUND':
        return 404;
      case 'METHOD_NOT_ALLOWED':
        return 405;
      case 'NOT_ACCEPTABLE':
        return 406;
      case 'PAYLOAD_TOO_LARGE':
        return 413;
      case 'UNSUPPORTED_MEDIA_TYPE':
        return 415;
      default:
        return 500;
    }
  };
}
