import { NextFunction, Request, Response } from 'express';

import {
  CustomError,
  MethodNotAllowedErrorType
} from '@controller/http/errors';
import { HttpErrorResponse } from '@controller/http/response';

export const methodNotAllowed = (
  req: Request,
  res: Response<HttpErrorResponse>,
  next: NextFunction
) => {
  const error = new CustomError(
    MethodNotAllowedErrorType.METHOD_NOT_ALLOWED,
    `The ${req.method} for the "${req.originalUrl}" route is not allowed`
  );
  res.locals.error = error;
  res.status(405).send({
    type: error.type,
    messages: error.messages
  });
};
