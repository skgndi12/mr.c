type Idp = 'GOOGLE';

export type AccessLevel = 'USER' | 'DEVELOPER' | 'ADMIN';

export interface User {
  id: string; // uuid
  nickname: string; // "신비로운 평론가 붉은 여우"
  tag: string; // "MQ3B"
  idp: Idp;
  email: string;
  accessLevel: AccessLevel;
  createdAt: string;
  updatedAt: string;
}
