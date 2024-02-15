'use client';

import Text from '@/components/atomic/text';
import { useAuth } from '@/context/auth-context';

export default function SignButton() {
  const { user, signOut, signIn } = useAuth();

  if (user) {
    return (
      <button
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onClick={async () => {
          await signOut();
        }}
      >
        <Text size="lg" weight="medium">
          Sign Out
        </Text>
      </button>
    );
  }

  return (
    <button onClick={() => signIn()}>
      <Text size="lg" weight="medium">
        Sign In
      </Text>
    </button>
  );
}
