import { CrockfordBase32 } from 'crockford-base32';
import seedrandom from 'seedrandom';

import { adjectives } from '@root/resource/nickname/adjectives.json';
import { animals } from '@root/resource/nickname/animals.json';
import { colors } from '@root/resource/nickname/colors.json';
import { jobs } from '@root/resource/nickname/jobs.json';

export function generateUserNickname(userId: string): string {
  const rand = seedrandom(userId);
  const adjectiveIdx = Math.floor(rand() * adjectives.length);
  const jobIdx = Math.floor(rand() * jobs.length);
  const colorIdx = Math.floor(rand() * colors.length);
  const animalIdx = Math.floor(rand() * animals.length);

  return `${adjectives[adjectiveIdx]} ${jobs[jobIdx]} ${colors[colorIdx]} ${animals[animalIdx]}`;
}

export function generateUserTag(userId: string): string {
  const userIdByteArray = Buffer.from(userId.replaceAll('-', ''), 'hex');
  const encodedUserId = CrockfordBase32.encode(userIdByteArray);

  return `#${encodedUserId.slice(0, 4)}`;
}
