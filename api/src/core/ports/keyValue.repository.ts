export interface KeyValueRepository {
  set(key: string, value: string, expirationSeconds: number): Promise<void>;
  get(key: string): Promise<string>;
  getThenDelete(key: string): Promise<string>;
}
