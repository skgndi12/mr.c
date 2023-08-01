import { ErrorType } from '@controller/http/errors';

export interface HttpErrorResponse {
  type: ErrorType;
  messages: string[];
}
