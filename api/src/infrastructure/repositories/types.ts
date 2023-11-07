export interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
}

export enum IsolationLevel {
  READ_UNCOMMITTED = 'ReadUncommitted',
  READ_COMMITTED = 'ReadCommitted',
  REPEATABLE_READ = 'RepeatableRead',
  SERIALIZABLE = 'Serializable'
}
