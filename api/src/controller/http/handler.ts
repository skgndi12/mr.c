import { NextFunction, Request, Response } from 'express';

import { CustomError, HttpErrorCode } from '@src/error/errors';

import { HttpErrorResponse } from '@controller/http/response';

// TODO: https://github.com/MovieReviewComment/Mr.C/issues/49
export const methodNotAllowed = (
  req: Request,
  res: Response<HttpErrorResponse>,
  next: NextFunction
) => {
  const error = new CustomError({
    code: HttpErrorCode.METHOD_NOT_ALLOWED,
    message: `The ${req.method} for the "${req.originalUrl}" route is not allowed`
  });
  res.locals.error = error;
  res.status(405).send({
    messages: error.messages
  });
};
