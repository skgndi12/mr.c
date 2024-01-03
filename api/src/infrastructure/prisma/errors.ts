export enum PrismaErrorCode {
  UNIQUE_CONSTRAINT_VIOLATION = 'P2002',
  RECORD_NOT_FOUND = 'P2025',
  TRANSACTION_CONFLICT = 'P2034'
}

export interface ErrorWithCode {
  code: string;
}

export function isErrorWithCode(error: unknown): error is ErrorWithCode {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof error.code === 'string'
  );
}
