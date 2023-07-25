import {
  InternalErrorType,
  MethodNotAllowedErrorType,
  NotFoundErrorType
} from '@controller/http/errors';

export interface HttpErrorResponse {
  type: NotFoundErrorType | InternalErrorType | MethodNotAllowedErrorType;
  messages: string[];
}
