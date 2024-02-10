'use client';

import Text from '@/components/atomic/text';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function SignButton({ isLoggedIn }: { isLoggedIn: boolean }) {
  const router = useRouter();

  if (isLoggedIn) {
    return (
      <button
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onClick={async () => {
          const res = await fetch('/api/v1/auth/sign-out');

          if (res.ok) {
            router.refresh();
          } else {
            // TODO: handle error - emit error toast ?
          }
        }}
      >
        <Text size="lg" weight="medium">
          Sign Out
        </Text>
      </button>
    );
  }

  return (
    <Link className="hover:cursor-pointer" href="/api/v1/google/sign-in">
      <Text size="lg" weight="medium">
        Sign In
      </Text>
    </Link>
  );
}
