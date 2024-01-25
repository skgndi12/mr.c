type Idp = 'google';

export type AccessLevel = 'USER' | 'DEVELOPER' | 'ADMIN';

interface User {
  id: string; // uuid
  nickname: string; // "신비로운 평론가 붉은 여우"
  tag: string; // "MQ3B"
  idp: Idp;
  accessLevel: AccessLevel;
}

export type GetUserDetailResponse = User;
