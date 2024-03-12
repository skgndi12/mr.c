'use client';

import Text from '@/components/common/server/text';
import { useAuth } from '@/context/auth/auth-context';

export default function SignButton() {
  const { user, signOut, signIn, loading } = useAuth();

  const state = loading ? 'loading' : user ? 'signed-in' : 'signed-out';

  return (
    // TODO: better UI for loading state
    <div className="w-20">
      {state === 'loading' && null}
      {state === 'signed-in' && (
        <button onClick={() => void signOut()}>
          <Text size="lg" weight="medium">
            Sign Out
          </Text>
        </button>
      )}
      {state === 'signed-out' && (
        <button onClick={() => signIn()}>
          <Text size="lg" weight="medium">
            Sign In
          </Text>
        </button>
      )}
    </div>
  );
}
