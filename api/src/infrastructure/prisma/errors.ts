export enum PrismaErrorCode {
  RECORD_NOT_FOUND = '2001',
  UNIQUE_CONSTRAINT_VIOLATION = '2002',
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
    typeof (error as Record<string, unknown>).code === 'string'
  );
}
