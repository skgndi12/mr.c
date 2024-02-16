import { User } from '@/lib/definitions/user';

export async function getUserSelf() {
  const response = await fetch('/api/v1/users/self');

  if (!response.ok) {
    return;
  }

  const data = (await response.json()) as { user: User };
  return data.user;
}

export async function fetchSignOut() {
  const response = await fetch('/api/v1/auth/sign-out');

  if (!response.ok) {
    // TODO: handle error
    throw new Error('fail to sign out');
  }
}

export function linkToSignIn() {
  window.location.href = '/api/v1/google/sign-in';
}
