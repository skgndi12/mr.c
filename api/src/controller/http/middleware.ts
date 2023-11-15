import { NextFunction, Request, Response } from 'express';
import 'express-async-errors';
import { HttpError as ValidationError } from 'express-openapi-validator/dist/framework/types';
import { Logger } from 'winston';

import { CustomError, HttpErrorCode } from '@src/error/errors';

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
        error: res.locals?.error
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
        HttpErrorCode.INTERNAL_ERROR,
        err,
        'Unexpected error occured'
      );
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
      new CustomError(
        HttpErrorCode.NOT_FOUND,
        new Error('Not found route'),
        'No matching route found'
      ),
      res
    );
  };

  private convertValidationErrorToCustomError = (
    err: ValidationError
  ): CustomError => {
    const errMessages = this.getValidationErrorMessages(err);

    switch (err.status) {
      case 400:
        return new CustomError(HttpErrorCode.BAD_REQUEST, err, ...errMessages);
      case 401:
        return new CustomError(HttpErrorCode.UNAUTHORIZED, err, ...errMessages);
      case 403:
        return new CustomError(HttpErrorCode.FORBIDDEN, err, ...errMessages);
      case 404:
        return new CustomError(HttpErrorCode.NOT_FOUND, err, ...errMessages);
      case 405:
        return new CustomError(
          HttpErrorCode.METHOD_NOT_ALLOWED,
          err,
          ...errMessages
        );
      case 406:
        return new CustomError(
          HttpErrorCode.NOT_ACCEPTABLE,
          err,
          ...errMessages
        );
      case 413:
        return new CustomError(
          HttpErrorCode.PAYLOAD_TOO_LARGE,
          err,
          ...errMessages
        );
      case 415:
        return new CustomError(
          HttpErrorCode.UNSUPPORTED_MEDIA_TYPE,
          err,
          ...errMessages
        );
      default:
        return new CustomError(
          HttpErrorCode.INTERNAL_ERROR,
          err,
          ...errMessages
        );
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
}
