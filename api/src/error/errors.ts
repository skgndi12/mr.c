export enum AppErrorCode {
  BAD_REQUEST,
  UNAUTHENTICATED,
  PERMISSIION_DENIED,
  NOT_FOUND,
  ALREADY_EXIST,
  INTERNAL_ERROR
}

export enum HttpErrorCode {
  BAD_REQUEST = 1000,
  UNAUTHORIZED,
  FORBIDDEN,
  NOT_FOUND,
  METHOD_NOT_ALLOWED,
  NOT_ACCEPTABLE,
  PAYLOAD_TOO_LARGE,
  UNSUPPORTED_MEDIA_TYPE,
  INTERNAL_ERROR
}

interface CustomErrorBuilder {
  code: AppErrorCode | HttpErrorCode;
  cause?: unknown;
  message?: string;
  messages?: string[];
  context?: Record<string, any>;
}

export class CustomError extends Error {
  public readonly code: AppErrorCode | HttpErrorCode;
  public readonly cause?: unknown;
  public readonly messages: string[];
  public readonly context?: Record<string, any>;

  constructor(builder: CustomErrorBuilder) {
    let messages;

    if (builder.message) {
      messages = [builder.message];
    } else if (builder.messages) {
      messages = builder.messages;
    } else {
      messages = ['Custom Error'];
    }

    super(messages[0]);
    this.code = builder.code;
    this.cause = builder.cause;
    this.messages = messages;
    this.context = builder.context;
  }

  public getHttpStatusCode = () => {
    switch (this.code) {
      // Application error
      case AppErrorCode.BAD_REQUEST:
        return 400;
      case AppErrorCode.UNAUTHENTICATED:
        return 401;
      case AppErrorCode.PERMISSIION_DENIED:
        return 403;
      case AppErrorCode.NOT_FOUND:
        return 404;
      case AppErrorCode.ALREADY_EXIST:
        return 409;
      case AppErrorCode.INTERNAL_ERROR:
        return 500;
      // HTTP error
      case HttpErrorCode.BAD_REQUEST:
        return 400;
      case HttpErrorCode.UNAUTHORIZED:
        return 401;
      case HttpErrorCode.FORBIDDEN:
        return 403;
      case HttpErrorCode.NOT_FOUND:
        return 404;
      case HttpErrorCode.METHOD_NOT_ALLOWED:
        return 405;
      case HttpErrorCode.NOT_ACCEPTABLE:
        return 406;
      case HttpErrorCode.INTERNAL_ERROR:
        return 500;
      default:
        return 500;
    }
  };
}
