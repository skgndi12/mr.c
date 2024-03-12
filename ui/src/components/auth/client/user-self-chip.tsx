'use client';

import UserChip from '@/components/auth/client/user-chip';
import { UserchipSkeleton } from '@/components/skeletons';
import { useAuth } from '@/context/auth/auth-context';

export function UserSelfChip() {
  const { user } = useAuth();

  return user ? <UserChip nickname={user.nickname} tag={user.tag} /> : <UserchipSkeleton />;
}
