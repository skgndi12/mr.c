export class CustomError extends Error {
  messages: string[];

  constructor(
    public type:
      | NotFoundErrorType
      | MethodNotAllowedErrorType
      | InternalErrorType,
    ...messages: string[]
  ) {
    super(messages[0]);
    this.messages = messages;
  }
}

export enum NotFoundErrorType {
  ROUTE_NOT_FOUND = 'ROUTE_NOT_FOUND',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  COMMENT_NOT_FOUND = 'COMMENT_NOT_FOUND',
  REVIEW_NOT_FOUND = 'REVIEW_NOT_FOUND',
  REPLY_NOT_FOUND = 'REPLY_NOT_FOUND'
}

export enum MethodNotAllowedErrorType {
  METHOD_NOT_ALLOWED = 'METHOD_NOT_ALLOWED'
}

export enum InternalErrorType {
  UNEXPECTED = 'UNEXPECTED'
}
