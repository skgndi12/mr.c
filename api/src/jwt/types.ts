export interface JwtClientConfig {
  activeKeyPair: string;
  keyPairs: RsaKeyPair[];
  expirationHour: number;
}

export interface RsaKeyPair {
  name: string;
  private: string;
  public: string;
}

export type RsaKeyChain = {
  [id: string]: RsaKeyPair;
};
