export class CustomError extends Error {
  messages: string[];

  constructor(public type: ErrorType, ...messages: string[]) {
    super(messages[0]);
    this.messages = messages;
  }
}

export type ErrorType =
  | BadRequestErrorType
  | UnauthorizedErrorType
  | ForbiddenErrorType
  | NotFoundErrorType
  | MethodNotAllowedErrorType
  | NotAcceptableErrorType
  | PayloadTooLargeErrorType
  | UnsupportedMediaErrorType
  | InternalErrorType;

// 400
export enum BadRequestErrorType {
  BAD_REQUEST = 'BAD_REQUEST'
}

// 401
export enum UnauthorizedErrorType {
  UNAUTHORIZED = 'UNAUTHORIZED'
}

// 403
export enum ForbiddenErrorType {
  FORBIDDEN = 'FORBIDDEN'
}

// 404
export enum NotFoundErrorType {
  ROUTE_NOT_FOUND = 'ROUTE_NOT_FOUND',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  COMMENT_NOT_FOUND = 'COMMENT_NOT_FOUND',
  REVIEW_NOT_FOUND = 'REVIEW_NOT_FOUND',
  REPLY_NOT_FOUND = 'REPLY_NOT_FOUND'
}

// 405
export enum MethodNotAllowedErrorType {
  METHOD_NOT_ALLOWED = 'METHOD_NOT_ALLOWED'
}

// 406
export enum NotAcceptableErrorType {
  NOT_ACCEPTABLE = 'NOT_ACCEPTABLE'
}

// 413
export enum PayloadTooLargeErrorType {
  PAYLOAD_TOO_LARGE = 'PAYLOAD_TOO_LARGE'
}

// 415
export enum UnsupportedMediaErrorType {
  UNSUPPORTED_MEDIA_TYPE = 'UNSUPPORTED_MEDIA_TYPE'
}

// 500
export enum InternalErrorType {
  UNEXPECTED = 'UNEXPECTED'
}
