export interface KeyValueRepository {
  set(key: string, value: string, expirationSeconds: number): Promise<void>;
  get(key: string): Promise<string>;
}
