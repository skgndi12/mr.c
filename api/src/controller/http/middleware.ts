import { NextFunction, Request, Response } from 'express';
import 'express-async-errors';
import { Logger } from 'winston';

import {
  CustomError,
  InternalErrorType,
  NotFoundErrorType
} from '@controller/http/errors';

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
    res: Response,
    next: NextFunction
  ) => {
    let customError: CustomError;
    if (err instanceof CustomError) {
      customError = err;
    } else {
      customError = new CustomError(
        InternalErrorType.UNEXPECTED,
        'Unexpected error happened'
      );
    }

    this.respondError(customError, res);
  };

  public handleNotFoundRoute = (
    req: Request,
    res: Response,
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

  private respondError = (err: CustomError, res: Response) => {
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
      case 'ROUTE_NOT_FOUND':
        return 404;
      case 'USER_NOT_FOUND':
        return 404;
      case 'REVIEW_NOT_FOUND':
        return 404;
      case 'REPLY_NOT_FOUND':
        return 404;
      default:
        return 500;
    }
  };
}
